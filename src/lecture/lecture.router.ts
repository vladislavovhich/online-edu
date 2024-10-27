import { Router } from "../../lib/request/router"
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware"
import { Roles } from "../common/enums"
import { CheckOwnershipMiddleware } from "../common/middleware/check-ownership.middleware"
import { CheckRoleMiddleware } from "../common/middleware/check-role.middleware"
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware"
import { CreateLectureDto } from "./dto/create-lecture.dto"
import { UpdateLectureDto } from "./dto/update-lecture.dto"
import { LectureController } from "./lecture.controller"
import { LectureService } from "./lecture.service"

export const createLectureRouter = async () => {
    const lectureService = await LectureService.GetInstance()
    const lecture = await LectureController.GetInstance()
    const router = new Router()

    router.get("/courses/:courseId/lectures", lecture.getCourseLectures.bind(lecture))

    router.post("/courses/:courseId/lectures", lecture.create.bind(lecture), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(CreateLectureDto, "body"),
        CheckRoleMiddleware([Roles.MENTOR])
    ])

    router.patch("/lectures/:id", lecture.update.bind(lecture), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(UpdateLectureDto, "body"),
        CheckOwnershipMiddleware("id", "mentorId", lectureService.findOneSave.bind(lectureService)),
        CheckRoleMiddleware([Roles.MENTOR])
    ])

    router.delete("/lectures/:id", lecture.delete.bind(lecture), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckOwnershipMiddleware("id", "mentorId", lectureService.findOneSave.bind(lectureService)),
        CheckRoleMiddleware([Roles.MENTOR])
    ])

    return router
}