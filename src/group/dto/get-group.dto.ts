import { Group, GroupMember, GroupMessage, User } from "@prisma/client";
import { GetUserDto, GetUserInfoDto } from "../../user/dto/get-user.dto";
import { GetMessageDto } from "../../message/dto/get-message.dto";

export class GetGroupDto {
    id: number;
    name: string;
    description: string;
    creator: GetUserDto;
    members: GetUserDto[];
    lastMessage: GetMessageDto | null;

    constructor(
        group: Group & {
            creator: User;
            members: { group: Group; user: User }[];
        },
        message: (GroupMessage & { sender: User }) | null = null
    ) {
        Object.assign(this, {
            id: group.id,
            name: group.name,
            description: group.description,
            creator: new GetUserInfoDto(group.creator),
            members: group.members.map(
                (groupMember) => new GetUserInfoDto(groupMember.user)
            ),
            lastMessage: message && new GetMessageDto(message),
        });
    }
}
