import Elysia from "elysia";
import authPlugin from "../components/auth/_plugin";
import userPlugin from "../components/users/_plugin";

const routes = new Elysia()
	.get("/", () => "Server is up and running 🦊")
    .use(authPlugin)
    .use(userPlugin)

export default routes 