import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Production URL - update with correct Vercel URL from screenshot
    baseUrl: "https://metal3dcore-platform-nostalgic-stallner-8.vercel.app",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // Production Test-spezifische Umgebungsvariablen
      testEmail: "test@metal3dcore.com",
      testPassword: "TestPassword123!",
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
