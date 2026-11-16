const source = "https://commons.wikimedia.org/wiki/File:Lake_Baikal,_Maloye_More_Strait_at_sunrise,_Baikal,_Russia.jpg";
const thumbnail = "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Lake_Baikal%2C_Maloye_More_Strait_at_sunrise%2C_Baikal%2C_Russia.jpg/960px-Lake_Baikal%2C_Maloye_More_Strait_at_sunrise%2C_Baikal%2C_Russia.jpg";
export const featuredWorkId = "163410225";

export function FeaturedWork() {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card">
      <a href={source} target="_blank" rel="noreferrer" className="block focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- Use a Commons thumbnail with the original aspect ratio. */}
        <img src={thumbnail} alt="貝加爾湖的水面與日出時的雲層" width={640} height={425} decoding="async"
          className="aspect-[640/425] h-auto w-full" />
      </a>
      <figcaption className="space-y-1 p-3 sm:p-4">
        <p className="text-xs text-primary">歌曲選圖示範</p>
        <p className="text-sm font-medium">Here Comes the Sun — The Beatles</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          <a href={source} target="_blank" rel="noreferrer" className="underline">© Vyacheslav Argenberg</a>
          {" · "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY 4.0</a>
        </p>
      </figcaption>
    </figure>
  );
}
