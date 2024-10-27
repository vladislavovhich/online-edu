import { validate } from "class-validator";
import { Request } from "../../../lib/request/request";
import { BadRequestError } from "../../../lib/errors/bad-request.error";
import { Roles } from "../enums";
import { UserService } from "../../user/user.service";
import { NotFoundError } from "../../../lib/errors/not-found.error";
import { extractUser } from "../helpers/extract-user.helper";

export const CheckRoleMiddleware = (roles: Roles[]) => async (request: Request): Promise<boolean> => {
    const user = await extractUser(request)

    return roles.includes(user.role as Roles)
}