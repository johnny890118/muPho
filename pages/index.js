import React, { useState, useEffect, useRef } from "react";
import Search from "@/components/Search";
import axios from "axios";
import Picture from "@/components/Picture";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";

const Home = () => {
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isOverSearchArea, setIsOverSearchArea] = useState(false);

  const searchKey = "RuTjVz8Ruba0yDd1SA80Hk6aEdFeAbmIlunpOmxDtiegSPiqG1uXTeEx";
  const initialURL = "https://api.pexels.com/v1/curated?page=1&per_page=15";
  const searchURL = `https://api.pexels.com/v1/search?query=${input}&per_page=15&page=1`;

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const nextDivRef = useRef(null);

  const btnToInputHandler = () => {
    searchInputRef.current.focus();
  };

  const searchMupho = async (input) => {
    try {
      setIsFetching(true);
      const response = await axios.get("http://192.168.105.142:1487/get_lyrics", {
        params: { songName: input },
      });
      let keywords = response.data.choices[0].message.content;
      console.log(keywords);
      let result = await axios.get(
        `https://api.pexels.com/v1/search?query=${keywords}&per_page=15&page=1`,
        {
          headers: { Authorization: searchKey },
        }
      );
      setData(result.data.photos);
      setCurrentSearch(keywords);
      if (nextDivRef.current) {
        nextDivRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      console.log("歌詞無法找到。");
    }
  };

  const search = async (url) => {
    if (input === "") {
      setIsFetching(true);
      let result = await axios.get(initialURL, {
        headers: { Authorization: searchKey },
      });
      setData(result.data.photos);
      setCurrentSearch(input);
      setIsFetching(false);
    } else {
      setIsFetching(true);
      let result = await axios.get(url, {
        headers: { Authorization: searchKey },
      });
      setData(result.data.photos);
      setCurrentSearch(input);
      if (nextDivRef.current) {
        nextDivRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setIsFetching(false);
    }
  };

  const morePicture = async () => {
    let newURL;
    setPage(page + 1);
    if (currentSearch === "") {
      newURL = `https://api.pexels.com/v1/curated?page=${page + 1}&per_page=15`;
    } else {
      newURL = `https://api.pexels.com/v1/search?query=${currentSearch}&per_page=15&page=${
        page + 1
      }`;
    }
    let result = await axios.get(newURL, {
      headers: { Authorization: searchKey },
    });
    setData(data.concat(result.data.photos));
  };

  useEffect(() => {
    search(initialURL);
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
          search={() => {
            search(searchURL);
          }}
          searchMupho={() => {
            searchMupho(input);
          }}
          setInput={setInput}
        />

        <div className="p-4 sm:p-8 flex flex-col gap-8 w-full mt-4 sm:mt-0">
          <p className="sm:text-2xl">{`關於「${
            currentSearch ? currentSearch : "熱門圖片"
          }」的圖片`}</p>
          {isFetching ? (
            <Loading />
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4" ref={nextDivRef}>
              {data?.map((d, index) => {
                return <Picture data={d} key={index} />;
              })}
            </div>
          )}
        </div>

        <div className="morePicture">
          <button onClick={morePicture}>load more</button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
