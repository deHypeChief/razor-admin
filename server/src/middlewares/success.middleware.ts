export default function returnSuccess(message: string, payload: {}) {
    return {
        success: true,
        message,
        data: payload
    }
}