import Link from "next/link";
import mpLogo from "@/styles/mpLogo.drawio.png";
import Image from "next/image";

const Nav = () => {
  return (
    <div className="z-50 sticky top-0 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      <nav className="h-[8vh]">
        <ul className="flex justify-between mx-4 sm:mx-8 items-center h-[8vh]">
          <div className="logo px-4 flex items-center justify-center">
            <Image
              src={mpLogo}
              className="h-[7vh] w-[7vh] muLogo"
              alt=""
            ></Image>
            <h1 className="text-2xl font-bold leading-[6vh] ml-2">MuPho</h1>
          </div>
          <div className="bar flex">
            <li className="rounded-md m-1">
              <Link
                href="/"
                className="text-lg w-[9vh] h-[6vh] text-center leading-[6vh]"
              >
                Home
              </Link>
            </li>
            <li className="rounded-md m-1">
              <Link
                href="/AI"
                className="text-lg w-[9vh] h-[6vh] text-center leading-[6vh]"
              >
                AI
              </Link>
            </li>
          </div>
        </ul>
      </nav>
    </div>
  );
};

export default Nav;
