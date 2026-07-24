import { Edit3, Lock } from "lucide-react";
import Image from "next/image";
import React from "react";
import Subhero from "../components/Landing/Subhero";
import Howsection from "../components/Landing/Howsection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const page = () => {
  return (
    <div className="my-5 m-auto w-[90%] ">
      <div className="bg-(--peri-light) flex gap-2 items-center mt-4 px-2 py-1 mb-3 w-fit rounded-2xl">
        <Lock width={15} />
        <span className="text-(--blue-dark) text-sm font-semibold">
          Trusted by school communities
        </span>
      </div>

      {/* Hero Text */}
      <div className="flex flex-col md:flex-row  items-center content-center gap-5">
        <div className="flex-1 w- flex flex-col gap-3 mb-6 ">
          <h1 className="text-4xl text-(--navy) font-bold">
            Speak Up. Stay Safe. <br />
            Your <span className="text-(--peri)">Voice </span> Matters.
          </h1>
          <p className="text-(--text-muted)">
            SpeakSafe lets students anonymously report bullying, harassment,
            violence, discrimination, mental health concerns, and other safety
            issues — and gives school authorities one clear place to respond.
          </p>
          <div className="flex gap-3 md:justify-center md:justify-start">
            <Button className="py-5 text-white bg-(--blue-dark) hover:bg-(--navy-light) rounded-2xl">
              <Edit3 className="h-4 w-4" />
              <Link href="/report">Report an Incident</Link>
            </Button>
            <Button
              className="py-5 border-(--blue-dark) text-(--blue-dark) rounded-2xl"
              variant="outline"
            >
              <Link href="/login">Sign In/Up</Link>
            </Button>
          </div>
        </div>

        <Card className="hidden md:block md:w-[340px] shadow-xl border-0 ring-0">
          <CardContent className="flex flex-col items-center p-5">
            <Image
              src="/speaksafe.png"
              alt="SpeakSafe Logo"
              width={140}
              height={40}
              className=""
            />
            <p className="text-(--blue-dark) text-xl font-bold">
              100% Anonymous
            </p>
            <p className="text-(--text-muted) text-sm">
              NO NAME REQUIRED, EVER
            </p>
          </CardContent>
        </Card>
      </div>

      <Subhero />
      <Howsection />
    </div>
  );
};

export default page;
