import Elysia from "elysia"
import registerUser from "./controllers/registerUser.route"
import signUser from "./controllers/signUser.route";
import me from "./controllers/me.route";

const userPlugin = new Elysia({
    prefix: "/users"
})
    .use(registerUser)
    .use(signUser)
    .use(me)

export default userPlugin;