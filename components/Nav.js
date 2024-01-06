import Link from "next/link";

const Nav = () => {
  return (
    <div>
      <nav className="h-[8vh] z-50 sticky top-0">
        <ul className="flex justify-between mx-4 sm:mx-8 items-center h-[8vh]">
          <div className="logo px-4">
            <h1 className="text-2xl font-bold">MuPho</h1>
          </div>
          <div className="bar flex">
            <li className="rounded-md">
              <Link
                href="/"
                className="text-lg w-[10vh] h-[6vh] text-center leading-[6vh]"
              >
                Home
              </Link>
            </li>
            <li className="rounded-md">
              <Link
                href="/AI"
                className="text-lg w-[10vh] h-[6vh] text-center leading-[6vh]"
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
