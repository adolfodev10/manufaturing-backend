import jwt from "jsonwebtoken";

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is required");
    }

    return secret;
};

export const verifyToken = async (token: string) => {
    try {
        return jwt.verify(token, getJwtSecret());
    } catch (error) {
        return null;
    }
}
