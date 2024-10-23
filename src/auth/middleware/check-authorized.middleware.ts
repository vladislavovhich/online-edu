import { ForbiddenError } from "../../../lib/errors/forbidden.error";
import { Request } from "../../../lib/request/request";
import { JwtService } from "../../jwt/jwt.service";

export const CheckAuthorizedMiddleware = (tokenType: "accessToken" | "refreshToken", tokenCookieName: "jwt" | "jwt-refresh") => {
    return async (request: Request): Promise<boolean> => {
        try {
            const tokenFromCookies = request.cookie[tokenCookieName]
            const jwtService = JwtService.GetInstance()
            const isValid = await jwtService.verifyToken(tokenFromCookies, tokenType)

            return !!isValid
        } catch (e: unknown) {
            throw new ForbiddenError("No token specified...")
        }
    }
}