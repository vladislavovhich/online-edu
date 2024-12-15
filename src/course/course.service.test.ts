import { PrismaClient } from "@prisma/client";
import { CourseService } from "./course.service";
import { PrismaService } from "../prisma/prisma.service";
import { CourseController } from "./course.controller";
import { Router } from "../../lib/request/router";
import { createCourseRouter } from "./course.router";
import { Request } from "../../lib/request/request";
import { UserService } from "../user/user.service";
import { AuthService } from "../auth/auth.service";
import { Roles } from "../common/enums";
import { HttpMethod } from "../../lib/types/request.types";
import { CreateCourseDto } from "./dto/create-course.dto";

describe("Course Tests", () => {
    let controller: CourseController;
    let authService: AuthService;
    let service: CourseService;
    let router: Router;
    let prisma: PrismaClient;

    beforeAll(async () => {
        prisma = await PrismaService.resolve();
        controller = await CourseController.resolve();
        authService = await AuthService.resolve();
        service = await CourseService.resolve();
        router = await createCourseRouter();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it("student can't create course", async () => {
        const result = await authService.signUp({
            email: "vla1d@gmail.com",
            password: "55155",
            name: "test",
            surname: "test",
            role: Roles.STUDENT,
        });

        const request = {
            cookie: {
                jwt: result.tokens.accessToken,
            },
            params: {},
            query: {},
            headers: {},
            body: {},
            url: "/courses",
            method: HttpMethod.POST,
            files: [],
        } as Request;

        await expect(async () => {
            await router.handle(request);
        }).rejects.toThrow();
    });

    it("mentor create course", async () => {
        const { user } = await authService.signUp({
            email: "vlad@gmail.com",
            password: "55155",
            name: "test",
            surname: "test",
            role: Roles.MENTOR,
        });

        const dto = new CreateCourseDto();

        dto.description = "test";
        dto.name = "test";
        dto.mentorId = user.id;

        const course = await service.create(dto);

        expect(course.mentorId).toEqual(dto.mentorId);
    });

    it("mentor update course", async () => {
        const { user } = await authService.signUp({
            email: "vlad12@gmail.com",
            password: "55155",
            name: "test",
            surname: "test",
            role: Roles.MENTOR,
        });

        const dto = new CreateCourseDto();

        dto.description = "test";
        dto.name = "test";
        dto.mentorId = user.id;

        const course = await service.create(dto);
        const updated = await service.update(course.id, { name: "new test" });

        expect(updated.name).toEqual("new test");
    });

    it("mentor delete course", async () => {
        const { user } = await authService.signUp({
            email: "vlad123@gmail.com",
            password: "55155",
            name: "test",
            surname: "test",
            role: Roles.MENTOR,
        });

        const dto = new CreateCourseDto();

        dto.description = "test";
        dto.name = "test";
        dto.mentorId = user.id;

        const course = await service.create(dto);

        await service.delete(course.id);

        await expect(async () => {
            await service.findOneSave(course.id);
        }).rejects.toThrow();
    });
});
