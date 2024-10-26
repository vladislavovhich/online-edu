import { MaxLength, MinLength } from "class-validator";

export class CreateMessageDto {
    @MinLength(1)
    @MaxLength(255)
    text: string

    senderId: number
    groupId: number
}