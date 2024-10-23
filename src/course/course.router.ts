import { Router } from "../../lib/request/router"
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware"
import { Roles } from "../common/enums"
import { CheckRoleMiddleware } from "../common/middleware/check-role.middleware"
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware"
import { CourseController } from "./course.controller"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"
import { CheckOwnershipMiddleware } from "./middleware/check-ownership.middleware"

export const createCourseRouter = async () => {
    const course = await CourseController.GetInstance()
    const router = new Router()

    router.post("/courses", course.create.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
        CheckRoleMiddleware([Roles.MENTOR]),
        ValidateDtoMiddleware(CreateCourseDto, "body")
    ])

    router.patch("/courses/:id", course.update.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
        CheckRoleMiddleware([Roles.MENTOR]),
        CheckOwnershipMiddleware("id"),
        ValidateDtoMiddleware(UpdateCourseDto, "body")
    ])

    router.delete("/courses/:id", course.delete.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
        CheckRoleMiddleware([Roles.MENTOR]),
        CheckOwnershipMiddleware("id"),
        CheckAuthorizedMiddleware('accessToken', 'jwt')
    ])

    router.get("/courses/:id", course.findOne.bind(course))

    router.get("/courses", course.findAll.bind(course))

    return router
}