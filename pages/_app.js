import "@/styles/globals.css";
import "@/styles/_footer.scss";
import "@/styles/_picture.scss";
import "@/styles/_search.scss";
import "@/styles/style.scss";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>MuPho</title>
        <link rel="icon" href="/mpIcon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
