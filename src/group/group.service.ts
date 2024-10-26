import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { NotFoundError } from "../../lib/errors/not-found.error";
import { MemberOpDto } from "./dto/member-op.dto";
import { UserService } from "../user/user.service";
import { BadRequestError } from "../../lib/errors/bad-request.error";

export class GroupService {
    private static instance: GroupService

    private constructor(
        private readonly prisma: PrismaClient,
        private readonly userService: UserService
    ) {}

    public static async GetInstance() {
        if (!GroupService.instance) {
            const prisma = await PrismaService.GetInstance()
            const userService = await UserService.GetInstance()

            GroupService.instance = new GroupService(prisma, userService)
        }

        return GroupService.instance
    }

    public async addMember(memberOpDto: MemberOpDto) {
        const {user, group, isMember} = await this.isMember(memberOpDto)

        if (isMember) {
            throw new BadRequestError("This user is already a member of the group...")
        }

        if (user.id == memberOpDto.currentUserId) {
            throw new BadRequestError("You can't join your own group...")
        }

        await this.prisma.groupMember.create({
            data: {
                group: {connect: {id: group.id}},
                user: {connect: {id: user.id}}
            }
        })
    }

    public async removeMember(memberOpDto: MemberOpDto) {
        const {user, group, isMember} = await this.isMember(memberOpDto)

        if (!isMember) {
            throw new BadRequestError("This user is not a member of the group...")
        }

        if (user.id == memberOpDto.currentUserId) {
            throw new BadRequestError("You can't exclude yourself from your own group...")
        }

        await this.prisma.groupMember.deleteMany({
            where: {
                groupId: group.id,
                userId: user.id
            }
        })
    }

    public async isMember(memberOpDto: MemberOpDto) {
        const user = await this.userService.findOne(parseInt(memberOpDto.userId))
        const group = await this.findOne(parseInt(memberOpDto.groupId))

        if (!user) {
            throw new NotFoundError("User not found...")
        }

        if (!group) {
            throw new NotFoundError("Group not found...")
        }

        const isMember = await this.prisma.groupMember.findFirst({
            where: {userId: user.id, groupId: group.id}
        })

        return {user, group, isMember: !!isMember}
    }
    
    public async findOne(id: number) {
        return this.prisma.group.findFirst({where: {id}})
    }

    public async create(createGroupDto: CreateGroupDto) {
        const group = await this.prisma.group.create({
            data: {
                name: createGroupDto.name,
                description: createGroupDto.description,
                creator: {connect: {id: createGroupDto.userId}}
            }
        })

        await this.addMember({ groupId: group.id.toString(), userId: createGroupDto.userId.toString(), currentUserId: 0})
    }

    public async update(id: number, updateGroupDto: UpdateGroupDto) {
        const group = await this.findOne(id)

        if (!group) {
            throw new NotFoundError("Group not found...")
        }

        return this.prisma.group.update({
            where: {id},
            data: updateGroupDto
        })
    }

    public async delete(id: number) {
        const group = await this.findOne(id)

        if (!group) {
            throw new NotFoundError("Group not found...")
        }

        this.prisma.group.delete({where: {id}})
    }
}