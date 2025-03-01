import "@/styles/globals.css";
import "@/styles/_search.scss";
import "@/styles/style.scss";
import "@/styles/loading.scss";
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
