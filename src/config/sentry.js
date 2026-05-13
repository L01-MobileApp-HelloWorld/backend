const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const initSentry = (app) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });

    console.log('Sentry initialized');
  }
};

const setupSentryErrorHandler = (app) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setupExpressErrorHandler(app);
  }
};

module.exports = { initSentry, setupSentryErrorHandler };