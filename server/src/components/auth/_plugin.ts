import Elysia from "elysia";
import getSessions from "./controllers/getSessions.route";

const authPlugin = new Elysia({
    prefix: "/auth"
})
    .use(getSessions)

export default authPlugin