import { validate } from "class-validator";
import { Request } from "../../../lib/request/request";
import { BadRequestError } from "../../../lib/errors/bad-request.error";
import { plainToInstance } from "class-transformer";

export const ValidateDtoMiddleware = <T extends object>(dtoClass: new () => T, property: 'body' | 'params' | 'query' ) => async (request: Request): Promise<boolean> => {
    const dto = plainToInstance(dtoClass, request[property])
    
    try 
    {
        const errors = await validate(dto)

        if (errors.length) {
            const messages = errors
                .map(error => Object.values(error.constraints || {}))
                .flat()
                .join(", ")

            throw new BadRequestError(`Failed to validate dto, it has following errors: ${messages}`)
        }
    }
    catch (e: unknown) {
        throw e
    }

    return true
}