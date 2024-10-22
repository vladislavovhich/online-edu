import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";
import { Request } from "../../lib/request/request";
import { Response } from "../../lib/response/response";
import { HttpStatus } from "../../lib/types/response.types";

export class AuthController {
    private static instance: AuthController

    private constructor(
        private authService: AuthService
    ) {}

    public static async GetInstance() {
        if (!AuthController.instance) {
            const authService = await AuthService.GetInstance()

            AuthController.instance = new AuthController(authService)
        }

        return AuthController.instance
    }

    public async signUp(request: Request) {
        return new Response().text(HttpStatus.OK, JSON.stringify(request.body))
    }
}