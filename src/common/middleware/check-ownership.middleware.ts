import { UserService } from "../../user/user.service";
import { Request } from "../../../lib/request/request";
import { BadRequestError } from "../../../lib/errors/bad-request.error";
import { NotFoundError } from "../../../lib/errors/not-found.error";

export const CheckOwnershipMiddleware = <T>(
    itemIdName: string,
    ownerIdName: keyof T,
    getItem: (id: number) => Promise<T | null>
) => {
    return async (request: Request): Promise<boolean> => {
        const userService = await UserService.resolve();
        const payload = request.payload;

        const itemId = parseInt(request.params[itemIdName]);

        if (!payload) {
            throw new BadRequestError(
                "User isn't authorized, so you can't perform the action..."
            );
        }

        const user = await userService.findByEmail(payload.email);

        if (!user) {
            throw new NotFoundError("User not found...");
        }

        const item = await getItem(itemId);

        return !!item && user.id == item[ownerIdName];
    };
};
