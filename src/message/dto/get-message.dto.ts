import { GetUserDto, GetUserInfoDto } from "../../user/dto/get-user.dto";
import { GroupMessage, User } from "@prisma/client";

export class GetMessageDto {
    private id: number;
    private text: string;
    private sender: GetUserInfoDto;
    private createdAt: Date;

    constructor(
        message: GroupMessage & {
            sender: User;
        }
    ) {
        Object.assign(this, {
            id: message.id,
            text: message.text,
            sender: new GetUserInfoDto(message.sender),
            createdAt: message.createdAt,
        });
    }
}
