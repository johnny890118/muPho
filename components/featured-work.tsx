const works = [
  {
    id: "163410225", song: "Here Comes the Sun — The Beatles",
    file: "Lake_Baikal,_Maloye_More_Strait_at_sunrise,_Baikal,_Russia.jpg", hash: "5/59",
    author: "Vyacheslav Argenberg", alt: "貝加爾湖的水面與日出時的雲層",
  },
  {
    id: "151714609", song: "夜曲 — 周杰倫", file: "Night_Rainy_View.jpg", hash: "e/e2",
    author: "S.M.M.Musabbir Uddin", alt: "雨夜的城市街道",
  },
  {
    id: "164296023", song: "Dreams — Fleetwood Mac",
    file: "Olkhon_Island,_Capes,_cliffs_at_sunset,_Lake_Baikal,_Russia.jpg", hash: "4/47",
    author: "Vyacheslav Argenberg", alt: "暮色落在湖邊的懸崖",
  },
];

export function FeaturedWorks({ blockedIds }: { blockedIds: string[] }) {
  const visible = works.filter((work) => !blockedIds.includes(work.id));
  if (!visible.length) return null;
  return (
    <section className="mx-auto max-w-[100rem] px-5 pt-7 pb-10 sm:px-8">
      <h2 className="mb-4 flex items-center gap-4 font-display text-xl sm:text-2xl">來自歌曲的畫面<span aria-hidden="true" className="h-px w-10 bg-primary/70" /></h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {visible.map((work) => {
          const file = encodeURIComponent(work.file);
          const source = `https://commons.wikimedia.org/wiki/File:${file}`;
          const thumbnail = `https://thumb.wikimedia.org/wikipedia/commons/thumb/${work.hash}/${file}/960px-${file}`;
          return (
            <figure key={work.id} className="overflow-hidden rounded-md bg-card">
              <a href={source} target="_blank" rel="noreferrer" className="block focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- Display a Commons thumbnail without an optimization service. */}
                <img src={thumbnail} alt={work.alt} width={640} height={400} loading="lazy" decoding="async"
                  className="aspect-[8/5] w-full bg-secondary object-cover" />
              </a>
              <figcaption className="space-y-1 p-3">
                <p className="font-display text-base">{work.song}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <a href={source} target="_blank" rel="noreferrer" className="underline">{work.author}</a>
                  {" · "}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY 4.0</a>
                  {" · 裁切呈現"}
                </p>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
