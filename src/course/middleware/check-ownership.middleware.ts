import { validate } from "class-validator";
import { Request } from "../../../lib/request/request";
import { BadRequestError } from "../../../lib/errors/bad-request.error";
import { UserService } from "../../user/user.service";
import { NotFoundError } from "../../../lib/errors/not-found.error";
import { CourseService } from "../course.service";

export const CheckOwnershipMiddleware = (itemId: string) => async (request: Request): Promise<boolean> => {
    const courseService = await CourseService.GetInstance()
    const userService = await UserService.GetInstance()
    const payload = request.payload

    const courseId = parseInt(request.params[itemId])

    if (!payload) {
        throw new BadRequestError("User isn't authorized, so you can't perform the action...")
    }

    const user = await userService.findByEmail(payload.email)

    if (!user) {
        throw new NotFoundError("User not found...")
    }

    const course = await courseService.findOne(courseId)

    return user.id == course?.mentorId
}