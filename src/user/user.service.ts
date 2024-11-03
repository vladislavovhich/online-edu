import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { SignUpDto } from "../auth/dto/sign-up.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { NotFoundError } from "../../lib/errors/not-found.error";
import * as bcrypt from "bcrypt";

export class UserService {
    private static instance: UserService;

    private constructor(private prisma: PrismaClient) {}

    public static async GetInstance() {
        if (!UserService.instance) {
            const prisma = await PrismaService.GetInstance();

            UserService.instance = new UserService(prisma);
        }

        return UserService.instance;
    }

    public findByEmail(email: string) {
        return this.prisma.user.findFirst({
            where: { email },
            include: { userCourses: true },
        });
    }

    public findOne(id: number) {
        return this.prisma.user.findFirst({
            where: { id },
            include: { userCourses: true },
        });
    }

    public async findOneSave(id: number) {
        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundError("User not found...");
        }

        return user;
    }

    public async create(createUserDto: SignUpDto) {
        const userFound = await this.findByEmail(createUserDto.email);

        if (userFound) {
            throw new BadRequestError("Email is already taken...");
        }

        const user = await this.prisma.user.create({
            data: createUserDto,
            include: { userCourses: true },
        });

        return user;
    }

    public async update(updateUserDto: UpdateUserDto) {
        const user = await this.findOneSave(updateUserDto.userId);
        const { name, surname, password } = updateUserDto;

        if (password) {
            const isPasswordMatches = await bcrypt.compare(
                password,
                user.password
            );

            if (isPasswordMatches) {
                throw new BadRequestError(
                    "New password can't be the same as old one..."
                );
            }

            const newPassword = await bcrypt.hash(password, 10);

            updateUserDto.password = newPassword;
        }

        await this.prisma.user.update({
            where: { id: updateUserDto.userId },
            data: { name, surname, password: updateUserDto.password },
        });

        return this.findOneSave(user.id);
    }
}
