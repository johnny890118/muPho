import React, { useState } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { navLinks } from "@/constants";
import MuPhoLogo from "./icon/MuPhoLogo";
import { Dancing_Script } from "next/font/google";

const logoFont = Dancing_Script({ subsets: ["latin"], weight: "700" });

const Nav = ({ btnToInputHandler, isOverSearchArea }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`${
          isOverSearchArea ? "bg-[#c3c0db]/95" : "bg-transparent"
        } fixed top-0 z-10 w-full`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 sm:py-3">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center justify-center gap-2">
                <MuPhoLogo color={isOverSearchArea ? "#5e5b78" : "#c3c0db"} />
                <p
                  className={`${
                    isOverSearchArea ? "text-[#5e5b78]" : "text-[#c3c0db]"
                  } font-bold text-3xl ${logoFont.className}`}
                >
                  MuPho
                </p>
              </div>
            </Link>
            <div className="-mr-2 -my-2 md:hidden">
              <button
                type="button"
                className={`${
                  isOverSearchArea ? "text-[#5e5b78]" : "text-[#c3c0db]"
                } rounded-md p-2 inline-flex items-center justify-center`}
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
            <nav className="hidden md:flex gap-6">
              {navLinks.map(({ name, path }) => (
                <Link
                  key={name}
                  href={path}
                  className={`text-base font-medium ${
                    isOverSearchArea ? "text-[#5e5b78]" : "text-[#c3c0db]"
                  }`}
                >
                  {name}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={btnToInputHandler}
                className={`${isOverSearchArea ? "text-[#5e5b78]" : "text-[#c3c0db]"}`}
              >
                <FaSearch />
              </button>
              <Link
                href="/"
                className={`text-base ${isOverSearchArea ? "text-[#5e5b78]" : "text-[#c3c0db]"}`}
              >
                Sign in
              </Link>
              <Link
                href="/"
                className={`py-2 px-3 rounded-xl text-base ${
                  isOverSearchArea ? "text-[#c3c0db] bg-[#5e5b78]" : "text-[#5e5b78] bg-[#c3c0db]"
                } `}
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
                  <MuPhoLogo />
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
                    Search
                  </button>
                  <Link href="/" className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50">
                    <span className="ml-3 text-base font-medium text-gray-900">Home</span>
                  </Link>
                  <Link
                    href="/ai"
                    className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                  >
                    <span className="ml-3 text-base font-medium text-gray-900">AI</span>
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
                  <Link href="/" className="text-[#5e5b78] hover:text-[#797691] ml-3">
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
