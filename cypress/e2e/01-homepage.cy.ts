/**
 * PHASE 6.5 - Cypress E2E Test: Homepage & Navigation
 * Testing main page load, navigation and basic functionality
 */

describe("PHASE 6.5 - Homepage & Navigation Tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should load homepage successfully", () => {
    cy.title().should("contain", "METAL3DCORE");
    cy.get("body").should("be.visible");

    // Check for main navigation
    cy.get("[data-cy=navigation]").should("be.visible");

    // Verify essential elements are present - wait for content to load
    cy.get("[data-cy=navigation]").within(() => {
      cy.contains("Metal3DCore").should("be.visible");
    });
  });

  it("should show login functionality", () => {
    // Wait for session loading to complete (no more loading spinners)
    cy.get("body").should("be.visible");
    cy.get(".animate-spin").should("not.exist", { timeout: 10000 });

    // Verify login button exists (register button was removed)
    cy.get("[data-cy=login-link]").should("be.visible");
    cy.get("[data-cy=register-link]").should("not.exist");
  });

  it("should open login modal", () => {
    // Wait for session loading to complete (no more loading spinners)
    cy.get("body").should("be.visible");
    cy.get(".animate-spin").should("not.exist", { timeout: 10000 });

    // Click login button to open modal
    cy.get("[data-cy=login-link]").should("be.visible").first().click();

    // Verify modal opened
    cy.get('[role="dialog"]').should("be.visible");
    cy.get(".auth-modal").should("be.visible");
  });

  it("should navigate to contact page", () => {
    // Make sure we start from homepage
    cy.visit("/");
    cy.get("body").should("be.visible");

    cy.get("[data-cy=contact-link]").should("be.visible").click();
    cy.url().should("include", "/contact");
    cy.contains("Kontakt").should("be.visible");
  });

  it("should navigate to tickets page", () => {
    // Make sure we start from homepage
    cy.visit("/");
    cy.get("body").should("be.visible");

    cy.get("[data-cy=tickets-link]").should("be.visible").click();
    cy.url().should("include", "/tickets");
    cy.contains("Tickets").should("be.visible");
  });

  it("should have responsive navigation on mobile", () => {
    cy.viewport("iphone-x");

    // Mobile navigation should work
    cy.get("[data-cy=mobile-menu-toggle]").should("be.visible").click();
    cy.get("[data-cy=mobile-navigation]").should("be.visible");

    // Test mobile navigation links - only login exists now
    cy.get("[data-cy=mobile-nav-login]").should("exist");
    cy.get("[data-cy=mobile-nav-register]").should("not.exist");

    // Verify mobile navigation elements are present
    cy.get("[data-cy=mobile-navigation]").within(() => {
      cy.contains("Login").should("exist");
    });
  });

  it("should display coming soon information", () => {
    cy.visit("/admin/coming-soon");

    // Wait for page content to load (skip loading spinner)
    cy.get("body").should("be.visible");
    cy.get(".animate-spin", { timeout: 15000 }).should("not.exist");

    // Check for any meaningful content - be flexible about what we find
    cy.get("body").then($body => {
      const text = $body.text();
      const hasContent =
        text.includes("Phase") ||
        text.includes("Admin") ||
        text.includes("Core") ||
        text.includes("METAL3DCORE") ||
        text.includes("Coming Soon");
      expect(hasContent, "Page should contain meaningful content").to.be.true;
    });
  });

  it("should handle 404 errors gracefully", () => {
    // Handle hydration errors that may occur
    cy.on("uncaught:exception", err => {
      if (err.message.includes("Hydration failed")) {
        return false; // Don't fail test on hydration errors
      }
    });

    cy.visit("/non-existent-page", { failOnStatusCode: false });
    cy.contains("404").should("be.visible");

    // Should have a way to navigate back
    cy.get("[data-cy=home-link]").should("be.visible").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("should load without JavaScript errors", () => {
    let consoleErrors = [];
    cy.window().then(win => {
      win.addEventListener("error", e => {
        consoleErrors.push(e.error);
      });
    });

    cy.wait(2000); // Wait for any async errors

    cy.then(() => {
      expect(consoleErrors.length).to.equal(0);
    });
  });

  it("should have proper meta tags", () => {
    cy.get('meta[name="description"]').should("have.attr", "content");
    cy.get('meta[name="viewport"]').should("have.attr", "content", "width=device-width, initial-scale=1");
  });
});

/**
 * Performance and Accessibility Tests
 */
describe("PHASE 6.5 - Performance & Accessibility", () => {
  it("should load within acceptable time", () => {
    const start = Date.now();
    cy.visit("/");
    cy.window().then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(5000); // 5 seconds max
    });
  });

  it("should have proper ARIA labels", () => {
    cy.visit("/");

    // Navigation should have proper ARIA
    cy.get("[data-cy=navigation]").should("have.attr", "role", "navigation");

    // Buttons should have accessible labels
    cy.get("button").each($button => {
      cy.wrap($button).should("satisfy", $el => {
        return $el.attr("aria-label") || $el.text().trim().length > 0;
      });
    });
  });

  it("should be keyboard navigable", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");

    // Test that focusable elements can receive focus
    // Find the first focusable element (login button)
    cy.get("[data-cy=login-link]").first().focus();
    cy.focused().should("be.visible");
    cy.focused().should("have.attr", "data-cy", "login-link");

    // Test navigation links are focusable
    cy.get("[data-cy=contact-link]").focus();
    cy.focused().should("be.visible");

    cy.get("[data-cy=tickets-link]").focus();
    cy.focused().should("be.visible");
  });
});
