import Image from "next/image";
import searchImg from "@/styles/icons8-search.svg";
import { useEffect, useState } from "react";

const Search = ({ search, setInput, searchMupho }) => {
  const [muphoSelect, setMuphoSelect] = useState("Photo");
  const [searchOnclick, setSearchOnclick] = useState(false);
  const [muphoBg, setMuphoBg] = useState(
    "/fidel-fernando-GuH4_xtKnnM-unsplash.jpg"
  );

  const inputHandler = (e) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    if (muphoSelect === "Photo") {
      setMuphoBg("/fidel-fernando-GuH4_xtKnnM-unsplash.jpg");
    } else if (muphoSelect === "MuPho") {
      setMuphoBg("/wes-hicks-MEL-jJnm7RQ-unsplash.jpg");
    }
    if (muphoSelect === "Photo" && searchOnclick) {
      search();
      setSearchOnclick(false);
    } else if (muphoSelect === "MuPho" && searchOnclick) {
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
    >
      <div className="flex justify-center items-center mx-8 sm:w-[55vh]">
        <h1 className="sm:text-4xl font-bold text-2xl text-white">
          讓音樂與相片結合在您生活中的每個角落。
        </h1>
      </div>
      <div className="search flex justify-center items-center py-12">
        {/* <select
          className="chooseSel sm:w-[15vh] w-[14vh] text-center sm:text-lg h-[8vh]"
          value={muphoSelect}
          onChange={muphoSelectHandler}
        >
          <option value="photo">Photo</option>
          <option value="mupho">MuPho</option>
        </select> */}
        <button className="dropdown chooseSel inline-block relative h-[8vh] sm:w-[15vh] w-[14vh]">
          <div className=" bg-transparent font-semibold py-2 px-4 rounded inline-flex items-center">
            <span className="mr-1 text-xl">{muphoSelect}</span>
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />{" "}
            </svg>
          </div>
          <ul className="dropdown-menu absolute hidden pt-5">
            <li
              className="rounded-t-lg py-3 px-9 block whitespace-no-wrap"
              onClick={() => setMuphoSelect("Photo")}
            >
              Photo
            </li>
            <li
              className="rounded-b-lg py-3 px-9 block whitespace-no-wrap"
              onClick={() => setMuphoSelect("MuPho")}
            >
              MuPho
            </li>
          </ul>
        </button>
        <input
          className="input sm:w-[30vh] w-[20vh] sm:text-lg h-[8vh] outline-none rounded-none"
          onChange={inputHandler}
          type="text"
          placeholder="搜尋相片"
        />
        <button
          className="searchBtn sm:w-[12vh] w-[8vh] h-[8vh]"
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
