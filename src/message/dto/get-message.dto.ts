import { GetUserDto } from "../../user/dto/get-user.dto"
import { GroupMessage, User } from "@prisma/client"

export class GetMessageDto {
    private id: number
    private text: string
    private sender: GetUserDto
    private createdAt: Date

    constructor(message: GroupMessage & {
        sender: User
    }) {
        Object.assign(this, {
            id: message.id,
            text: message.text,
            sender: new GetUserDto(message.sender),
            createdAt: message.createdAt
        })
    }
}