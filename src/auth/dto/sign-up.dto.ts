import { IsAlphanumeric, IsEmail, IsEnum, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from "class-validator"
import { Roles } from "../../common/enums"

export class SignUpDto {
    @IsEmail()
    email: string
    
    @MinLength(5)
    @MaxLength(15)
    password: string

    @MinLength(1)
    @MaxLength(15)
    name: string

    @MinLength(1)
    @MaxLength(15)
    surname: string

    @IsEnum(Roles)
    role: Roles
}