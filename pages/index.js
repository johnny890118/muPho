import React, { useState, useEffect, useRef } from "react";
import Search from "@/components/Search";
import axios from "axios";
import Picture from "@/components/Picture";
import Layout from "@/components/Layout";

const Home = () => {
  let [input, setInput] = useState("");
  let [data, setData] = useState(null);
  let [page, setPage] = useState(1);
  let [currentSearch, setCurrentSearch] = useState("");
  const auth = "RuTjVz8Ruba0yDd1SA80Hk6aEdFeAbmIlunpOmxDtiegSPiqG1uXTeEx";
  const initialURL = "https://api.pexels.com/v1/curated?page=1&per_page=15";
  let searchURL = `https://api.pexels.com/v1/search?query=${input}&per_page=15&page=1`;

  const searchMupho = async (input) => {
    try {
      const response = await axios.get(
        `http://192.168.50.126:9457/get_lyrics`,
        {
          params: { songName: input },
        }
      );
      console.log(response.data.lyrics);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      console.log("歌詞無法找到。");
    }
  };

  const search = async (url) => {
    if (input === "") {
      let result = await axios.get(initialURL, {
        headers: { Authorization: auth },
      });
      setData(result.data.photos);
      setCurrentSearch(input);
    } else {
      let result = await axios.get(url, {
        headers: { Authorization: auth },
      });
      setData(result.data.photos);
      setCurrentSearch(input);
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
      headers: { Authorization: auth },
    });
    setData(data.concat(result.data.photos));
  };

  useEffect(() => {
    search(initialURL);
  }, []);

  const nextDivRef = useRef(null);

  const handleButtonClick = () => {
    if (nextDivRef.current) {
      nextDivRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Layout>
      <div style={{ minHeight: "100vh" }}>
        <Search
          search={() => {
            search(searchURL);
          }}
          searchMupho={() => {
            searchMupho(input);
          }}
          setInput={setInput}
          handleButtonClick={handleButtonClick}
        />
        <div className="pictures" ref={nextDivRef}>
          {data &&
            data.map((d, index) => {
              return <Picture data={d} key={index} />;
            })}
        </div>
        <div className="morePicture">
          <button onClick={morePicture}>load more</button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
