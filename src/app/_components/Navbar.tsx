"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Login from "./Login";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
      <Link href="/" className="text-2xl font-bold text-indigo-600">
        koomastudio
      </Link>

      {/* Desktop Menu */}
      <div className="hidden space-x-6 md:flex">
        <Link href="/notes" className="hover:text-indigo-600">
          📓 My Library
        </Link>
        <Link href="/notes/new" className="hover:text-indigo-600">
          ➕ New Draft
        </Link>
        <Link href="/purchase" className="hover:text-indigo-600">
          ✨ AI Integration
        </Link>
        <Link href="/contact" className="hover:text-indigo-600">
          💬 Contact Us
        </Link>
        <Login />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-16 z-50 w-full bg-white shadow-md md:hidden"
        >
          <div className="flex flex-col space-y-4 p-4">
            <Link
              href="/notes"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              📓 My Library
            </Link>
            <Link
              href="/notes/new"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              ➕ New Draft
            </Link>
            <Link
              href="/purchase"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              ✨ AI Integration
            </Link>
            <Link
              href="/contact"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              💬 Contact Us
            </Link>
            <Login />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
