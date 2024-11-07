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
    const group = await GroupController.GetInstance();
    const groupService = await GroupService.GetInstance();
    const router = new Router();

    router.get("/users/groups", group.getCurrentUserGroups.bind(group), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(PaginationDto, "query"),
    ]);

    router.get("/users/:id/groups", group.getUserGroups.bind(group), [
        ValidateDtoMiddleware(PaginationDto, "query"),
    ]);

    router.delete(
        "/groups/:groupId/members/:userId",
        group.removeMember.bind(group),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            ValidateDtoMiddleware(MemberOpDto, "params"),
            CheckOwnershipMiddleware(
                "groupId",
                "creatorId",
                groupService.findOne.bind(groupService)
            ),
        ]
    );

    router.put(
        "/groups/:groupId/members/:userId",
        group.addMember.bind(group),
        [
            CheckAuthorizedMiddleware("accessToken", "jwt"),
            ValidateDtoMiddleware(MemberOpDto, "params"),
            CheckOwnershipMiddleware(
                "groupId",
                "creatorId",
                groupService.findOne.bind(groupService)
            ),
        ]
    );

    router.get("/groups/:id", group.findOne.bind(group));

    router.post("/groups", group.create.bind(group), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(CreateGroupDto, "body"),
    ]);

    router.patch("/groups/:id", group.update.bind(group), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        ValidateDtoMiddleware(UpdateGroupDto, "body"),
        CheckOwnershipMiddleware(
            "id",
            "creatorId",
            groupService.findOne.bind(groupService)
        ),
    ]);

    router.delete("/groups/:id", group.delete.bind(group), [
        CheckAuthorizedMiddleware("accessToken", "jwt"),
        CheckOwnershipMiddleware(
            "id",
            "creatorId",
            groupService.findOne.bind(groupService)
        ),
    ]);

    return router;
};
