import Nav from "@/components/Nav";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div>
      <main>
        <Nav />
        <div>{children}</div>
        <Footer />
      </main>
    </div>
  );
}
