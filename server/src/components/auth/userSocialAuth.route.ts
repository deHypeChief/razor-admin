import Elysia from "elysia";
import { oauth2 } from "elysia-oauth2";
import returnSuccess from '../../middlewares/success.middleware';
import { signUserCookie } from "../../services/authCookie";
import { jwtUserAccess, jwtUserRefresh } from "../../middlewares/jwt.middleware";
import { isUser_Authenticated } from "../../middlewares/userAuth.middleware";
import User from "../../models/user.model";
import { sendMail } from "../../services/sendEmail";
import { ValidationError } from "../../middlewares/error.middleware";

const socialAuth = new Elysia({
    prefix: "/user/auth"
})
    .use(sendMail)
    .use(
        oauth2({
            Google: [
                Bun.env.GOOGLE_CLIENT_ID as string,       // Replace with your actual client ID
                Bun.env.GOOGLE_CLIENT_SECRET as string,   // Replace with your actual client secret
                `http://localhost:${Bun.env.PORT || 3002}/user/auth/signWithGoogle/callback`,
            ],
        })
    )
    .get("/signWithGoogle", async ({ oauth2, redirect }) => {
        const url = await oauth2.createURL("Google");

        // Log the generated state before redirect
        console.log("Generated state: ", url.searchParams.get("state"));

        // Add the "email" and "profile" scopes explicitly
        url.searchParams.set("scope", "openid profile email");
        url.searchParams.set("access_type", "offline");

        return redirect(url.href);
    })
    .use(jwtUserAccess)
    .use(jwtUserRefresh)
    .get("/signWithGoogle/callback", async ({
        oauth2,
        query,
        cookie: { state, userAccess, userRefresh },
        request,
        headers,
        userAccessJwt,
        userRefreshJwt,
        mailConfig,
        generateEmail
    }) => {
        const stateFromQuery = query.state;
        const stateFromCookie = state.value;

        // Log both states to debug the mismatch
        console.log("State from query: ", stateFromQuery);
        console.log("State from cookie: ", stateFromCookie);

        if (stateFromCookie !== stateFromQuery) {
            throw new Error("state mismatch");
        }

        try {
            const token = await oauth2.authorize("Google");

            // Get user info from Google using the token
            const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                },
            });

            if (!userInfoResponse.ok) {
                const errorData = await userInfoResponse.json();
                console.error("Error fetching user info:", errorData);
                throw new Error("Failed to fetch user info");
            }

            const userInfo = await userInfoResponse.json();
            console.log("User info from Google:", userInfo);

            // Check if the user already exists in your database
            let user = await User.findOne({ email: userInfo.email });


            if(user.password != ""){
                throw new ValidationError("Use the other method to sign in")
            }

            if (!user) {
                // Create a new user
                user = new User({
                    username: userInfo.email.split('@')[0], // Using email prefix as username
                    email: userInfo.email,
                    fullName: userInfo.name,
                    socialAuth: true,
                    socialType: "google",
                    socialToken: token.accessToken,
                    profileImage: userInfo.picture
                });
                await user.save();
            }

            await signUserCookie(
                user,
                request,
                headers,
                userAccess,
                userRefresh,
                userAccessJwt,
                userRefreshJwt
            )

            mailConfig(
                user.email,
                "Account Logged-In",
                generateEmail()
            )

            const { password: _, ...userData } = user.toObject();

            returnSuccess("Google account logged in", { userData })

        } catch (error: any) {
            console.error("Error during Google callback:", error.message);
            throw new Error("Authentication failed.")
        }
    })
    .use(isUser_Authenticated)
    .get("/google/logout", async ({ user, set }) => {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${user.socialToken}`, {
            method: "POST",
        }).then(() => {
            set.status = 200;
            returnSuccess("Google account logout", {})
        }).catch((err) => {
            console.log(err);
            throw new Error("Authentication failed.")
        })
    });

export default socialAuth;
