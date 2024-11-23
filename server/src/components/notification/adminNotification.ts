import Elysia from "elysia";
import { NotifyAdmin } from '../../models/notification.model';
import returnSuccess from "../../middlewares/success.middleware";
import { NotFoundError } from "../../middlewares/error.middleware";
import { isAdmin_Authenticated } from "../../middlewares/adminAuth.middleware";

const adminNotification = new Elysia({
    prefix: "/admin"
})
    .use(isAdmin_Authenticated)
    .post("/notifications", async ({ admin }) => {
        try {
            const notifications = await NotifyAdmin.find({ adminID: admin._id });

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

            const notification = await NotifyAdmin.findById(id);
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

            const notification = await NotifyAdmin.findById(id);
            if (!notification) {
                throw new NotFoundError("No notification found with given id")

            }

            const updatedNotification = await NotifyAdmin.findByIdAndUpdate(
                id,
                { status: "read" },
                { new: true }
            );

            returnSuccess("Notification Found", { updatedNotification })
        } catch (err) {
            throw new Error("Error setting notification as read")
        }
    })

export default adminNotification