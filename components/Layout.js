import Nav from "@/components/Nav";
import Footer from "./Footer";

export default function Layout({ children, btnToInputHandler, isOverSearchArea }) {
  return (
    <div>
      <main>
        <Nav btnToInputHandler={btnToInputHandler} isOverSearchArea={isOverSearchArea} />
        <div>{children}</div>
        <Footer />
      </main>
    </div>
  );
}
