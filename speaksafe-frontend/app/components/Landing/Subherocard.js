import React from "react";

const Subherocard = ({ icon, title, description }) => {
  return (
    <div>
      <div className="flex flex-col gap-2 bg-white rounded-lg p-6 h-[180px] lg:h-[200px]">
        <div className="">{icon}</div>
        <h1 className="text-(--navy) font-bold md:text-lg">{title}</h1>
        <p className="text-(--text-muted) text-[15px] ">{description}</p>
      </div>
    </div>
  );
};

export default Subherocard;
