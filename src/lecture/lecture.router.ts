import { Router } from "../../lib/request/router";
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware";
import { Roles } from "../common/enums";
import { CheckOwnershipMiddleware } from "../common/middleware/check-ownership.middleware";
import { CheckRoleMiddleware } from "../common/middleware/check-role.middleware";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";
import { CreateLectureDto } from "./dto/create-lecture.dto";
import { UpdateLectureDto } from "./dto/update-lecture.dto";
import { LectureController } from "./lecture.controller";
import { LectureService } from "./lecture.service";

export const createLectureRouter = async () => {
    const service = await LectureService.resolve();
    const controller = await LectureController.resolve();
    const router = new Router();

    router.put(
        "/lectures/:lectureId/online",
        controller.makeOnline.bind(controller),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            CheckRoleMiddleware([Roles.MENTOR]),
            CheckOwnershipMiddleware(
                "lectureId",
                "mentorId",
                service.findOneSave.bind(service)
            ),
        ]
    );

    router.put(
        "/lectures/:lectureId/offline",
        controller.makeOnline.bind(controller),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            CheckRoleMiddleware([Roles.MENTOR]),
            CheckOwnershipMiddleware(
                "lectureId",
                "mentorId",
                service.findOneSave.bind(service)
            ),
        ]
    );

    router.get("/lectures/:lectureId", controller.findOne.bind(controller));

    router.get(
        "/courses/:courseId/lectures",
        controller.getCourseLectures.bind(controller)
    );

    router.post(
        "/courses/:courseId/lectures",
        controller.create.bind(controller),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            ValidateDtoMiddleware(CreateLectureDto, "body"),
            CheckRoleMiddleware([Roles.MENTOR]),
        ]
    );

    router.patch("/lectures/:id", controller.update.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(UpdateLectureDto, "body"),
        CheckOwnershipMiddleware(
            "id",
            "mentorId",
            service.findOneSave.bind(service)
        ),
        CheckRoleMiddleware([Roles.MENTOR]),
    ]);

    router.delete("/lectures/:id", controller.delete.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckOwnershipMiddleware(
            "id",
            "mentorId",
            service.findOneSave.bind(service)
        ),
        CheckRoleMiddleware([Roles.MENTOR]),
    ]);

    return router;
};
