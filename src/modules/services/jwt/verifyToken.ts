import jwt from "jsonwebtoken";


export async function verifyToken(token: string) {
    const JWT_TOKEN = process.env.JWT_SECRET || "ola-Mundo-5T";
    try {
    return jwt.verify(token, JWT_TOKEN);
  } catch (err: any) {
    console.error("Falha ao verificar token:", {
      message: err.message,
      name: err.name,
      secretDefined: Boolean(process.env.JWT_SECRET),
      secretLength: JWT_TOKEN?.length,
    });
    return null;
  }
}