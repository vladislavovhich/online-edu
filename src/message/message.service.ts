import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { GroupService } from "../group/group.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { NotFoundError } from "../../lib/errors/not-found.error";

export class MessageService {
    private static instance: MessageService

    private constructor(
        private readonly prisma: PrismaClient,
        private readonly groupService: GroupService
    ) {}

    public static async GetInstance() {
        if (!MessageService.instance) {
            const prisma = await PrismaService.GetInstance()
            const groupService = await GroupService.GetInstance()

            MessageService.instance = new MessageService(prisma, groupService)
        }

        return MessageService.instance
    }

    public async findOne(id: number) {
        return this.prisma.groupMessage.findFirst({ where: {id}})
    }

    public async create(createMessageDto: CreateMessageDto) {
        const group = await this.groupService.findOne(createMessageDto.groupId)

        if (!group) {
            throw new NotFoundError("Group not found...")
        }

        return this.prisma.groupMessage.create({
            data: {
                text: createMessageDto.text,
                sender: {connect: {id: createMessageDto.senderId}},
                group: {connect: {id: createMessageDto.groupId}},
            }
        })
    }

    public async update(id: number, text: string) {
        const group = await this.groupService.findOne(id)

        if (!group) {
            throw new NotFoundError("Group not found...")
        }

        const message = await this.findOne(id)

        if (!message) {
            throw new NotFoundError("Message not found...")
        }

        return this.prisma.groupMessage.update({
            where: {id},
            data: {
                text
            }
        })
    }

    public async delete(id: number) {
        const message = await this.findOne(id)

        if (!message) {
            throw new NotFoundError("Message not found...")
        } 

        await this.prisma.groupMessage.delete({where: {id}})
    }
}