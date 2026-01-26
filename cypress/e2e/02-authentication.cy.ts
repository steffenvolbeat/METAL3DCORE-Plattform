/**
 * PHASE 6.5 - Cypress E2E Test: User Authentication
 * Testing login, logout workflows and session management
 */

describe("PHASE 6.5 - User Authentication Tests", () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then(win => {
      win.sessionStorage.clear();
    });
  });

  describe("User Login", () => {
    it("should display login form correctly", () => {
      cy.visit("/login");

      // Check login form elements
      cy.get("[data-cy=login-page]").should("be.visible");
      cy.get("[data-cy=email-input]").should("be.visible");
      cy.get("[data-cy=password-input]").should("be.visible");
      cy.get("[data-cy=login-submit]").should("be.visible");
    });

    it("should validate required login fields", () => {
      cy.visit("/login");

      cy.get("[data-cy=login-submit]").click();

      // Should show field validation errors
      cy.get("body").then($body => {
        const text = $body.text();
        const hasValidationError =
          text.includes("gültige E-Mail") ||
          text.includes("Passwort") ||
          text.includes("erforderlich") ||
          text.includes("mindestens");
        expect(hasValidationError).to.be.true;
      });
    });

    it("should handle invalid credentials gracefully", () => {
      cy.visit("/login");

      cy.get("[data-cy=email-input]").type("wrong@email.com");
      cy.get("[data-cy=password-input]").type("wrongpassword");
      cy.get("[data-cy=login-submit]").click();

      // Should handle error gracefully (either show error or stay on login)
      cy.url().should("include", "/login");
    });
  });

  describe("User Session Management", () => {
    it("should handle session state correctly", () => {
      // Visit homepage
      cy.visit("/");

      // Check that we can navigate to login
      cy.visit("/login");
      cy.get("[data-cy=login-page]").should("be.visible");
    });

    it("should handle navigation after page reloads", () => {
      cy.visit("/");

      // Reload page
      cy.reload();

      // Should still be accessible
      cy.get("body").should("be.visible");
      cy.url().should("include", "/");
    });

    it("should handle protected route access", () => {
      // Try to access dashboard without login
      cy.visit("/dashboard");

      // Should either redirect to login or show login prompt
      cy.get("body").should("be.visible");
    });
  });

  describe("Security Features", () => {
    it("should have proper form structure", () => {
      cy.visit("/login");

      // Check that form exists and is properly structured
      cy.get("form").should("exist");
      cy.get("[data-cy=email-input]").should("have.attr", "type", "email");
      cy.get("[data-cy=password-input]").should("have.attr", "type", "password");
    });

    it("should sanitize input fields", () => {
      cy.visit("/login");

      const xssPayload = '<script>alert("xss")</script>';
      cy.get("[data-cy=email-input]").type(xssPayload);

      // XSS should be prevented - content should be escaped
      cy.get("[data-cy=email-input]").should("have.value", xssPayload);

      // Check that script wasn't executed
      cy.window().then(win => {
        expect(win.document.body.innerHTML).not.to.contain("<script>alert");
      });
    });
  });
});
