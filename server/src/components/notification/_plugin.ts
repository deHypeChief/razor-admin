import Elysia from "elysia";
import userNotification from "./userNotification.route";
import adminNotification from "./adminNotification";

const notification = new Elysia()
    .use(userNotification)
    .use(adminNotification)

export default notification