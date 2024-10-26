import { BadRequestError } from "../../lib/errors/bad-request.error"
import { HttpStatus } from "../../lib/types/response.types"
import { CreateGroupDto } from "../group/dto/create-group.dto"
import { UpdateGroupDto } from "../group/dto/update-group.dto"
import { UserService } from "../user/user.service"
import { MessageService } from "./message.service"
import { Request } from "../../lib/request/request"
import { Response } from "../../lib/response/response"
import { CreateMessageDto } from "./dto/create-message.dto"

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

    public async findOne(request: Request) {
        const messageId = parseInt(request.params.id)
        const message = await this.messageService.findOne(messageId)
        
        return new Response()
            .json(HttpStatus.OK, JSON.stringify({message}))
    }

    public async create(request: Request) {
        const createMessageDto = Object.assign(new CreateMessageDto(), request.body)

        if (!request.payload) {
            throw new BadRequestError("User isn't authorized, so you can't access this resource...")
        }

        const user = await this.userService.findByEmail(request.payload.email)

        if (!user) {
            throw new BadRequestError("User isn't specified...")
        }

        createMessageDto.senderId = user.id
        createMessageDto.groupId = parseInt(request.params.groupId)

        const message = await this.messageService.create(createMessageDto)

        return new Response()
            .json(HttpStatus.OK, JSON.stringify({message}))
    }

    public async update(request: Request) {
        const createMessageDto = Object.assign(new CreateMessageDto(), request.body)

        if (!request.payload) {
            throw new BadRequestError("User isn't authorized, so you can't access this resource...")
        }

        const user = await this.userService.findByEmail(request.payload.email)

        if (!user) {
            throw new BadRequestError("User isn't specified...")
        }

        const groupId = parseInt(request.params.id)
        const message = await this.messageService.update(groupId, createMessageDto.text)

        return new Response()
            .json(HttpStatus.OK, JSON.stringify({message}))
    }

    public async delete(request: Request) {
        const messageId = parseInt(request.params.id)

        await this.messageService.delete(messageId)

        return new Response()
            .text(HttpStatus.OK, "Message is successfully deleted...")
    }
}