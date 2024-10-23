import { IsString, MaxLength, MinLength } from "class-validator"

export class CreateCourseDto {
    @IsString()
    @MinLength(1)
    @MaxLength(45)
    name: string

    @IsString()
    @MinLength(3)
    @MaxLength(255)
    description: string
    
    mentorId: number
}