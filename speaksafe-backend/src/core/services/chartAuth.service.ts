import jwt from "jsonwebtoken";
import { env } from "../config/env.config";

interface ChartTokenPayload {
  user: {
    school_id: string;
    role: string;
  };
}

export const generateChartsToken = (schoolId: string, role: string): string => {
  const secretKey = env.MONGODB_CHARTS_JWT_SECRET;

  if (!secretKey) {
    throw new Error(
      "MONGODB_CHARTS_JWT_SECRET is not defined in environment variables",
    );
  }

  const payload: ChartTokenPayload = {
    user: {
      school_id: schoolId,
      role: role,
    },
  };

  return jwt.sign(payload, secretKey, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
};
