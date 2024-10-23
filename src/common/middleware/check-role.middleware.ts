import { validate } from "class-validator";
import { Request } from "../../../lib/request/request";
import { BadRequestError } from "../../../lib/errors/bad-request.error";
import { Roles } from "../enums";
import { UserService } from "../../user/user.service";
import { NotFoundError } from "../../../lib/errors/not-found.error";

export const CheckRoleMiddleware = (roles: Roles[]) => async (request: Request): Promise<boolean> => {
    const userService = await UserService.GetInstance()
    const payload = request.payload

    if (!payload) {
        throw new BadRequestError("User isn't authorized, so you can't perform the action...")
    }

    const user = await userService.findByEmail(payload.email)

    if (!user) {
        throw new NotFoundError("User not found...")
    }

    return roles.includes(user.role as Roles)
}