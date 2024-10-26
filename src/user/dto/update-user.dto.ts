import { MinLength, MaxLength } from "class-validator"

export class UpdateUserDto {
    @MinLength(5)
    @MaxLength(15)
    password: string

    @MinLength(1)
    @MaxLength(15)
    name: string

    @MinLength(1)
    @MaxLength(15)
    surname: string

    userId: number
}