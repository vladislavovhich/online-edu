import { Group, GroupMember, GroupMessage, User } from "@prisma/client"
import { GetUserDto } from "../../user/dto/get-user.dto"
import { GetMessageDto } from "../../message/dto/get-message.dto"

export class GetGroupDto {
    private id: number
    private name: string
    private description: string
    private creator: GetUserDto
    private members: GetUserDto[]
    private lastMessage: GetMessageDto | null

    constructor(
        group: Group & {
            creator: User,
            members: {group: Group, user: User}[]
        }, 
        message: (GroupMessage & {sender: User}) | null = null
    ) {
        Object.assign(this, {
            id: group.id,
            name: group.name,
            description: group.description,
            creator: new GetUserDto(group.creator),
            members: group.members.map(groupMember => new GetUserDto(groupMember.user)),
            lastMessage: message && new GetMessageDto(message)
        })
    }
}