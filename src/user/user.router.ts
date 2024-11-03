import { Router } from "../../lib/request/router";
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserController } from "./user.controller";

export const createUserRouter = async () => {
    const user = await UserController.GetInstance();
    const router = new Router();

    router.get("/users/:id", user.findOne.bind(user));

    router.patch("/users", user.update.bind(user), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(UpdateUserDto, "body"),
    ]);

    return router;
};
