import { IsString, MinLength, MaxLength, IsOptional } from "class-validator"

export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(45)
    name?: string

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    description?: string
}