import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { NotFoundError } from "../../lib/errors/not-found.error";
import { MemberOpDto } from "./dto/member-op.dto";
import { UserService } from "../user/user.service";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { PaginationDto } from "../common/dto/pagination.dto";
import { GetGroupsDto } from "./dto/get-groups.dto";
import { GetGroupDto } from "./dto/get-group.dto";

export class GroupService {
    private static instance: GroupService;

    private constructor(
        private readonly prisma: PrismaClient,
        private readonly userService: UserService
    ) {}

    public static async GetInstance() {
        if (!GroupService.instance) {
            const prisma = await PrismaService.GetInstance();
            const userService = await UserService.GetInstance();

            GroupService.instance = new GroupService(prisma, userService);
        }

        return GroupService.instance;
    }

    public async getUserGroups(userId: number, paginationDto: PaginationDto) {
        await this.userService.findOneSave(userId);

        const { pageSize, offset } = paginationDto;
        const groupsMember = await this.prisma.groupMember.findMany({
            take: pageSize,
            skip: offset,
            where: {
                userId,
            },
            include: {
                group: {
                    include: {
                        creator: true,
                        members: {
                            include: {
                                user: true,
                                group: true,
                            },
                        },
                    },
                },
            },
        });

        const count = await this.prisma.groupMember.count({
            where: { userId },
        });
        const groupsDto: GetGroupDto[] = [];

        for (let groupMember of groupsMember) {
            const lastMessage = await this.prisma.groupMessage.findFirst({
                where: { groupId: groupMember.groupId },
                include: { sender: true },
                orderBy: { createdAt: "desc" },
            });

            groupsDto.push(new GetGroupDto(groupMember.group, lastMessage));
        }

        return new GetGroupsDto(groupsDto, count, paginationDto);
    }

    public async addMember(memberOpDto: MemberOpDto) {
        const { user, group, isMember } = await this.isMember(memberOpDto);

        if (isMember) {
            throw new BadRequestError(
                "This user is already a member of the group..."
            );
        }

        if (user.id == memberOpDto.currentUserId) {
            throw new BadRequestError("You can't join your own group...");
        }

        await this.prisma.groupMember.create({
            data: {
                group: { connect: { id: group.id } },
                user: { connect: { id: user.id } },
            },
        });
    }

    public async removeMember(memberOpDto: MemberOpDto) {
        const { user, group, isMember } = await this.isMember(memberOpDto);

        if (!isMember) {
            throw new BadRequestError(
                "This user is not a member of the group..."
            );
        }

        if (user.id == memberOpDto.currentUserId) {
            throw new BadRequestError(
                "You can't exclude yourself from your own group..."
            );
        }

        await this.prisma.groupMember.deleteMany({
            where: {
                groupId: group.id,
                userId: user.id,
            },
        });
    }

    public async isMember(memberOpDto: MemberOpDto) {
        const user = await this.userService.findOneSave(memberOpDto.userId);
        const group = await this.findOneSave(memberOpDto.groupId);

        const isMember = await this.prisma.groupMember.findFirst({
            where: { userId: user.id, groupId: group.id },
        });

        return { user, group, isMember: !!isMember };
    }

    public async findOne(id: number) {
        return this.prisma.group.findFirst({
            where: { id },
            include: {
                creator: true,
                members: {
                    include: {
                        user: true,
                        group: true,
                    },
                },
            },
        });
    }

    public async findOneSave(id: number) {
        const group = await this.findOne(id);

        if (!group) {
            throw new NotFoundError("Group not found...");
        }

        return group;
    }

    public async create(createGroupDto: CreateGroupDto) {
        const group = await this.prisma.group.create({
            data: {
                name: createGroupDto.name,
                description: createGroupDto.description,
                creator: { connect: { id: createGroupDto.userId } },
            },
        });

        await this.addMember({
            groupId: group.id,
            userId: createGroupDto.userId,
            currentUserId: 0,
        });

        return this.findOneSave(group.id);
    }

    public async update(id: number, updateGroupDto: UpdateGroupDto) {
        await this.findOneSave(id);

        const group = await this.prisma.group.update({
            where: { id },
            data: {
                name: updateGroupDto.name,
                description: updateGroupDto.description,
            },
        });

        return this.findOneSave(id);
    }

    public async delete(id: number) {
        await this.findOneSave(id);

        await this.prisma.group.delete({ where: { id } });
    }
}
