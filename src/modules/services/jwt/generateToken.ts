import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
};

export const generateToken = async (payload: object) => {
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "5h" });
  return token;
};
