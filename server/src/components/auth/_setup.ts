import { t } from "elysia";

export const createAdminSchema = {
    body: t.Object({
        adminEmail: t.String({
            maxLength: 255,
            error: "An admin email is needed",
            format: "email",
        }),
        pin: t.String({
            minLength: 6,
            error: "",
            pattern: ''
        }),
        adminName: t.String({
            maxLength: 255,
            error: "An admin name is needed",
        }),
        adminRole: t.String({
            maxLength: 255,
            error: "An admin role is needed",
        })
    })
}

export const loginAdminSchema = {
    body: t.Object({
        adminEmail: t.String({
            maxLength: 255,
            error: "An admin email is needed",
            format: "email",
        }),
        pin: t.String({
            error: "A password is needed",

        })
    })
}

export const createUserSchema = {
    body: t.Object({
        username: t.String({
            maxLength: 255,
            error: "A username is required",
            minLength: 3
        }),
        password: t.String({
            minLength: 8,
            error: "Password must contain at least one letter, one number, and be 8+ characters long",
            pattern: '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>?/`~])[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>?/`~]{8,}$'
        }),
        email: t.String({
            maxLength: 255,
            error: "A valid email is required",
            format: "email"
        }),
        fullName: t.String({
            maxLength: 255,
            error: "Full name is required"
        }),
        dob: t.Date({
            error: "A valid date of birth is required"
        }),
        phoneNumber: t.String({
            error: "A valid phone number is required",
        })
    })
}

export const loginUserSchema = {
    body: t.Object({
        email: t.String({
            maxLength: 255,
            error: "An email is needed",
            format: "email",
        }),
        password: t.String({
            error: "A password is needed",
        })
    })
}