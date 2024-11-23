import Elysia from "elysia";
import adminAuthRoute from "./admin.route";
import userAuthRoute from "./user.route";
import socialAuth from "./userSocialAuth.route"

const auth = new Elysia()
    .use(adminAuthRoute)
    .use(userAuthRoute)
    .use(socialAuth)

export default auth