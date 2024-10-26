import { validate } from "class-validator";
import { Request } from "../../../lib/request/request";
import { BadRequestError } from "../../../lib/errors/bad-request.error";

export const ValidateDtoMiddleware = <T extends object>(dtoClass: new () => T, property: 'body' | 'params' | 'query' | 'params') => async (request: Request): Promise<boolean> => {
    const dto = Object.assign(new dtoClass(), request[property])

    try 
    {
        const errors = await validate(dto)

        if (errors.length) {
            throw new BadRequestError(`Failed to validate dto, it has following errors: ${errors.join(", ")}`)
        }
    }
    catch (e: unknown) {
        throw e
    }

    return true
}