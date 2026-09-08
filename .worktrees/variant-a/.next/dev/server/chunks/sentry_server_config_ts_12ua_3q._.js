;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="8c615cc0-aec7-bf2c-636f-563c58828f62")}catch(e){}}();
module.exports = [
"[project]/sentry.server.config.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$cjs$2f$index$2e$server$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@sentry/nextjs/build/cjs/index.server.js [instrumentation] (ecmascript)");
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$cjs$2f$index$2e$server$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["init"]({
    dsn: "https://3128508f9cfb241aea69658d28b67117@o4511843047309312.ingest.us.sentry.io/4511843056943104",
    // Keep full tracing in development; sample in production to cut server overhead.
    tracesSampleRate: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 1,
    // Enable logs to be sent to Sentry
    enableLogs: true,
    dataCollection: {
    }
});
}),
];

//# debugId=8c615cc0-aec7-bf2c-636f-563c58828f62
//# sourceMappingURL=sentry_server_config_ts_12ua_3q._.js.map