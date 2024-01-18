import Image from "next/image";
import searchImg from "@/styles/search.png";
import { useEffect, useState } from "react";

const Search = ({ search, setInput, searchMupho, btnToTop, btnToInput }) => {
  const [muphoSelect, setMuphoSelect] = useState("photo");
  const [searchOnclick, setSearchOnclick] = useState(false);
  const [muphoBg, setMuphoBg] = useState(
    "/fidel-fernando-GuH4_xtKnnM-unsplash.jpg"
  );

  const inputHandler = (e) => {
    setInput(e.target.value);
  };

  const muphoSelectHandler = (e) => {
    setMuphoSelect(e.target.value);
  };

  useEffect(() => {
    if (muphoSelect === "photo") {
      setMuphoBg("/fidel-fernando-GuH4_xtKnnM-unsplash.jpg");
    } else if (muphoSelect === "mupho") {
      setMuphoBg("/wes-hicks-MEL-jJnm7RQ-unsplash.jpg");
    }
    if (muphoSelect === "photo" && searchOnclick) {
      search();
      setSearchOnclick(false);
    } else if (muphoSelect === "mupho" && searchOnclick) {
      searchMupho();
      setSearchOnclick(false);
    }
  }, [muphoSelect, searchOnclick, muphoBg]);

  return (
    <div
      className={`searchGroup flex flex-col justify-center h-[80vh] w-full bg-center items-center mb-8`}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${muphoBg})`,
      }}
      ref={btnToTop}
    >
      <div className="flex justify-center items-center mx-8 sm:w-[55vh]">
        <h1 className="sm:text-4xl font-bold text-2xl text-white">
          讓音樂與相片結合在您生活中的每個角落。
        </h1>
      </div>
      <div className="search flex justify-center items-center py-12">
        <select
          className="chooseSel sm:w-[15vh] w-[11vh] text-center sm:text-lg h-[8vh]"
          value={muphoSelect}
          onChange={muphoSelectHandler}
        >
          <option value="photo">Photo</option>
          <option value="mupho">MuPho</option>
        </select>
        <input
          className="input sm:w-[30vh] w-[18vh] sm:text-lg h-[8vh] outline-none rounded-none"
          onChange={inputHandler}
          type="text"
          placeholder="搜尋相片"
          ref={btnToInput}
        />
        <button
          className="searchBtn sm:w-[12vh] w-[7vh] h-[8vh]"
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
