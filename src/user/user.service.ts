import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { SignUpDto } from "../auth/dto/sign-up.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

export class UserService {
    private static instance: UserService

    private constructor(
        private prisma: PrismaClient
    ) {}

    public static async GetInstance() {
        if (!UserService.instance) {
            const prisma = await PrismaService.GetInstance()

            UserService.instance = new UserService(prisma)
        }

        return UserService.instance
    }

    public findByEmail(email: string) {
        return this.prisma.user.findFirst({ where: {email} })
    }

    public findOne(id: number) {
        return this.prisma.user.findFirst({ where: {id} })
    }

    public async create(createUserDto: SignUpDto) {
        const userFound = await this.findByEmail(createUserDto.email)

        if (userFound) {
           throw new BadRequestError("Email is already taken...")
        }

        const user = await this.prisma.user.create({data: createUserDto})

        return user
    }

    public update(updateUserDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: {id: updateUserDto.userId},
            data: updateUserDto
        })
    }
}