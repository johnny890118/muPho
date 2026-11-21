import holdout from "./fixtures/lyrics-holdout.json";
import { setTimeout as wait } from "node:timers/promises";
import { findWorks } from "../lib/providers/commons";
import { analyzeLyrics, groqKey, model, promptVersion } from "../lib/providers/groq";

// Original lyrics. No user or third-party lyrics are used by this tool.
const samples = [
  ["zh", "雨打著玻璃，我在空房裡等你\n門外只有風，晚餐慢慢冷了\n直到鄰居提著燈來問我明天要不要散步\n我把鞋放到門前，第一次盼望天亮"],
  ["en", "I was afraid at sea, gripping the deck rail.\nThe wind fell, and the horizon opened.\nI let the boat drift and matched my breath to the swell.\nFor the first time, I felt at peace."],
  ["en-reversal", "I was at peace at sea, watching the open horizon.\nThen the waves swallowed the harbour lights.\nThe radio went quiet and I gripped the deck rail.\nI was afraid to put my hand in the water."],
  ["ja", "雪の駅で切符を握り、帰る君を待っていた。\nけれど最後の列車にも君はいない。\n手を開くと、切符に雪が積もった。\nもう会えないことが悲しかった。"],
  ["ko", "빈 골목을 혼자 걷다가 가로등 아래 멈췄어.\n닫힌 문 앞에서 울고 있었어.\n친구들이 모퉁이를 돌아 내 손을 잡았어.\n함께 웃으며 젖은 거리를 뛰었어."],
] as const;

async function main() {
  const id = process.argv[2];
  const fresh = holdout.find((item) => item.id === id);
  const sample = samples.find(([name]) => name === id) ?? (fresh ? [fresh.id, fresh.lyrics] : undefined);
  const token = groqKey();
  if (!sample || !token) throw new Error("Configure verified Free/ZDR credentials and specify zh, en, en-reversal, ja, ko, or new-zh/new-en/new-ja/new-ko. Run one case per minute.");
  const contact = process.env.MUPHO_PROVIDER_CONTACT;
  if (!contact || !/^https:\/\/[^\s]+$/.test(contact)) throw new Error("Set a valid MUPHO_PROVIDER_CONTACT.");
  const started = Date.now();
  const directions = await analyzeLyrics(sample[1], token, undefined, (event) => console.error(JSON.stringify({ id, diagnostic: event })));
  console.log(JSON.stringify({ id, model, promptVersion, elapsedMs: Date.now() - started, expected: fresh?.expected, directions }));
  const agent = `MuPho/0.2 (${contact})`;
  for (const media of ["photo", "illustration"] as const) {
    for (const [index, direction] of directions.entries()) {
      const q = direction[media];
      const batch = await findWorks(q, media, 0, agent, new Set());
      console.log(JSON.stringify({ id, media, direction: index + 1, q, count: batch.works.length, status: batch.status,
        top: batch.works.slice(0, 3).map(({ title, author, source, thumbnail, license }) => ({ title, author, source, thumbnail, license })) }));
      await wait(1350);
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Live check failed");
  process.exitCode = 1;
});
