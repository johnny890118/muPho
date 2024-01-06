import Image from "next/image";

const Picture = ({ data }) => {
  return (
    <div className="picture">
      <p>{data.photographer}</p>
      <div className="imageContainer">
        <Image
          src={data.src && data.src.large}
          alt=""
          className="imgImg"
          width={400}
          height={900}
        />
      </div>
      <button className="download">
        <a target="_blank" href={data.src && data.src.large} rel="noreferrer">
          下載
        </a>
      </button>
    </div>
  );
};

export default Picture;
