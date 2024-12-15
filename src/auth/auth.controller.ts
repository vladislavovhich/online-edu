import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";
import { Request } from "../../lib/request/request";
import { Response } from "../../lib/response/response";
import { HttpStatus } from "../../lib/types/response.types";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { UserService } from "../user/user.service";
import { plainToInstance } from "class-transformer";
import { extractUser } from "../common/helpers/extract-user.helper";
import { GetUserDto } from "../user/dto/get-user.dto";
import { JwtService } from "../jwt/jwt.service";

export class AuthController {
    private static instance: AuthController;

    private constructor(private readonly authService: AuthService) {}

    public static async resolve() {
        if (!AuthController.instance) {
            const authService = await AuthService.resolve();

            AuthController.instance = new AuthController(authService);
        }

        return AuthController.instance;
    }

    public async signUp(request: Request) {
        const signUpDto = plainToInstance(SignUpDto, request.body);
        const result = await this.authService.signUp(signUpDto);
        const userDto = new GetUserDto(result.user);

        return new Response()
            .setCookie("jwt", result.tokens.accessToken, { path: "/" })
            .setCookie("jwt-refresh", result.tokens.refreshToken, { path: "/" })
            .json(HttpStatus.OK, { user: userDto });
    }

    public async signIn(request: Request) {
        const signInDto = plainToInstance(SignInDto, request.body);
        const result = await this.authService.signIn(signInDto);
        const userDto = new GetUserDto(result.user);

        return new Response()
            .setCookie("jwt", result.tokens.accessToken, {
                path: "/",
            })
            .json(HttpStatus.OK, { user: userDto });
    }

    public async signOut(request: Request) {
        return new Response()
            .removeCookie("jwt")
            .removeCookie("jwt-refresh")
            .text(HttpStatus.OK, "Successfuly signed-out");
    }

    public async me(request: Request) {
        const user = await extractUser(request);
        const userDto = new GetUserDto(user);

        return new Response().json(HttpStatus.OK, { user: userDto });
    }
}
