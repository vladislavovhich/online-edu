import { PrismaClient } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { GroupController } from "./group.controller";
import { GroupService } from "./group.service";
import { PrismaService } from "../prisma/prisma.service";
import { Roles } from "../common/enums";
import { CreateCourseDto } from "../course/dto/create-course.dto";
import { CreateGroupDto } from "./dto/create-group.dto";
import "reflect-metadata";

describe("Group Tests", () => {
    let controller: GroupController;
    let authService: AuthService;
    let service: GroupService;
    let prisma: PrismaClient;

    beforeAll(async () => {
        prisma = await PrismaService.resolve();
        controller = await GroupController.resolve();
        authService = await AuthService.resolve();
        service = await GroupService.resolve();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it("create group", async () => {
        const { user } = await authService.signUp({
            email: "vlad12@gmail.com",
            password: "55155",
            name: "test",
            surname: "test",
            role: Roles.MENTOR,
        });

        const dto = new CreateGroupDto();

        dto.description = "test";
        dto.name = "test";
        dto.userId = user.id;

        const group = await service.create(dto);

        expect(group.name).toEqual("test");
    });

    it("update group", async () => {
        const { user } = await authService.signUp({
            email: "vlad12@gmail.com",
            password: "55155",
            name: "test",
            surname: "test",
            role: Roles.MENTOR,
        });

        const dto = new CreateGroupDto();

        dto.description = "test";
        dto.name = "test";
        dto.userId = user.id;

        const group = await service.create(dto);
        const updated = await service.update(group.id, {
            name: "new test",
            userId: user.id,
        });

        expect(updated.name).toEqual("new test");
    });

    it("delete group", async () => {
        const { user } = await authService.signUp({
            email: "vlad123@gmail.com",
            password: "55155",
            name: "test",
            surname: "test",
            role: Roles.MENTOR,
        });

        const dto = new CreateGroupDto();

        dto.description = "test";
        dto.name = "test";
        dto.userId = user.id;

        const group = await service.create(dto);

        await service.delete(group.id);

        await expect(async () => {
            await service.findOneSave(group.id);
        }).rejects.toThrow();
    });
});
