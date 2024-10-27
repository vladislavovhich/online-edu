import { Type } from "class-transformer"
import { IsString, MinLength, MaxLength, IsISO8601, MinDate, IsOptional } from "class-validator"

export class UpdateLectureDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(35)
    name?: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    description?: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(35)
    subject?: string

    @IsOptional()
    @IsISO8601()
    @Type(() => Date)
    @MinDate(() => new Date(Date.now()))
    date?: Date
}