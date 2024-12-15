import { Router } from "../../lib/request/router";
import { CheckAuthorizedMiddleware } from "../auth/middleware/check-authorized.middleware";
import { CheckOwnershipMiddleware } from "../common/middleware/check-ownership.middleware";
import { ValidateDtoMiddleware } from "../common/middleware/validate-dto.middleware";
import { CreateGroupDto } from "./dto/create-group.dto";
import { MemberOpDto } from "./dto/member-op.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { GroupController } from "./group.controller";
import { GroupService } from "./group.service";
import { PaginationDto } from "../common/dto/pagination.dto";

export const createGroupRouter = async () => {
    const controller = await GroupController.resolve();
    const service = await GroupService.resolve();
    const router = new Router();

    router.get(
        "/users/groups",
        controller.getCurrentUserGroups.bind(controller),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            ValidateDtoMiddleware(PaginationDto, "query"),
        ]
    );

    router.get("/users/:id/groups", controller.getUserGroups.bind(controller), [
        ValidateDtoMiddleware(PaginationDto, "query"),
    ]);

    router.delete(
        "/groups/:groupId/members/:userId",
        controller.removeMember.bind(controller),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            ValidateDtoMiddleware(MemberOpDto, "params"),
            CheckOwnershipMiddleware(
                "groupId",
                "creatorId",
                service.findOne.bind(service)
            ),
        ]
    );

    router.put(
        "/groups/:groupId/members/:userId",
        controller.addMember.bind(controller),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            ValidateDtoMiddleware(MemberOpDto, "params"),
            CheckOwnershipMiddleware(
                "groupId",
                "creatorId",
                service.findOne.bind(service)
            ),
        ]
    );

    router.get("/groups/:id", controller.findOne.bind(controller));

    router.post("/groups", controller.create.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(CreateGroupDto, "body"),
    ]);

    router.patch("/groups/:id", controller.update.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(UpdateGroupDto, "body"),
        CheckOwnershipMiddleware(
            "id",
            "creatorId",
            service.findOne.bind(service)
        ),
    ]);

    router.delete("/groups/:id", controller.delete.bind(controller), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckOwnershipMiddleware(
            "id",
            "creatorId",
            service.findOne.bind(service)
        ),
    ]);

    return router;
};
