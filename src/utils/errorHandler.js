// src/utils/errorHandler.js
export function handleApiError(error, endpoint) {
  console.error(`API Error (${endpoint}):`, error);

  const messages = {
    fixtures: 'Unable to load fixtures. Please refresh the page.',
    scores: 'Live scores temporarily unavailable. Check back soon.',
    firebase: 'Connection issue. Please check your internet.',
    default: 'Something went wrong. Please try again.',
  };

  return messages[endpoint] || messages.default;
}

export function logError(error, context) {
  console.error(`[${context}]`, error);
  // You can add Sentry or other error tracking here
}