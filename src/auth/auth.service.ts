import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";
import { SignUpDto } from "./dto/sign-up.dto";

export class AuthService {
    private static instance: AuthService

    private constructor(
        private prisma: PrismaClient,
        private userService: UserService
    ) {}

    public static async GetInstance() {
        if (!AuthService.instance) {
            const prisma = await PrismaService.GetInstance()
            const userService = await UserService.GetInstance()

            AuthService.instance = new AuthService(prisma, userService)
        }

        return AuthService.instance
    }

    public signUp(signUpDto: SignUpDto) {
        return signUpDto
    }
}