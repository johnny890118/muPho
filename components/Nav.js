import React, { useState } from "react";
import Link from "next/link";
import mpLogo from "@/public/mpLogo.drawio.png";
import mpName from "@/public/muphoName.png";
import searchImg from "@/styles/search.png";
import Image from "next/image";

const Nav = ({ btnToInputHandler }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-[#c3c0db] shadow-[0_3px_10px_rgb(0,0,0,0.2)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center md:justify-start md:space-x-10 h-[8vh]">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/">
                <div className="logo px-4 flex items-center justify-center">
                  <Image
                    src={mpLogo}
                    className="h-[6vh] w-[6vh]"
                    alt=""
                  ></Image>
                  <Image src={mpName} className="h-[6vh] w-auto" alt=""></Image>
                </div>
              </Link>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <button
                type="button"
                className="bg-[#c3c0db] rounded-md p-2 inline-flex items-center justify-center text-[5e5b78] hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setOpen(!open)}
              >
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            <nav className="hidden md:flex space-x-10">
              <Link
                href="/"
                className="text-base font-medium text-[#5e5b78] hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                href="/ai"
                className="text-base font-medium text-[#5e5b78] hover:text-gray-900"
              >
                AI
              </Link>
            </nav>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <button onClick={btnToInputHandler}>
                <Image
                  src={searchImg}
                  alt=""
                  className="h-[3vh] w-[3vh] text-white"
                />
              </button>
              <Link
                href="/"
                className="ml-8 whitespace-nowrap text-base font-medium text-[#5e5b78] hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/"
                className="ml-8 whitespace-nowrap px-3 py-2 rounded-md text-base text-white bg-[#5e5b78] hover:bg-[#797691] font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <div
          className={
            open
              ? "opacity-100 scale-100 transition ease-out duration-200 absolute top-0 inset-x-0 p-2 transform origin-top-right md:hidden pointer-events-auto visible"
              : "opacity-0 scale-95 absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden pointer-events-none invisible"
          }
        >
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <Image
                    src={mpLogo}
                    className="h-[6vh] w-[6vh]"
                    alt=""
                  ></Image>
                </div>
                <div className="-mr-2">
                  <button
                    type="button"
                    className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    onClick={() => setOpen(!open)}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  <button
                    className="text-start ml-3 text-base font-medium text-gray-900"
                    onClick={() => {
                      btnToInputHandler();
                      setOpen(!open);
                    }}
                  >
                    search
                  </button>
                  <Link
                    href="/"
                    className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                  >
                    <span className="ml-3 text-base font-medium text-gray-900">
                      Home
                    </span>
                  </Link>
                  <Link
                    href="/ai"
                    className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                  >
                    <span className="ml-3 text-base font-medium text-gray-900">
                      AI
                    </span>
                  </Link>
                </nav>
              </div>
            </div>
            <div className="py-6 px-5 space-y-6">
              <div>
                <Link
                  href="/"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-[#5e5b78] bg-[#c3c0db] hover:bg-[#5e5b78]"
                >
                  Sign up
                </Link>
                <p className="mt-6 text-center text-base font-medium text-gray-500">
                  尚未註冊?
                  <Link
                    href="/"
                    className="text-[#5e5b78] hover:text-[#797691] ml-3"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;
