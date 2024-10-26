import { Router } from "../../lib/request/router"
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware"
import { CheckOwnershipMiddleware } from "../common/middleware/check-ownership.middleware"
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware"
import { CreateMessageDto } from "./dto/create-message.dto"
import { MessageController } from "./message.controller"
import { MessageService } from "./message.service"

export const createMessageRouter = async () => {
    const message = await MessageController.GetInstance()
    const messageService = await MessageService.GetInstance()
    const router = new Router()

    router.post("/groups/:groupId/messages", message.create.bind(message), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(CreateMessageDto, "body")
    ])
    
    router.patch("/messages/:id", message.update.bind(message), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(CreateMessageDto, "body"),
        CheckOwnershipMiddleware("id", "senderId", messageService.findOne.bind(messageService))
    ])

    router.delete("/messages/:id", message.delete.bind(message), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckOwnershipMiddleware("id", "creatorId", messageService.findOne.bind(messageService))
    ])

    return router
}