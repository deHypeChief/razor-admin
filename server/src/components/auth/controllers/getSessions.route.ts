import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../_model";
import SuccessHandler from "../../../services/successHandler.service";

const getSessions = new Elysia()
    .get("/sessions", async ({ set }) => {
        try {
            const sessions = await SessionClient.find();

            return SuccessHandler(
                set,
                "Sessions clients fetched successfully",
                sessions
            );
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error fetching sessions clients",
                error
            );
        }
    })

export default getSessions