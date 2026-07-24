import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-(--navy)">
      <div className=" grid grid-cols-2 lg:grid-cols-4 gap-15 mx-auto px-5 pt-10 pb-8">
        <div>
          <div className="flex items-center gap-3">
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
          <p className="text-(--text-muted)">Home</p>
          <p className="text-(--text-muted)">Report Incident</p>
          <p className="text-(--text-muted)">Authority Login</p>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-white font-bold">COMPANY</h1>
          <p className="text-(--text-muted)">About</p>
          <p className="text-(--text-muted)">Contact</p>
          <p className="text-(--text-muted)">Help Center</p>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-white font-bold">LEGAL</h1>
          <p className="text-(--text-muted)">Privacy Policy</p>
          <p className="text-(--text-muted)">Terms of Service</p>
        </div>
      </div>

      <hr className="text-(--text-muted) w-[95%] mx-auto" />

      <footer className="text-(--text-muted) px-5 py-10">
        © 2026 SpeakSafe. Built for safer schools everywhere.
      </footer>
    </div>
  );
};

export default Footer;
