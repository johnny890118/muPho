import Image from "next/image";
import searchImg from "@/styles/icons8-search.svg";
import { useEffect, useState } from "react";

const Search = ({ search, setInput, handleButtonClick, searchMupho }) => {
  const [muphoSelect, setMuphoSelect] = useState("photo");
  const [searchOnclick, setSearchOnclick] = useState(false);

  const inputHandler = (e) => {
    setInput(e.target.value);
  };

  const muphoSelectHandler = (e) => {
    setMuphoSelect(e.target.value);
  };

  useEffect(() => {
    console.log("muphoSelect", muphoSelect, "searchOnclick", searchOnclick);
    if (muphoSelect === "photo" && searchOnclick) {
      search();
      handleButtonClick();
      setSearchOnclick(false);
    } else if (muphoSelect === "mupho" && searchOnclick) {
      searchMupho();
      handleButtonClick();
      setSearchOnclick(false);
    }
  }, [muphoSelect, searchOnclick]);

  return (
    <div className="searchGroup">
      <div className="title">
        <h1 className="sm:text-4xl font-bold text-2xl">
          讓音樂與相片結合在您生活中的每個角落。
        </h1>
      </div>
      <div className="search">
        <select
          className="chooseSel sm:w-[12vh] w-[13vh] text-center sm:text-xl"
          value={muphoSelect}
          onChange={muphoSelectHandler}
        >
          <option value="photo">Photo</option>
          <option value="mupho">MuPho</option>
        </select>
        <input
          className="input sm:w-[30vh] w-[20vh] sm:text-xl"
          onChange={inputHandler}
          type="text"
          placeholder="搜尋相片"
        />
        <button
          className="searchBtn sm:w-[12vh] w-[8vh]"
          // onClick={() => {
          //   if (muphoSelect === "photo") {
          //     search();
          //     handleButtonClick();
          //   } else {
          //     searchMupho();
          //     handleButtonClick();
          //   }
          // }}
          onClick={() => {
            setSearchOnclick(true);
          }}
        >
          <Image
            src={searchImg}
            alt=""
            width={20}
            height={20}
            className="sm:w-6"
          />
        </button>
      </div>
    </div>
  );
};

export default Search;
