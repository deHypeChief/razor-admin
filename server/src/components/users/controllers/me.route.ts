import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import { SessionClient } from "../../auth/_model";
import SuccessHandler from "../../../services/successHandler.service";

const me = new Elysia()
    .use(isSessionAuth)
    .get("/me", async ({ sessionClient, set }) => {
        try {
            if (!sessionClient) {
                return ErrorHandler.ServerError(
                    set,
                    "Session client is undefined",
                    new Error("Session client is undefined")
                );
            }
            const userSessionClient = await SessionClient.findById(sessionClient.sessionClientId).select("email role")
            return SuccessHandler(
                set,
                "User found",
                {
                    session: userSessionClient,
                    user: sessionClient
                }
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error while geting user data",
                error
            )
        }
    })

export default me