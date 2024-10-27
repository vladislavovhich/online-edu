import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, Min } from "class-validator";
import 'reflect-metadata'

export class PaginationDto {
    @Type(() => Number)
    @IsOptional()
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @Min(1)
    page: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @Min(1)
    pageSize: number = 5

    get offset() {
        return (this.page - 1) * this.pageSize
    }
}