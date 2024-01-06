import Image from "next/image";
import searchImg from "@/styles/icons8-search.svg";

const Search = ({ search, setInput }) => {
  const inputHandler = (e) => {
    setInput(e.target.value);
  };
  return (
    <div className="searchGroup">
      <div className="title">
        <h1 className="sm:text-4xl font-bold text-2xl">
          讓音樂與相片結合在您生活中的每個角落。
        </h1>
      </div>
      <div className="search">
        {/* <button className="chooseBtn">Photo</button> */}
        <select className="chooseSel sm:w-[18vh] w-[13vh] text-center sm:text-xl">
          <option value="Photo">Photo</option>
          <option value="Mupho">MuPho</option>
        </select>
        <input
          className="input sm:w-[40vh] w-[25vh]"
          onChange={inputHandler}
          type="text"
          placeholder="搜尋相片"
        />
        <button className="searchBtn sm:w-[18vh] w-[8vh]" onClick={search}>
          <Image src={searchImg} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
};

export default Search;
