import { BadRequestError } from "../../../lib/errors/bad-request.error";
import { Request } from "../../../lib/request/request";
import { UserService } from "../../user/user.service";

export const extractUser = async (request: Request) => {
    const userService = await UserService.GetInstance();

    if (!request.payload) {
        throw new BadRequestError(
            "User isn't authorized, so you can't access this resource..."
        );
    }

    const user = await userService.findByEmail(request.payload.email);

    if (!user) {
        throw new BadRequestError("User isn't specified...");
    }

    return userService.findOneSave(user.id);
};
