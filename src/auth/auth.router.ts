import { validate } from "class-validator";
import { Request } from "../../lib/request/request";
import { Router } from "../../lib/request/router";
import { Roles } from "../common/enums";
import { AuthController } from "./auth.controller";
import { SignUpDto } from "./dto/sign-up.dto";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";

export const init = async () => {
    const auth = await AuthController.GetInstance()
    const router = new Router()

    router.post("/auth/sign-up", auth.signUp, [
        ValidateDtoMiddleware(SignUpDto, 'body')
    ])

    return router
}
