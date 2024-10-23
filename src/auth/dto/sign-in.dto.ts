import { IsEmail, MaxLength, MinLength } from "class-validator";

export class SignInDto {
    @IsEmail()
    email: string
    
    @MinLength(5)
    @MaxLength(15)
    password: string
}