import { Elysia, t } from 'elysia'

// Custom error classes
class BaseError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code: string = 'INTERNAL_SERVER_ERROR',
		public originalError?: Error
	) {
		super(message)
		this.name = this.constructor.name
	}
}

export class ValidationError extends BaseError {
	constructor(message: string) {
		super(`🚫 Validation Error: ${message}`, 400, 'VALIDATION_ERROR')
	}
}

export class NotFoundError extends BaseError {
	constructor(message: string) {
		super(`🔍 Not Found: ${message}`, 404, 'NOT_FOUND')
	}
}

export class UnauthorizedError extends BaseError {
	constructor(message: string) {
		super(`🔒 Unauthorized: ${message}`, 401, 'UNAUTHORIZED')
	}
}

export class JWTError extends UnauthorizedError {
	constructor(message: string, originalError?: Error) {
		super(message)
		this.code = 'JWT_ERROR'
		this.originalError = originalError
	}
}

export class TokenExpiredError extends JWTError {
	constructor(message: string = 'Token has expired', originalError?: Error) {
		super(message, originalError)
		this.code = 'TOKEN_EXPIRED'
	}
}

export class TokenRefreshError extends JWTError {
	constructor(message: string, originalError?: Error) {
		super(message, originalError)
		this.code = 'TOKEN_REFRESH_ERROR'
	}
}

export class ForbiddenError extends BaseError {
	constructor(message: string) {
		super(`🚫 Forbidden: ${message}`, 403, 'FORBIDDEN')
	}
}

// Error handler plugin
export const errorHandler = new Elysia()
	.error({
		VALIDATION_ERROR: ValidationError,
		NOT_FOUND: NotFoundError,
		UNAUTHORIZED: UnauthorizedError,
		JWT_ERROR: JWTError,
		TOKEN_EXPIRED: TokenExpiredError,
		TOKEN_REFRESH_ERROR: TokenRefreshError,
		FORBIDDEN: ForbiddenError,
		INTERNAL_SERVER_ERROR: BaseError
	})
	.onError(({ error, set }) => {
		console.error('Raw Error Object:', error);

		const statusCode = error instanceof BaseError ? error.statusCode : 500
		const errorCode = error instanceof BaseError ? error.code : 'INTERNAL_SERVER_ERROR'

		set.status = statusCode

		// Enhanced error logging
		console.log(
			`🔥 [${new Date().toISOString()}] Error occurred:`,
			{
				code: errorCode,
				status: statusCode,
				message: error.message,
				...(error instanceof BaseError && error.originalError && {
					originalError: {
						name: error.originalError.name,
						message: error.originalError.message,
					}
				})
			}
		)

		// Handle specific JWT-related errors
		if (error instanceof JWTError && error.code === 'TOKEN_EXPIRED') {
			return {
				success: false,
				error: {
					code: errorCode,
					message: error.message,
					shouldRefresh: true
				}
			}
		}

		return {
			success: false,
			error: {
				code: errorCode,
				message: error.message,
				...(process.env.NODE_ENV === 'development' && {
					stack: error.stack,
					...(error instanceof BaseError && error.originalError && {
						originalError: {
							name: error.originalError.name,
							message: error.originalError.message,
							stack: error.originalError.stack
						}
					})
				})
			}
		}
	})