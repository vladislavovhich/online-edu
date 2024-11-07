import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { GroupService } from "../group/group.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { NotFoundError } from "../../lib/errors/not-found.error";
import { PaginationDto } from "../common/dto/pagination.dto";
import { GetMessageDto } from "./dto/get-message.dto";
import { GetMessagesDto } from "./dto/get-messages.dto";

export class MessageService {
    private static instance: MessageService;

    private constructor(
        private readonly prisma: PrismaClient,
        private readonly groupService: GroupService
    ) {}

    public static async GetInstance() {
        if (!MessageService.instance) {
            const prisma = await PrismaService.GetInstance();
            const groupService = await GroupService.GetInstance();

            MessageService.instance = new MessageService(prisma, groupService);
        }

        return MessageService.instance;
    }

    public async getGroupMessages(
        groupId: number,
        paginationDto: PaginationDto
    ) {
        await this.groupService.findOneSave(groupId);

        const { pageSize, offset } = paginationDto;
        const messages = await this.prisma.groupMessage.findMany({
            take: pageSize,
            skip: offset,
            include: {
                sender: true,
            },
            where: {
                groupId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const count = await this.prisma.groupMessage.count({
            where: { groupId },
        });
        const messagesDto = messages.map(
            (message) => new GetMessageDto(message)
        );

        return new GetMessagesDto(messagesDto, count, paginationDto);
    }

    public async findOne(id: number) {
        return this.prisma.groupMessage.findFirst({
            where: { id },
            include: {
                sender: true,
            },
        });
    }

    public async findOneSave(id: number) {
        const message = await this.findOne(id);

        if (!message) {
            throw new NotFoundError("Message not found...");
        }

        return message;
    }

    public async create(createMessageDto: CreateMessageDto) {
        await this.groupService.findOneSave(createMessageDto.groupId);

        const message = await this.prisma.groupMessage.create({
            data: {
                text: createMessageDto.text,
                sender: { connect: { id: createMessageDto.senderId } },
                group: { connect: { id: createMessageDto.groupId } },
            },
        });

        return this.findOneSave(message.id);
    }

    public async update(id: number, text: string) {
        await this.findOneSave(id);

        await this.prisma.groupMessage.update({
            where: { id },
            data: {
                text,
            },
        });

        return this.findOneSave(id);
    }

    public async delete(id: number) {
        await this.findOneSave(id);

        await this.prisma.groupMessage.delete({ where: { id } });
    }
}
