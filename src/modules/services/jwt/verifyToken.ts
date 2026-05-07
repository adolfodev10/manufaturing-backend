import jwt from "jsonwebtoken";

const JWT_TOKEN = process.env.JWT_SECRET || "ola-Mundo-5T";

export const verifyToken = async (token: string) => {
    try {
        return jwt.verify(token, JWT_TOKEN);
    } catch (error) {
        return null;
    }
}