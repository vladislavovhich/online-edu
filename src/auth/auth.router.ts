import { validate } from "class-validator";
import { Request } from "../../lib/request/request";
import { Router } from "../../lib/request/router";
import { Roles } from "../common/enums";
import { AuthController } from "./auth.controller";
import { SignUpDto } from "./dto/sign-up.dto";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";
import { SignInDto } from "./dto/sign-in.dto";
import { CheckAuthorizedMiddleware } from "./middleware/check-authorized.middleware";

export const createAuthRouter = async () => {
    const controller = await AuthController.resolve();
    const router = new Router();

    router.post("/auth/sign-up", controller.signUp.bind(controller), [
        ValidateDtoMiddleware(SignUpDto, "body"),
    ]);

    router.post("/auth/sign-in", controller.signIn.bind(controller), [
        ValidateDtoMiddleware(SignInDto, "body"),
    ]);

    router.post("/auth/sign-out", controller.signOut.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
    ]);

    router.get("/auth/me", controller.me.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
    ]);

    return router;
};
