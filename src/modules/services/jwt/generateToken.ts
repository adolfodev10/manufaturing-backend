import jwt from "jsonwebtoken";

const JWT_TOKEN = process.env.JWT_SECRET || "ola-Mundo-5T";

export const generateToken = async (payload: object) => {
  const token = jwt.sign(payload, JWT_TOKEN, { expiresIn: "5h" });
  return token;
};