"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is required");
    }
    return secret;
};
const verifyToken = async (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, getJwtSecret());
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
