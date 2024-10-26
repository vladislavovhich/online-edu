import { BadRequestError } from "../../lib/errors/bad-request.error";
import { Request } from "../../lib/request/request";
import { Response } from "../../lib/response/response";
import { HttpStatus } from "../../lib/types/response.types";
import { UserService } from "../user/user.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { MemberOpDto } from "./dto/member-op.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { GroupService } from "./group.service";

export class GroupController {
    private static instance: GroupController

    private constructor(
        private readonly groupService: GroupService,
        private readonly userService: UserService,
    ) {}

    public static async GetInstance() {
        if (!GroupController.instance) {
            const groupService = await GroupService.GetInstance()
            const userService = await UserService.GetInstance()

            GroupController.instance = new GroupController(groupService, userService)
        }

        return GroupController.instance
    }

    public async addMember(request: Request) {
        const memberOpDto = Object.assign(new MemberOpDto(), request.params)

        if (!request.payload) {
            throw new BadRequestError("User isn't authorized, so you can't access this resource...")
        }

        const user = await this.userService.findByEmail(request.payload.email)

        if (!user) {
            throw new BadRequestError("User isn't specified...")
        }

        memberOpDto.currentUserId = user.id

        await this.groupService.addMember(memberOpDto)

        return new Response()
            .text(HttpStatus.OK, "User is added to the group...")
    }

    public async removeMember(request: Request) {
        const memberOpDto = Object.assign(new MemberOpDto(), request.params)

        if (!request.payload) {
            throw new BadRequestError("User isn't authorized, so you can't access this resource...")
        }

        const user = await this.userService.findByEmail(request.payload.email)

        if (!user) {
            throw new BadRequestError("User isn't specified...")
        }

        memberOpDto.currentUserId = user.id

        await this.groupService.removeMember(memberOpDto)

        return new Response()
            .text(HttpStatus.OK, "User is removed from the group...")
    }

    public async findOne(request: Request) {
        const groupId = parseInt(request.params.id)
        const group = await this.groupService.findOne(groupId)
        
        return new Response()
            .json(HttpStatus.OK, JSON.stringify({group}))
    }

    public async create(request: Request) {
        const createGroupDto = Object.assign(new CreateGroupDto(), request.body)

        if (!request.payload) {
            throw new BadRequestError("User isn't authorized, so you can't access this resource...")
        }

        const user = await this.userService.findByEmail(request.payload.email)

        if (!user) {
            throw new BadRequestError("User isn't specified...")
        }

        createGroupDto.userId = user.id

        const group = await this.groupService.create(createGroupDto)

        return new Response()
            .json(HttpStatus.OK, JSON.stringify({group}))
    }

    public async update(request: Request) {
        const updateGroupDto = Object.assign(new UpdateGroupDto(), request.body)

        if (!request.payload) {
            throw new BadRequestError("User isn't authorized, so you can't access this resource...")
        }

        const user = await this.userService.findByEmail(request.payload.email)

        if (!user) {
            throw new BadRequestError("User isn't specified...")
        }

        updateGroupDto.userId = user.id

        const groupId = parseInt(request.params.id)
        const group = await this.groupService.update(groupId, updateGroupDto)

        return new Response()
            .json(HttpStatus.OK, JSON.stringify({group}))
    }

    public async delete(request: Request) {
        const groupId = parseInt(request.params.id)

        await this.groupService.delete(groupId)

        return new Response()
            .text(HttpStatus.OK, "Group is successfully deleted...")
    }
}