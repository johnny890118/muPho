import { SearchBudget } from "../../lib/search-budget";
import { SearchError } from "../../lib/providers/http";

const [file, visitor, key, time, hold] = process.argv.slice(2);
Date.now = () => Number(time);
const store = new SearchBudget(file);

async function main() {
  try {
    await store.run("images", visitor, key, String(process.pid), async () => {
      const release = hold === "true" ? new Promise<void>((resolve) => process.once("message", () => resolve())) : undefined;
      process.send?.("upstream");
      await release;
      return "ok";
    });
    process.send?.("ok");
  } catch (error) {
    process.send?.(error instanceof SearchError ? error.code : "unexpected");
  } finally {
    store.close();
    process.disconnect?.();
  }
}

void main();
