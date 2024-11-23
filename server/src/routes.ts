import Elysia from "elysia";
import auth from "./components/auth/_plugin";
import notification from "./components/notification/_plugin";

const routes = new Elysia()
    .use(auth)
    .use(notification)

export default routes