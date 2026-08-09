import jwt from "jsonwebtoken";
import { env } from "../config/env.config";

export interface JwtPayload {
  adminId: string;
  email: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (payload: JwtPayload): JwtTokens => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY || "15m",
    issuer: "speaksafe",
    audience: ["speaksafe-api", "quantum circle", "circo orange internship"],
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY || "7d",
    issuer: "speaksafe",
    audience: ["speaksafe-api", "quantum circle", "circo orange internship"],
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: "speaksafe",
      audience: "speaksafe-api",
    }) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: "speaksafe",
      audience: "speaksafe-api",
    }) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};
