import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { searchBg } from "@/constants";

const Search = ({ search, setInput, searchMupho, btnToTop, btnToInput }) => {
  const [muphoSelect, setMuphoSelect] = useState("Photo");
  const [searchOnclick, setSearchOnclick] = useState(false);
  const [muphoBg, setMuphoBg] = useState(searchBg.Photo);

  useEffect(() => {
    setMuphoBg(searchBg[muphoSelect]);

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
      className="searchGroup flex flex-col justify-center h-[80vh] w-full bg-center items-center mb-8 gap-8 p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${muphoBg})`,
      }}
      ref={btnToTop}
    >
      <h1 className="md:text-4xl font-bold text-2xl text-white">
        讓音樂與相片結合在您生活中的每個角落
      </h1>
      <div className="flex justify-between items-center rounded-xl bg-white p-1">
        <Select onValueChange={(value) => setMuphoSelect(value)}>
          <SelectTrigger className="rounded-xl p-3 bg-[#c3c0db] text-[#5e5b78] h-full text-base border-none focus:ring-0">
            <SelectValue placeholder={muphoSelect} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Photo">Photo</SelectItem>
            <SelectItem value="MuPho">MuPho</SelectItem>
          </SelectContent>
        </Select>
        <input
          className="p-2 outline-none w-36 sm:w-52"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearchOnclick(true);
            }
          }}
          type="text"
          placeholder="搜尋相片"
          ref={btnToInput}
        />
        <button
          className="rounded-xl p-3 bg-[#c3c0db] text-[#5e5b78] h-full"
          onClick={() => {
            setSearchOnclick(true);
          }}
        >
          <FaSearch />
        </button>
      </div>
    </div>
  );
};

export default Search;
