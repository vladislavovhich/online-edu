import { ForbiddenError } from "../../../lib/errors/forbidden.error";
import { Request } from "../../../lib/request/request";
import { JwtService } from "../../jwt/jwt.service";
import { JwtPayload } from "../../jwt/jwt.types";

export const CheckAuthorizedMiddleware = (tokenType: "accessToken" | "refreshToken", tokenCookieName: "jwt" | "jwt-refresh") => {
    return async (request: Request): Promise<boolean> => {
        try {
            const tokenFromCookies = request.cookie[tokenCookieName]
            const jwtService = JwtService.GetInstance()
            const decoded = await jwtService.verifyToken(tokenFromCookies, tokenType)

            if (decoded) {
                request.payload = decoded as JwtPayload
                
                return true
            } 

            return false
        } catch (e: unknown) {
            throw new ForbiddenError("No token specified...")
        }
    }
}