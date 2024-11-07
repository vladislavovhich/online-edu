import { plainToInstance } from "class-transformer";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { Request } from "../../lib/request/request";
import { Response } from "../../lib/response/response";
import { HttpStatus } from "../../lib/types/response.types";
import { extractUser } from "../common/helpers/extract-user.helper";
import { UserService } from "../user/user.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { MemberOpDto } from "./dto/member-op.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { GroupService } from "./group.service";
import { GetGroupDto } from "./dto/get-group.dto";
import { PaginationDto } from "../common/dto/pagination.dto";

export class GroupController {
    private static instance: GroupController;

    private constructor(
        private readonly groupService: GroupService,
        private readonly userService: UserService
    ) {}

    public static async GetInstance() {
        if (!GroupController.instance) {
            const groupService = await GroupService.GetInstance();
            const userService = await UserService.GetInstance();

            GroupController.instance = new GroupController(
                groupService,
                userService
            );
        }

        return GroupController.instance;
    }

    public async addMember(request: Request) {
        const memberOpDto = plainToInstance(MemberOpDto, request.params);
        const user = await extractUser(request);

        memberOpDto.currentUserId = user.id;

        console.log(memberOpDto);

        await this.groupService.addMember(memberOpDto);

        return new Response().text(
            HttpStatus.OK,
            "User is added to the group..."
        );
    }

    public async removeMember(request: Request) {
        const memberOpDto = plainToInstance(MemberOpDto, request.params);
        const user = await extractUser(request);

        memberOpDto.currentUserId = user.id;

        await this.groupService.removeMember(memberOpDto);

        return new Response().text(
            HttpStatus.OK,
            "User is removed from the group..."
        );
    }

    public async getCurrentUserGroups(request: Request) {
        const user = await extractUser(request);
        const paginationDto = plainToInstance(PaginationDto, request.query);
        const groups = await this.groupService.getUserGroups(
            user.id,
            paginationDto
        );

        return new Response().json(HttpStatus.OK, groups);
    }

    public async getUserGroups(request: Request) {
        const userId = parseInt(request.params.id);
        const paginationDto = plainToInstance(PaginationDto, request.query);
        const groups = await this.groupService.getUserGroups(
            userId,
            paginationDto
        );

        return new Response().json(HttpStatus.OK, groups);
    }

    public async findOne(request: Request) {
        const groupId = parseInt(request.params.id);
        const group = await this.groupService.findOneSave(groupId);
        const groupDto = new GetGroupDto(group);

        return new Response().json(HttpStatus.OK, { group: groupDto });
    }

    public async create(request: Request) {
        const createGroupDto = plainToInstance(CreateGroupDto, request.body);
        const user = await extractUser(request);

        createGroupDto.userId = user.id;

        const group = await this.groupService.create(createGroupDto);
        const groupDto = new GetGroupDto(group);

        return new Response().json(HttpStatus.OK, { group: groupDto });
    }

    public async update(request: Request) {
        const updateGroupDto = plainToInstance(UpdateGroupDto, request.body);
        const user = await extractUser(request);

        updateGroupDto.userId = user.id;

        const groupId = parseInt(request.params.id);
        const group = await this.groupService.update(groupId, updateGroupDto);
        const groupDto = new GetGroupDto(group);

        return new Response().json(HttpStatus.OK, { group: groupDto });
    }

    public async delete(request: Request) {
        const groupId = parseInt(request.params.id);

        await this.groupService.delete(groupId);

        return new Response().text(
            HttpStatus.OK,
            "Group is successfully deleted..."
        );
    }
}
