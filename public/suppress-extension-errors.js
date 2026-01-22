// 🎸 Extension Error Suppression Script for Metal3DCore Platform
// This script prevents browser extension console errors from cluttering the development environment

(function () {
  "use strict";

  // Suppress common extension-related errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // List of extension-related error patterns to suppress
  const suppressPatterns = [
    /extension\s*context\s*invalidated/i,
    /chrome-extension:/i,
    /moz-extension:/i,
    /webkit-extension:/i,
    /extension.*disconnect/i,
    /background.*script/i,
    /content.*script.*error/i,
    /Failed to fetch.*extension/i,
    /Access to.*extension.*denied/i,
    /chrome\.runtime/i,
    /Extension context invalidated/i,
    /The message port closed before a response was received/i,
  ];

  function shouldSuppress(message) {
    if (typeof message !== "string") {
      message = String(message);
    }

    return suppressPatterns.some(pattern => pattern.test(message));
  }

  // Override console.error
  console.error = function (...args) {
    const message = args.join(" ");
    if (!shouldSuppress(message)) {
      originalConsoleError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = function (...args) {
    const message = args.join(" ");
    if (!shouldSuppress(message)) {
      originalConsoleWarn.apply(console, args);
    }
  };

  // Suppress unhandled promise rejections from extensions
  window.addEventListener("unhandledrejection", function (event) {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);

    if (shouldSuppress(message)) {
      event.preventDefault();
      return;
    }
  });

  // Development mode logging (browser-compatible check)
  try {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      console.log("🎸 Extension error suppression active for M3DC Platform");
    }
  } catch (e) {
    // Ignore any window access errors
  }
})();
