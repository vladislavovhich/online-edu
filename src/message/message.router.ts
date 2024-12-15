import { Router } from "../../lib/request/router";
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware";
import { PaginationDto } from "../common/dto/pagination.dto";
import { CheckOwnershipMiddleware } from "../common/middleware/check-ownership.middleware";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";
import { CreateMessageDto } from "./dto/create-message.dto";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { GroupMessage } from "@prisma/client";

export const createMessageRouter = async () => {
    const controller = await MessageController.resolve();
    const service = await MessageService.resolve();
    const router = new Router();

    router.get(
        "/groups/:id/messages",
        controller.getGroupMessages.bind(controller),
        [ValidateDtoMiddleware(PaginationDto, "query")]
    );

    router.post(
        "/groups/:groupId/messages",
        controller.create.bind(controller),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            ValidateDtoMiddleware(CreateMessageDto, "body"),
        ]
    );

    router.patch("/messages/:id", controller.update.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(CreateMessageDto, "body"),
        CheckOwnershipMiddleware(
            "id",
            "senderId",
            service.findOne.bind(service)
        ),
    ]);

    router.delete("/messages/:id", controller.delete.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckOwnershipMiddleware(
            "id",
            "senderId",
            service.findOne.bind(service)
        ),
    ]);

    return router;
};
