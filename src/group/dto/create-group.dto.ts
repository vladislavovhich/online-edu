import { MaxLength, MinLength } from "class-validator"

export class CreateGroupDto {
    @MinLength(1)
    @MaxLength(25)
    name: string

    @MinLength(1)
    @MaxLength(25)
    description: string
    
    userId: number
}