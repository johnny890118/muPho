import { DatabaseSync } from "node:sqlite";
import { SearchError } from "@/lib/providers/http";

const hour = 3_600_000;
const day = 24 * hour;
export const limits = {
  lyrics: { site: 12, daily: 36, visitor: 2, gap: 60_000 },
  tracks: { site: 60, daily: 240, visitor: 12, gap: 1100 },
  images: { site: 90, daily: 360, visitor: 20, gap: 1000 },
};

export class SearchBudget {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA busy_timeout=1500;
      PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS counts (key TEXT PRIMARY KEY, expires INTEGER, total INTEGER);
      CREATE TABLE IF NOT EXISTS locks (key TEXT PRIMARY KEY, owner TEXT, expires INTEGER);
      CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, expires INTEGER, body TEXT);
      CREATE TABLE IF NOT EXISTS provider (key TEXT PRIMARY KEY, next INTEGER);
      CREATE TABLE IF NOT EXISTS provider_failures (key TEXT PRIMARY KEY, expires INTEGER, code TEXT);
    `);
  }

  async run<T>(kind: keyof typeof limits, visitor: string, key: string | null, owner: string, perform: () => Promise<T>, network?: string): Promise<T> {
    const policy = limits[kind];
    const now = Date.now();
    const lease = 18_000;
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("DELETE FROM cache WHERE expires <= ?").run(now);
      this.db.prepare("DELETE FROM counts WHERE expires <= ?").run(now);
      this.db.prepare("DELETE FROM locks WHERE expires <= ?").run(now);
      const cached = key === null ? undefined : this.db.prepare("SELECT body FROM cache WHERE key = ?").get(key);
      if (cached) {
        const result = JSON.parse(String(cached.body)) as T;
        this.db.exec("COMMIT");
        return result;
      }
      const failure = this.db.prepare("SELECT code, expires FROM provider_failures WHERE key = ? AND expires > ?").get(kind, now);
      if (failure) throw new SearchError(failure.code === "upstream_limited" ? "upstream_limited" : "offline",
        Math.ceil((Number(failure.expires) - now) / 1000));
      const next = Number(this.db.prepare("SELECT next FROM provider WHERE key = ?").get(kind)?.next ?? 0);
      if (next > now) {
        const retry = Math.ceil((next - now) / 1000);
        throw new SearchError(retry > 3 ? "limited" : "busy", retry);
      }
      const active = this.db.prepare("SELECT key FROM locks WHERE key = ?").get(kind);
      if (active) throw new SearchError("busy", 2);
      const quotas: [string, number, number][] = [
        ["site-hour", hour, policy.site], ["site-day", day, policy.daily],
        [`visitor:${visitor}`, hour, policy.visitor], [`visitor:${visitor}:day`, day, policy.visitor * 3],
      ];
      if (network) quotas.push([`network:${network}`, hour, policy.visitor * 2]);
      for (const [scope, period, cap] of quotas) {
        const bucket = Math.floor(now / period);
        const expires = (bucket + 1) * period;
        const countKey = `${kind}:${scope}:${bucket}`;
        const result = this.db.prepare(`
          INSERT INTO counts VALUES (?, ?, 1)
          ON CONFLICT(key) DO UPDATE SET total = total + 1 WHERE total < ?
        `).run(countKey, expires, cap);
        if (!result.changes) throw new SearchError("limited", Math.ceil((expires - now) / 1000));
      }
      this.db.prepare("INSERT INTO locks VALUES (?, ?, ?)").run(kind, owner, now + lease);
      this.setCooldown(kind, now + policy.gap);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    try {
      const result = await perform();
      if (key !== null) this.db.prepare("INSERT OR REPLACE INTO cache VALUES (?, ?, ?)").run(key, Date.now() + hour, JSON.stringify(result));
      return result;
    } catch (error) {
      if (error instanceof SearchError && error.retrySeconds) {
        const expires = Date.now() + error.retrySeconds * 1000;
        this.db.prepare(`INSERT INTO provider_failures VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET expires = excluded.expires, code = excluded.code
          WHERE excluded.expires > provider_failures.expires`).run(kind, expires, error.code);
      }
      throw error;
    } finally {
      this.db.prepare("DELETE FROM locks WHERE key = ? AND owner = ?").run(kind, owner);
    }
  }

  close() {
    this.db.close();
  }

  private setCooldown(kind: keyof typeof limits, next: number) {
    this.db.prepare(`INSERT INTO provider VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET next = MAX(provider.next, excluded.next)`).run(kind, next);
  }
}
