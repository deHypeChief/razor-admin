import Elysia from "elysia";
import { UserValidator } from "../_setup";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import SuccessHandler from "../../../services/successHandler.service";
import { User } from "../_model";
import AuthHandler from "../../../services/authHandler.service";
import { jwtSessionAccess, jwtSessionRefresh } from "../../../middleware/jwt.middleware";

const signUser = new Elysia()
    .use(jwtSessionAccess)
    .use(jwtSessionRefresh)
    .post("/sign", async ({
        cookie: { sessionAccess, sessionRefresh },
        request,
        sessionAccessJwt,
        sessionRefreshJwt,
        headers,
        set,
        body
    }) => {
        try {
            const { email, password } = body;

            const checkUser = await SessionClient.findOne({ email })
            if (!checkUser) {
                return ErrorHandler.ValidationError(set, "Email not found not found")
            }

            const checkPassword = await checkUser.comparePassword(password)
            if (!checkPassword) {
                return ErrorHandler.ValidationError(set, "Password is incorrect")
            }

            // set cookies
            await AuthHandler.signSession(
                set,
                checkUser,
                request,
                headers,
                sessionAccess,
                sessionRefresh,
                sessionAccessJwt,
                sessionRefreshJwt
            )

            const user = await User.findOne({ sessionClientId: checkUser._id })
            return SuccessHandler(
                set,
                "User Signed In",
                user
            )
        } catch (error) {
            throw ErrorHandler.ServerError(
                set,
                "Error signing user",
                error
            )
        }
    }, UserValidator.login)


export default signUser