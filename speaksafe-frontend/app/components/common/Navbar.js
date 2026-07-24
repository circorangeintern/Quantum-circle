"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import NavLinks from "./NavLinks";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-(--navy) min-w-full sticky top-0">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3  ">
          <Image
            src="/speaksafe.png"
            alt="SpeakSafe Logo"
            width={35}
            height={40}
            className=""
          />
          <span className="text-3xl text-(--navtext)">SpeakSafe</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks href="/">Home</NavLinks>
          <NavLinks href="/report">Report</NavLinks>
          <NavLinks href="/status">Status</NavLinks>
          {/* <NavLinks href="/dashboard">Dashboard</NavLinks> */}
          {/* <NavLinks href="/signup">Authority SignUp</NavLinks> */}
          <NavLinks href="/login">Login</NavLinks>
          {/* <NavLinks href="/admin">Admin Panel</NavLinks> */}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden flex flex-col px-5 pb-5 gap-4 bg-[var(--navy)]">
          <NavLinks onClick={() => setIsOpen(!isOpen)} href="/">
            Home
          </NavLinks>
          <NavLinks onClick={() => setIsOpen(!isOpen)} href="/report">
            Report
          </NavLinks>
          <NavLinks onClick={() => setIsOpen(!isOpen)} href="/status">
            Status
          </NavLinks>
          {/* <NavLinks onClick={() => setIsOpen(!isOpen)} href="/dashboard">
            Dashboard
          </NavLinks> */}
          {/* <NavLinks onClick={() => setIsOpen(!isOpen)} href="/signup">
            Authority SignUp
          </NavLinks> */}
          <NavLinks onClick={() => setIsOpen(!isOpen)} href="/login">
            Login
          </NavLinks>
          {/* <NavLinks onClick={() => setIsOpen(!isOpen)} href="/admin">
            Admin Panel
          </NavLinks> */}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
