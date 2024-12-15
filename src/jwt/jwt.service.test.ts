import { JwtService } from "./jwt.service";
import dotenv from "dotenv";

dotenv.config();

describe("AuthService Tests", () => {
    let jwtService: JwtService;

    beforeAll(async () => {
        jwtService = JwtService.resolve();
    });

    it("test correct access token", async () => {
        const token = jwtService.createToken(
            { email: "test@gmail.com" },
            "accessToken"
        );

        const isValid = await jwtService.verifyToken(token, "accessToken");

        expect(isValid).toBeTruthy();
    });

    it("test incorrect access token", async () => {
        await expect(async () => {
            await jwtService.verifyToken("incorrect token", "accessToken");
        }).rejects.toThrow();
    });

    it("test correct refresh token", async () => {
        const token = jwtService.createToken(
            { email: "test@gmail.com" },
            "refreshToken"
        );

        const isValid = await jwtService.verifyToken(token, "refreshToken");

        expect(isValid).toBeTruthy();
    });

    it("test incorrect refresh token", async () => {
        await expect(async () => {
            await jwtService.verifyToken("incorrect token", "refreshToken");
        }).rejects.toThrow();
    });
});
