import { Router } from "../../lib/request/router";
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserController } from "./user.controller";

export const createUserRouter = async () => {
    const controller = await UserController.resolve();
    const router = new Router();

    router.get("/users", controller.findAll.bind(controller), [
        ValidateDtoMiddleware(PaginationDto, "query"),
    ]);

    router.get("/users/:id", controller.findOne.bind(controller));

    router.patch("/users", controller.update.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(UpdateUserDto, "body"),
    ]);

    return router;
};
