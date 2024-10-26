import { MinLength, MaxLength, IsOptional } from "class-validator"

export class UpdateGroupDto {
    @IsOptional()
    @MinLength(1)
    @MaxLength(25)
    name?: string

    @IsOptional()
    @MinLength(1)
    @MaxLength(25)
    description?: string
    
    userId: number
}