import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import { User } from "../_model";
import SuccessHandler from "../../../services/successHandler.service";
import { UserValidator } from "../_setup";

const registerUser = new Elysia()
    .post("/register", async ({ set, body }) => {
        try {
            const { email, password, fullName, phoneNumber, dateOfBirth, username } = body;

            const checkEmail = await SessionClient.findOne({ email })
            if (checkEmail) {
                return ErrorHandler.ValidationError(set, "The email provided is already in use.")
            }

            const newClient = await SessionClient.create({
                email,
                password,
                role: "user",
            })
            const newUser = await User.create({
                sessionClientId: newClient._id,
                fullName,
                phoneNumber,
                dateOfBirth,
                username
            })

            return SuccessHandler(
                set,
                "User Created",
                newUser,
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error registering user",
                error
            );
        }
    },  UserValidator.create )

export default registerUser;