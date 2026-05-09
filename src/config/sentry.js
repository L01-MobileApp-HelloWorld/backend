const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const initSentry = (app) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });

    // RequestHandler phải là middleware ĐẦU TIÊN
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    
    console.log('Sentry initialized');
  }
};

const setupSentryErrorHandler = (app) => {
  if (process.env.NODE_ENV === 'production') {
    // ErrorHandler phải là middleware CUỐI CÙNG trước error handlers khác
    app.use(Sentry.Handlers.errorHandler());
  }
};

module.exports = { initSentry, setupSentryErrorHandler };