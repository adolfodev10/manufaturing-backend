import jwt from "jsonwebtoken";

export const generateToken = async (payload: object) => {
  const JWT_TOKEN = process.env.JWT_SECRET || "ola-Mundo-5T";
  return jwt.sign(payload, JWT_TOKEN, { expiresIn: "5h" });
};