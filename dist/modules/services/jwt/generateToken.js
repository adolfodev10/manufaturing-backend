"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_TOKEN = process.env.JWT_SECRET || "ola-Mundo-5T";
const generateToken = async (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, JWT_TOKEN, { expiresIn: "5h" });
    return token;
};
exports.generateToken = generateToken;
