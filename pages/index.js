import React, { useState, useEffect, useRef } from "react";
import Search from "@/components/Search";
import axios from "axios";
import Picture from "@/components/Picture";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import { api } from "@/api";

const Home = () => {
  const [input, setInput] = useState("");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isOverSearchArea, setIsOverSearchArea] = useState(false);

  const searchKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const nextDivRef = useRef(null);

  const btnToInputHandler = () => {
    searchInputRef.current.focus();
  };

  const resetSearch = () => {
    setInput("");
    setCurrentSearch("");
    setData([]);
  };

  const searchPhoto = async (url) => {
    try {
      setIsFetching(true);

      const result = await axios.get(url, {
        headers: { Authorization: searchKey },
      });

      setData(result.data.photos);
      setCurrentSearch(input);

      if (nextDivRef.current && input) {
        nextDivRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      resetSearch();
      console.log("Error fetching photos:", e);
    } finally {
      setIsFetching(false);
    }
  };

  const getAiKeywords = async (input) => {
    try {
      const { data } = await axios.post("/api/chat", { message: input });
      return data.content;
    } catch (e) {
      console.log("Error fetching AI keywords:", e);
      return "love couple separate";
    }
  };

  const searchMupho = async (input) => {
    try {
      setIsFetching(true);

      const keywords = await getAiKeywords(input);
      const searchUrl = api.getSearchPhoto(keywords);

      await searchPhoto(searchUrl);
    } catch (e) {
      console.log("Error in searchMupho:", e);
    }
  };

  const morePicture = async () => {
    let newURL;
    setPage(page + 1);
    if (currentSearch === "") {
      newURL = api.getHotPhoto(page + 1);
    } else {
      newURL = api.getSearchPhoto(currentSearch, page + 1);
    }
    let result = await axios.get(newURL, {
      headers: { Authorization: searchKey },
    });
    setData((prev) => prev.concat(result.data.photos));
  };

  useEffect(() => {
    searchPhoto(api.getHotPhoto());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (searchRef.current) {
        const searchBottom = searchRef.current.getBoundingClientRect().bottom;
        setIsOverSearchArea(searchBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Layout btnToInputHandler={btnToInputHandler} isOverSearchArea={isOverSearchArea}>
      <div style={{ minHeight: "100vh" }}>
        <Search
          searchRef={searchRef}
          searchInputRef={searchInputRef}
          searchPhoto={() => {
            searchPhoto(input ? api.getSearchPhoto(input) : api.getHotPhoto());
          }}
          searchMupho={() => {
            searchMupho(input);
          }}
          setInput={setInput}
        />

        <div className="p-4 sm:p-8 flex flex-col gap-8 w-full mt-4 sm:mt-0">
          <p className="text-lg sm:text-2xl">{`關於「${currentSearch || "熱門圖片"}」的圖片`}</p>
          {isFetching ? (
            <Loading />
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 2xl:columns-5" ref={nextDivRef}>
              {data &&
                data.length > 0 &&
                data.map((d, index) => {
                  return <Picture data={d} key={index} />;
                })}
            </div>
          )}
        </div>

        <div className="flex justify-center items-center pb-8">
          <button
            className="bg-[#c3c0db] text-[#5e5b78] w-4/5 p-4 rounded-xl text-base"
            onClick={morePicture}
          >
            load more
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
