import Link from "next/link";

const Nav = () => {
  return (
    <div className="z-50 sticky top-0 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      <nav className="h-[7vh]">
        <ul className="flex justify-between mx-4 sm:mx-8 items-center h-[7vh]">
          <div className="logo px-4">
            <h1 className="text-2xl font-bold">MuPho</h1>
          </div>
          <div className="bar flex">
            <li className="rounded-md">
              <Link
                href="/"
                className="text-lg w-[8vh] h-[5vh] text-center leading-[5vh]"
              >
                Home
              </Link>
            </li>
            <li className="rounded-md">
              <Link
                href="/AI"
                className="text-lg w-[8vh] h-[5vh] text-center leading-[5vh]"
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
