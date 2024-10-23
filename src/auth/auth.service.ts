import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import * as bcrypt from "bcrypt"
import { JwtService } from "../jwt/jwt.service";
import { SignInDto } from "./dto/sign-in.dto";

export class AuthService {
    private static instance: AuthService

    private constructor(
        private prisma: PrismaClient,
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    public static async GetInstance() {
        if (!AuthService.instance) {
            const prisma = await PrismaService.GetInstance()
            const userService = await UserService.GetInstance()
            const jwtService = JwtService.GetInstance()

            AuthService.instance = new AuthService(prisma, userService, jwtService)
        }

        return AuthService.instance
    }

    public async signUp(signUpDto: SignUpDto) {
        const userExist = await this.userService.findByEmail(signUpDto.email)

        if (userExist) {
            throw new BadRequestError("Email is already taken")
        }

        const tokens = this.jwtService.createTokens({ email: signUpDto.email })

        signUpDto.password = await bcrypt.hash(signUpDto.password, 10)
        signUpDto.token = tokens.refreshToken

        const user = await this.userService.create(signUpDto)

        return { user, tokens }
    }

    public async signIn(signInDto: SignInDto) {
        const user = await this.userService.findByEmail(signInDto.email)

        if (!user) {
            throw new BadRequestError("Incorrect login or password...")
        }

        const isPasswordCorrect = await bcrypt.compare(signInDto.password, user.password)

        if (!isPasswordCorrect) {
            throw new BadRequestError("Incorrect login or password...")
        }

        const accessToken = this.jwtService.createToken({ email: user.email }, "accessToken")

        return {user, tokens: {accessToken, refreshToken: user.token}}
    }
}