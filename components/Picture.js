import Image from "next/image";
import { MdOutlineFileDownload } from "react-icons/md";

const Picture = ({ data }) => {
  return (
    <div className="relative mb-4 group">
      <Image
        src={data.src && data.src.large}
        alt=""
        className="rounded-3xl"
        width={400}
        height={900}
      />

      <div className="absolute inset-0 flex flex-col justify-between bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl p-4">
        <p className="text-gray-200">{data.photographer}</p>
        <div className="flex justify-end">
          <a
            target="_blank"
            href={data.src && data.src.large}
            rel="noreferrer"
            className="bg-gray-200 rounded-full p-2 hover:bg-white transition"
          >
            <MdOutlineFileDownload className="size-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Picture;
