import { Course, Prisma } from "@prisma/client";
import { Router } from "../../lib/request/router";
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware";
import { Roles } from "../common/enums";
import { CheckOwnershipMiddleware } from "../common/middleware/check-ownership.middleware";
import { CheckRoleMiddleware } from "../common/middleware/check-role.middleware";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";
import { CourseController } from "./course.controller";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { PaginationDto } from "../common/dto/pagination.dto";

export const createCourseRouter = async () => {
    const controller = await CourseController.resolve();
    const service = await CourseService.resolve();

    const router = new Router();

    router.get(
        "/courses/:courseId/students",
        controller.getCourseStudents.bind(controller),
        [ValidateDtoMiddleware(PaginationDto, "query")]
    );

    router.get(
        "/users/:userId/courses",
        controller.getCourses.bind(controller),
        [ValidateDtoMiddleware(PaginationDto, "query")]
    );

    router.put(
        "/courses/:id/subscribe",
        controller.subscribe.bind(controller),
        [CheckAuthorizedMiddleware("accessToken", "jwt")]
    );

    router.put(
        "/courses/:id/unsubscribe",
        controller.unsubscribe.bind(controller),
        [CheckAuthorizedMiddleware("accessToken", "jwt")]
    );

    router.post("/courses", controller.create.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckRoleMiddleware([Roles.MENTOR]),
        ValidateDtoMiddleware(CreateCourseDto, "body"),
    ]);

    router.patch("/courses/:id", controller.update.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckRoleMiddleware([Roles.MENTOR]),
        CheckOwnershipMiddleware<Course>(
            "id",
            "mentorId",
            service.findOne.bind(service)
        ),
        ValidateDtoMiddleware(UpdateCourseDto, "body"),
    ]);

    router.delete("/courses/:id", controller.delete.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckRoleMiddleware([Roles.MENTOR]),
        CheckOwnershipMiddleware<Course>(
            "id",
            "mentorId",
            service.findOne.bind(service)
        ),
        CheckAuthorizedMiddleware("accessToken", "jwt"),
    ]);

    router.get("/courses/:id", controller.findOne.bind(controller));

    router.get("/courses", controller.findAll.bind(controller), [
        ValidateDtoMiddleware(PaginationDto, "query"),
    ]);

    return router;
};
