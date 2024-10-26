import { Router } from "../../lib/request/router"
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UserController } from "./user.controller"

export const createUserRouter = async () => {
    const user = await UserController.GetInstance()
    const router = new Router()

    router.get("/users/:id", user.findOne.bind(user))

    router.patch("/users/:id", user.update.bind(user), [
        ValidateDtoMiddleware(UpdateUserDto, 'body')
    ])

    return router
}