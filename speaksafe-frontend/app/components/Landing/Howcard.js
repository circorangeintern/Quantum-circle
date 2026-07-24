import React from "react";

const Howcard = ({ number, title, description }) => {
  return (
    <div>
      {" "}
      <div className="flex flex-col gap-2 h-[180px] lg:h-[200px] items-center text-center">
        <div className="bg-(--navy) text-white rounded-[50%] w-fit px-3 py-1 h-fit">{number}</div>
        <h1 className="text-(--navy) font-bold md:text-lg">{title}</h1>
        <p className="text-(--text-muted) text-[12px] ">{description}</p>
      </div>
    </div>
  );
};

export default Howcard;
