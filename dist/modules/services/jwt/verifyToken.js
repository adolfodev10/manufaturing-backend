"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_TOKEN = process.env.JWT_SECRET || "ola-Mundo-5T";
const verifyToken = async (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_TOKEN);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
