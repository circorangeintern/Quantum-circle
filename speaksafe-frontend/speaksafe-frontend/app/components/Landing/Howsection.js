import React from "react";
import Howcard from "./Howcard";

const Howsection = () => {
  return (
    <div className="mt-24">
      <div className="flex flex-col text-center gap-1 pb-7">
        <p className="text-sm text-(--blue)">HOW IT WORKS</p>
        <h1 className="md:text-3xl text-2xl text-(--navy) font-bold">
          From report to resolution
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:w-[90%] mx-auto">
        <Howcard
          number={1}
          title={"Describe what happened"}
          description={
            "Choose a category and share as much detail as you're comfortable with."
          }
        />
        <Howcard
          number={2}
          title={"Submit securely"}
          description={
            "Your report is sent straight to a school authority — nothing traces back to you.."
          }
        />
        <Howcard
          number={3}
          title={"Get a tracking ID"}
          description={
            "Save it to check your report's status anytime, without logging in."
          }
        />
        <Howcard
          number={4}
          title={"Authorities respond"}
          description={
            "Your case is reviewed, investigated, and tracked through to resolution."
          }
        />
      </div>
    </div>
  );
};

export default Howsection;
