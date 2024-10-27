import jwt from "jsonwebtoken"
import { JwtParams, JwtPayload, Token } from "./jwt.types"

export class JwtService {
    private static instance: JwtService

    private accessToken: JwtParams
    private refreshToken: JwtParams

    private constructor() {
        this.accessToken = {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expire: process.env.ACCESS_TOKEN_EXPIRE
        } as JwtParams

        this.refreshToken = {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expire: process.env.REFRESH_TOKEN_EXPIRE
        } as JwtParams
    }

    public static GetInstance() {
        if (!JwtService.instance) {
            JwtService.instance = new JwtService()
        }

        return JwtService.instance
    }

    public verifyToken(token: string, type: Token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this[type].secret, (err, decoded) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(decoded)
                }
            })
        })
    }

    public createTokens(payload: JwtPayload) {
        const accessToken = this.createToken(payload, 'accessToken')
        const refreshToken = this.createToken(payload, 'refreshToken')

        return { accessToken, refreshToken }
    }

    public createToken(payload: JwtPayload, type: Token) {
        const token = jwt.sign(payload, this[type].secret, { expiresIn: this[type].expire})

        return token
    }
}