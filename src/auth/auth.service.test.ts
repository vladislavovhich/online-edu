import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { UserService } from "../user/user.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { validate } from "class-validator";
import { SignInDto } from "./dto/sign-in.dto";
import { AuthService } from "./auth.service";
import { Roles } from "../common/enums";

describe("AuthService Tests", () => {
    let userService: UserService;
    let authService: AuthService;
    let prisma: PrismaClient;

    beforeAll(async () => {
        userService = await UserService.resolve();
        prisma = await PrismaService.resolve();
        authService = await AuthService.resolve();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it("Incorrect input data for registration", async () => {
        await expect(async () => {
            const dto = plainToInstance(SignUpDto, {
                name: "test",
                surname: "test",
            });
            const errors = await validate(dto);

            if (errors.length) {
                throw new Error();
            }
        }).rejects.toThrow();
    });

    it("Incorrect input data for authorization", async () => {
        await expect(async () => {
            const dto = plainToInstance(SignInDto, {
                name: "test",
                surname: "test",
            });
            const errors = await validate(dto);

            if (errors.length) {
                throw new Error();
            }
        }).rejects.toThrow();
    });

    it("Try to sign in for not existed account", async () => {
        await expect(async () => {
            await authService.signIn({ email: "not", password: "not" });
        }).rejects.toThrow();
    });

    it("Try to create real account", async () => {
        const dto = new SignUpDto();

        dto.email = "vlad@gmail.com";
        dto.password = "55155";
        dto.role = Roles.MENTOR;
        dto.name = "TEST";
        dto.surname = "TEST";

        const result = await authService.signUp(dto);

        expect(result.user.email).toEqual(dto.email);
    });

    it("Try to create account, but email exists", async () => {
        const dto = new SignUpDto();

        dto.email = "vlad@gmail.com";
        dto.password = "55155";
        dto.role = Roles.MENTOR;
        dto.name = "TEST";
        dto.surname = "TEST";

        await authService.signUp(dto);

        await expect(async () => {
            await authService.signUp(dto);
        }).rejects.toThrow();
    });

    it("Try to sign in to real account", async () => {
        const dto = new SignUpDto();

        dto.email = "vlad7@gmail.com";
        dto.password = "55155";
        dto.role = Roles.MENTOR;
        dto.name = "TEST";
        dto.surname = "TEST";

        await authService.signUp(dto);

        const result = await authService.signIn({
            email: dto.email,
            password: "55155",
        });

        expect(result.user.email).toEqual(dto.email);
    });

    it("Try to sign in, but it has incorrect password or login", async () => {
        const dto = new SignUpDto();

        dto.email = "vlad@gmail.com";
        dto.password = "55155";
        dto.role = Roles.MENTOR;
        dto.name = "TEST";
        dto.surname = "TEST";

        await authService.signUp(dto);
        await expect(async () => {
            await authService.signIn({
                email: dto.email,
                password: "invalid password",
            });
        }).rejects.toThrow();
    });
});
