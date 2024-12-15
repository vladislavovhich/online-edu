import { Type } from "class-transformer";
import { IsInt, IsNumberString, Min } from "class-validator";
import "reflect-metadata";

export class MemberOpDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    groupId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    userId: number;

    currentUserId: number;
}
