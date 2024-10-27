import { BadRequestError } from "../../lib/errors/bad-request.error"
import { HttpStatus } from "../../lib/types/response.types"
import { CreateGroupDto } from "../group/dto/create-group.dto"
import { UpdateGroupDto } from "../group/dto/update-group.dto"
import { UserService } from "../user/user.service"
import { MessageService } from "./message.service"
import { Request } from "../../lib/request/request"
import { Response } from "../../lib/response/response"
import { CreateMessageDto } from "./dto/create-message.dto"
import { extractUser } from "../common/helpers/extract-user.helper"
import { plainToInstance } from "class-transformer"
import { GetMessageDto } from "./dto/get-message.dto"
import { PaginationDto } from "../common/dto/pagination.dto"

export class MessageController {
    private static instance: MessageController

    private constructor(
        private readonly messageService: MessageService,
        private readonly userService: UserService,
    ) {}

    public static async GetInstance() {
        if (!MessageController.instance) {
            const messageService = await MessageService.GetInstance()
            const userService = await UserService.GetInstance()

            MessageController.instance = new MessageController(messageService, userService)
        }

        return MessageController.instance
    }

    public async getGroupMessages(request: Request) {
        const groupId = parseInt(request.params.id)
        const paginationDto = plainToInstance(PaginationDto, request.query)
        const messages = await this.messageService.getGroupMessages(groupId, paginationDto)
        
        return new Response()
            .json(HttpStatus.OK, messages)
    }

    public async findOne(request: Request) {
        const messageId = parseInt(request.params.id)
        const message = await this.messageService.findOneSave(messageId)
        const messsageDto = new GetMessageDto(message)

        return new Response()
            .json(HttpStatus.OK, {message: messsageDto})
    }

    public async create(request: Request) {
        const createMessageDto = plainToInstance(CreateMessageDto, request.body)
        const user = await extractUser(request)

        createMessageDto.senderId = user.id
        createMessageDto.groupId = parseInt(request.params.groupId)

        const message = await this.messageService.create(createMessageDto)
        const messsageDto = new GetMessageDto(message)

        return new Response()
            .json(HttpStatus.OK, {message: messsageDto})
    }

    public async update(request: Request) {
        const createMessageDto = plainToInstance(CreateMessageDto, request.body)
        const groupId = parseInt(request.params.id)
        const message = await this.messageService.update(groupId, createMessageDto.text)
        const messsageDto = new GetMessageDto(message)

        return new Response()
            .json(HttpStatus.OK, {message: messsageDto})
    }

    public async delete(request: Request) {
        const messageId = parseInt(request.params.id)

        await this.messageService.delete(messageId)

        return new Response()
            .text(HttpStatus.OK, "Message is successfully deleted...")
    }
}