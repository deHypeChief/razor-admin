import { t } from 'elysia'

export const UserValidator = {
    create: {
        body: t.Object({
            username: t.String({ minLength: 3, maxLength: 50 }),
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 8 }),
            fullName: t.String(),
            phoneNumber: t.String(),
            dateOfBirth: t.String({ format: 'date' }),
        })
    },
    login: {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        })
    }
}