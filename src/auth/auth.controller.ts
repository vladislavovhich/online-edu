import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";
import { Request } from "../../lib/request/request";
import { Response } from "../../lib/response/response";
import { HttpStatus } from "../../lib/types/response.types";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";

export class AuthController {
    private static instance: AuthController

    private constructor(
        public readonly authService: AuthService
    ) {}

    public static async GetInstance() {
        if (!AuthController.instance) {
            const authService = await AuthService.GetInstance()

            AuthController.instance = new AuthController(authService)
        }

        return AuthController.instance
    }

    public async signUp(request: Request) {
        const signUpDto = Object.assign(new SignUpDto(), request.body)
        const result = await this.authService.signUp(signUpDto)

        return new Response()
            .setCookie("jwt", result.tokens.accessToken, { })
            .setCookie("jwt-refresh", result.tokens.refreshToken, { })
            .json(HttpStatus.OK, JSON.stringify(result.user))
    }

    public async signIn(request: Request) {
        const signInDto = Object.assign(new SignInDto(), request.body)
        const result = await this.authService.signIn(signInDto)

        return new Response()
            .setCookie("jwt", result.tokens.accessToken, { })
            .setCookie("jwt-refresh", result.tokens.refreshToken, { })
            .json(HttpStatus.OK, JSON.stringify(result.user))
    }

    public async signOut(request: Request) {
        return new Response()
            .removeCookie("jwt")
            .removeCookie("jwt-refresh")
            .text(HttpStatus.OK, "Successfuly signed-out")
    }
}