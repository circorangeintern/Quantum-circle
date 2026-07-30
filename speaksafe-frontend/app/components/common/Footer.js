import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-(--navy)">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto px-5 pt-10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/speaksafe.png"
              alt="SpeakSafe Logo"
              width={25}
              height={40}
            />
            <span className="text-xl text-(--navtext)">SpeakSafe</span>
          </div>
          <p className="text-(--text-muted) text-[14px] md:text-sm">
            An anonymous, secure reporting platform giving every student a safe
            way to be heard — deployable at any school.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-white font-bold">PLATFORM</h1>
          <Link href="/" className="text-(--text-muted) hover:text-white transition-colors">Home</Link>
          <Link href="/report" className="text-(--text-muted) hover:text-white transition-colors">Submit a Report</Link>
          <Link href="/status" className="text-(--text-muted) hover:text-white transition-colors">Check Report Status</Link>
          <Link href="/login" className="text-(--text-muted) hover:text-white transition-colors">Authority Login</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-white font-bold">LEGAL</h1>
          <Link href="/register-school" className="text-(--text-muted) hover:text-white transition-colors">Register Your School</Link>
          <p className="text-(--text-muted)">Privacy Policy</p>
          <p className="text-(--text-muted)">Terms of Use</p>
        </div>
      </div>

      <hr className="text-(--text-muted) w-[95%] mx-auto" />

      <footer className="text-(--text-muted) flex flex-col sm:flex-row items-center justify-between px-5 py-6">
        <span>© 2026 SpeakSafe. Built for safer schools everywhere.</span>
      </footer>
    </div>
  );
};

export default Footer;
