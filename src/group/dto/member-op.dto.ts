import { Type } from "class-transformer"
import { IsInt, IsNumberString, Min } from "class-validator"

export class MemberOpDto {
    @IsNumberString()
    groupId: string

    @IsNumberString()
    userId: string

    currentUserId: number
}