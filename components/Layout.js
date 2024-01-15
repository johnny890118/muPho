import Nav from "@/components/Nav";
import Footer from "./Footer";

export default function Layout({ children, btnToInputHandler }) {
  return (
    <div>
      <main>
        <Nav btnToInputHandler={btnToInputHandler} />
        <div>{children}</div>
        <Footer />
      </main>
    </div>
  );
}
