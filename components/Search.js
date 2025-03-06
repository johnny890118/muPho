import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { searchAreaSettings } from "@/constants";

const Search = ({ searchPhoto, setInput, searchMupho, searchRef, searchInputRef }) => {
  const [muphoSelect, setMuphoSelect] = useState("Photo");
  const [searchOnclick, setSearchOnclick] = useState(false);
  const [muphoBg, setMuphoBg] = useState("");

  useEffect(() => {
    if (muphoSelect === "Photo" && searchOnclick) {
      searchPhoto();
      setSearchOnclick(false);
    } else if (muphoSelect === "MuPho" && searchOnclick) {
      searchMupho();
      setSearchOnclick(false);
    }
  }, [muphoSelect, searchOnclick]);

  useEffect(() => {
    const foundSetting = searchAreaSettings.find(({ name }) => name === muphoSelect);
    setMuphoBg(foundSetting?.backgroundImg || searchAreaSettings[0].backgroundImg);
  }, [muphoSelect, searchAreaSettings]);

  return (
    <div
      className="searchGroup flex justify-center h-[80vh] w-full bg-center items-center p-4 sm:rounded-b-3xl"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0)), url(${muphoBg})`,
      }}
      ref={searchRef}
    >
      <div className="flex flex-col gap-10">
        <h1 className="text-3xl sm:text-4xl text-white">讓音樂與相片結合在您生活中的每個角落。</h1>
        <div className="flex justify-between items-center rounded-xl bg-white p-1 h-14">
          <Select onValueChange={(value) => setMuphoSelect(value)}>
            <SelectTrigger className="rounded-xl p-3 bg-[#c3c0db] text-[#5e5b78] h-full text-base border-none focus:ring-0 max-w-24">
              <SelectValue placeholder={muphoSelect} />
            </SelectTrigger>
            <SelectContent>
              {searchAreaSettings.map(({ id, name }) => (
                <SelectItem key={id} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            className="p-2 outline-none flex-1"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchOnclick(true);
              }
            }}
            type="text"
            placeholder={
              searchAreaSettings.find(({ name }) => name === muphoSelect).placeholder || "搜尋圖片"
            }
            ref={searchInputRef}
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
    </div>
  );
};

export default Search;
