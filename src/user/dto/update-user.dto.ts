import { MinLength, MaxLength, IsOptional } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @MinLength(5)
    @MaxLength(15)
    password?: string;

    @MinLength(1)
    @MaxLength(15)
    name: string;

    @MinLength(1)
    @MaxLength(15)
    surname: string;

    userId: number;
}
