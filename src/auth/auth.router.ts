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
    const auth = await AuthController.GetInstance()
    const router = new Router()

    router.post("/auth/sign-up", auth.signUp.bind(auth), [
        ValidateDtoMiddleware(SignUpDto, 'body')
    ])

    router.post("/auth/sign-in", auth.signIn.bind(auth), [
        ValidateDtoMiddleware(SignInDto, 'body')
    ])

    router.post("/auth/sign-out", auth.signOut.bind(auth), [
        CheckAuthorizedMiddleware('accessToken', 'jwt')
    ])

    router.get("/auth/me", auth.me.bind(auth), [
        CheckAuthorizedMiddleware("accessToken", "jwt")
    ])

    return router
}
