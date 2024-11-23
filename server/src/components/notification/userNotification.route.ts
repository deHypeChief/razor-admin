import Elysia from "elysia";
import { isUser_Authenticated } from "../../middlewares/userAuth.middleware";
import { NotifyUser } from "../../models/notification.model";
import returnSuccess from "../../middlewares/success.middleware";
import { NotFoundError } from "../../middlewares/error.middleware";

const userNotification = new Elysia({
    prefix: "/user"
})
    .use(isUser_Authenticated)
    .post("/notifications", async ({ user }) => {
        try {
            const notifications = await NotifyUser.find({ userID: user._id });

            returnSuccess("Notification List Found", { notifications })
        } catch (err) {
            throw new Error("Error getting notifications")
        }
    })
    .get("/notifications/:id", async ({ params: { id }})=>{
        try{
            if (!id) {
                throw new NotFoundError("No or invalid notification id")
            }

            const notification = await NotifyUser.findById(id);
            if (!notification) {
                throw new NotFoundError("No notification found with given id")

            }

            returnSuccess("Notification Found", { notification })
        }catch(err){
            throw new Error("Error getting notification")
        }
    })
    .get("/notifications/:id/read", async ({ params: { id }}) => {
        try {
            if (!id) {
                throw new NotFoundError("No or invalid notification id")
            }

            const notification = await NotifyUser.findById(id);
            if (!notification) {
                throw new NotFoundError("No notification found with given id")

            }

            const updatedNotification = await NotifyUser.findByIdAndUpdate(
                id,
                { status: "read" },
                { new: true }
            );

            returnSuccess("Notification Found", { updatedNotification })
        } catch (err) {
            throw new Error("Error setting notification as read")
        }
    })

export default userNotification