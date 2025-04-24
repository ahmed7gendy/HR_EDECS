import { logActivity, activityTypes, activityActions } from './activityLogger';

const errorTypes = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATABASE: 'database',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

const errorMessages = {
  [errorTypes.VALIDATION]: 'Invalid data provided',
  [errorTypes.AUTHENTICATION]: 'Authentication failed',
  [errorTypes.AUTHORIZATION]: 'Not authorized to perform this action',
  [errorTypes.DATABASE]: 'Database operation failed',
  [errorTypes.NETWORK]: 'Network error occurred',
  [errorTypes.UNKNOWN]: 'An unexpected error occurred'
};

export class AppError extends Error {
  constructor(type, message, details = {}) {
    super(message || errorMessages[type]);
    this.type = type;
    this.details = details;
    this.timestamp = new Date();
  }
}

export async function handleError(error, context = {}) {
  const errorType = error.type || errorTypes.UNKNOWN;
  const errorMessage = error.message || errorMessages[errorType];
  const errorDetails = error.details || {};

  // Log the error
  console.error('Error:', {
    type: errorType,
    message: errorMessage,
    details: errorDetails,
    context,
    timestamp: new Date()
  });

  // Log activity if user context is available
  if (context.userId) {
    await logActivity({
      userId: context.userId,
      type: activityTypes.ERROR,
      action: activityActions.CREATE,
      title: `Error: ${errorType}`,
      description: errorMessage,
      metadata: {
        errorType,
        errorDetails,
        context
      }
    });
  }

  // Return formatted error
  return {
    type: errorType,
    message: errorMessage,
    details: errorDetails
  };
}

export function isValidationError(error) {
  return error instanceof AppError && error.type === errorTypes.VALIDATION;
}

export function isAuthenticationError(error) {
  return error instanceof AppError && error.type === errorTypes.AUTHENTICATION;
}

export function isAuthorizationError(error) {
  return error instanceof AppError && error.type === errorTypes.AUTHORIZATION;
}

export function isDatabaseError(error) {
  return error instanceof AppError && error.type === errorTypes.DATABASE;
}

export function isNetworkError(error) {
  return error instanceof AppError && error.type === errorTypes.NETWORK;
}

export function createValidationError(message, details = {}) {
  return new AppError(errorTypes.VALIDATION, message, details);
}

export function createAuthenticationError(message, details = {}) {
  return new AppError(errorTypes.AUTHENTICATION, message, details);
}

export function createAuthorizationError(message, details = {}) {
  return new AppError(errorTypes.AUTHORIZATION, message, details);
}

export function createDatabaseError(message, details = {}) {
  return new AppError(errorTypes.DATABASE, message, details);
}

export function createNetworkError(message, details = {}) {
  return new AppError(errorTypes.NETWORK, message, details);
}

export function createUnknownError(message, details = {}) {
  return new AppError(errorTypes.UNKNOWN, message, details);
} 