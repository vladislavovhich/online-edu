import { Course, Prisma } from "@prisma/client"
import { Router } from "../../lib/request/router"
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware"
import { Roles } from "../common/enums"
import { CheckOwnershipMiddleware } from "../common/middleware/check-ownership.middleware"
import { CheckRoleMiddleware } from "../common/middleware/check-role.middleware"
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware"
import { CourseController } from "./course.controller"
import { CourseService } from "./course.service"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"

export const createCourseRouter = async () => {
    const course = await CourseController.GetInstance()
    const courseService = await CourseService.GetInstance()

    const router = new Router()

    router.get("/users/:userId/courses", course.getCourses.bind(course))
    
    router.put("/courses/:id/subscribe", course.subscribe.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
    ])

    router.put("/courses/:id/unsubscribe", course.unsubscribe.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
    ])

    router.post("/courses", course.create.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
        CheckRoleMiddleware([Roles.MENTOR]),
        ValidateDtoMiddleware(CreateCourseDto, "body")
    ])

    router.patch("/courses/:id", course.update.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
        CheckRoleMiddleware([Roles.MENTOR]),
        CheckOwnershipMiddleware("id", "mentorId", courseService.findOne),
        ValidateDtoMiddleware(UpdateCourseDto, "body")
    ])

    router.delete("/courses/:id", course.delete.bind(course), [
        CheckAuthorizedMiddleware('accessToken', 'jwt'),
        CheckRoleMiddleware([Roles.MENTOR]),
        CheckOwnershipMiddleware("id", "mentorId", courseService.findOne),
        CheckAuthorizedMiddleware('accessToken', 'jwt')
    ])

    router.get("/courses/:id", course.findOne.bind(course))

    router.get("/courses", course.findAll.bind(course))

    return router
}