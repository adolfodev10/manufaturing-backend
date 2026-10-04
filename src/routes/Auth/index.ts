import { FastifyInstance } from "fastify";
import { Login } from "./login";
import { ValidationToken } from "./validation";
import { ForgotPassword } from "./forgot-password";
import { ResetPassword } from "./reset-password";

export async function AuthRoutes(app: FastifyInstance) {
    app.register(Login);
    app.register(ValidationToken);
    app.register(ForgotPassword);
    app.register(ResetPassword);
}