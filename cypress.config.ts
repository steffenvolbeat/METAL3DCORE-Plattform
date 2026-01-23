import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    chromeWebSecurity: false,
    experimentalStudio: true,
    env: {
      API_URL: "http://localhost:3000/api",
      TEST_USER_EMAIL: "cypress-test@metal3dcore.ch",
      TEST_USER_PASSWORD: "CypressTest123!",
      TEST_ADMIN_EMAIL: "cypress-admin@metal3dcore.ch",
      TEST_ADMIN_PASSWORD: "AdminTest123!",
    },
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
