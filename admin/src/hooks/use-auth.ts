import { login, register, verify } from "@/lib/api/auth";
import { toast } from "./use-toast";

export const useAuth = () => {
    async function adminLogout() {
        localStorage.removeItem('admin-payload');
        toast({
            variant: "default",
            title: "Admin Logout Valid",
        })
    };

    async function adminRegister(payload: { adminName: string; adminEmail: string; pin: string }) {
        const data = await register(payload);
        return data
    };

    async function adminLogin(payload: { adminEmail: string; pin: string }) {
        try {
            const data = await login(payload);
            localStorage.setItem('admin-payload', JSON.stringify(data.data.data));
            toast({
                variant: "default",
                title: "Login Valid",
            })
            return data.data
        } catch (err: Error) {
            console.log(err)
            toast({
                variant: "destructive",
                title: "Login Error",
                description: err.response.data,
            })
        }
    };

    async function isAuthenticated() {
        const storedPayload = localStorage.getItem('admin-payload');

        if (!storedPayload) {
            return false;
        }
        try {
            const data = await verify({ token: await JSON.parse(storedPayload)?.auth.token })
            if (data.isValid) {
                return JSON.parse(storedPayload);
            } else {
                await adminLogout();
                return false;
            }
        } catch (error) {
            console.error("Error verifying token:", error);
            await adminLogout(); 
            return false;
        }
    }

    function admin() {
        const storedPayload = localStorage.getItem('admin-payload');

        if (!storedPayload) {
            adminLogout();
            return null;
        }

        try {
            const isAuth = JSON.parse(storedPayload);
            if (!isAuth?.admin) {
                adminLogout();
                return null;
            }
            return isAuth.admin; // Return admin details if authenticated
        } catch (error) {
            console.error("Error parsing admin payload:", error);
            adminLogout();
            return null;
        }
    }


    return { isAuthenticated, adminLogout, adminLogin, adminRegister, admin };
};

export type AuthContext = ReturnType<typeof useAuth>;