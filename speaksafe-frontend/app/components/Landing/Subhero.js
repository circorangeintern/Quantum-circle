import React from "react";
import Subherocard from "./Subherocard";
import { CheckSquare, Clock, EyeOff, Lock } from "lucide-react";

const Subhero = () => {
  return (
    <div className="mt-15 md:mt-24">
      <div className="flex flex-col text-center gap-1 pb-7">
        <p className="text-sm text-(--blue)">WHY SPEAKSAFE</p>
        <h1 className="md:text-3xl text-2xl text-(--navy) font-bold">
          Built for trust, from the ground up
        </h1>
        <p className="md:text-lg text-sm text-(--text-muted)">
          {" "}
          Every part of the platform is designed so students feel safe coming
          forward, and authorities can act with confidence
        </p>
      </div>

      {/* Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-8 gap-5">
        <Subherocard
          icon={<EyeOff width="true" />}
          title="Anonymous Reporting"
          description="No login, no name, no identifying details ever collected or stored."
        />
        <Subherocard
          icon={<Lock />}
          title="Secure Communication"
          description="Reports route directly and privately to designated school authorities only."
        />
        <Subherocard
          icon={<Clock />}
          title="Real-Time Case Tracking"
          description="Check on any report's progress anytime using your reference code.."
        />
        <Subherocard
          icon={<CheckSquare />}
          title="Confidential Case Management"
          description="Authorities triage, investigate, and resolve cases in one organized dashboard."
        />
      </div>
    </div>
  );
};

export default Subhero;
