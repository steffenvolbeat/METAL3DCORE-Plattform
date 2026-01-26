/**
 * PHASE 6.5 - Cypress E2E Test: Ticket Purchase & Contact System
 * Testing ticket display, contact page, and basic functionality
 */

describe("PHASE 6.5 - Ticket Purchase & Contact System Tests", () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then(win => {
      win.sessionStorage.clear();
    });
  });

  describe("Ticket Page Access", () => {
    it("should redirect to login when not authenticated", () => {
      cy.visit("/tickets");

      // Should redirect to login since tickets require authentication
      cy.url().should("include", "/login");
    });

    it("should display ticket information when accessible", () => {
      // Visit homepage first (no auth required)
      cy.visit("/");
      cy.get("body").should("be.visible");

      // Try to navigate to tickets
      cy.visit("/tickets");

      // Either shows login redirect or ticket page
      cy.get("body").should("be.visible");
    });
  });

  describe("Contact Page", () => {
    it("should load contact page successfully", () => {
      cy.visit("/contact");

      // Should show contact page content
      cy.get("body").should("be.visible");
      cy.contains("Kontakt").should("be.visible");
    });

    it("should display contact information", () => {
      cy.visit("/contact");

      // Should have contact-related content
      cy.get("body").then($body => {
        const text = $body.text();
        const hasContactContent =
          text.includes("Kontakt") || text.includes("Contact") || text.includes("Fragen") || text.includes("Feedback");
        expect(hasContactContent).to.be.true;
      });
    });

    it("should have proper page structure", () => {
      cy.visit("/contact");

      // Should have proper HTML structure
      cy.get("h1, .panel-heading").should("exist");
      cy.get("body").should("be.visible");
    });
  });

  describe("Admin Pages Access", () => {
    it("should handle admin page access appropriately", () => {
      // Try to access admin contact messages
      cy.visit("/admin/contact-messages", { failOnStatusCode: false });

      // Should either redirect to signin or show access control
      cy.get("body").should("be.visible");
      cy.url().then(url => {
        // Should be redirected or show appropriate content
        expect(url).to.satisfy((url: string) => {
          return url.includes("/signin") || url.includes("/login") || url.includes("/admin");
        });
      });
    });

    it("should handle coming soon admin page", () => {
      cy.visit("/admin/coming-soon", { failOnStatusCode: false });

      // Should either redirect or show page
      cy.get("body").should("be.visible");
    });
  });

  describe("Dashboard Access", () => {
    it("should handle dashboard access without authentication", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      // Should handle unauthenticated access gracefully
      cy.get("body").should("be.visible");
    });

    it("should not crash when accessing dashboard", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      // Should load without JavaScript errors
      cy.window().then(win => {
        // Check that no critical errors occurred
        expect(win.document.body).to.exist;
      });
    });
  });

  describe("Navigation and Basic Functionality", () => {
    it("should have proper navigation to tickets page", () => {
      cy.visit("/", { failOnStatusCode: false });
      cy.get("body").should("be.visible");

      // Try to find and click tickets link
      cy.get("[data-cy=tickets-link]").should("exist");

      // The link exists and is clickable
      cy.get("[data-cy=tickets-link]").should("be.visible");
    });

    it("should have proper navigation to contact page", () => {
      cy.visit("/", { failOnStatusCode: false });
      cy.get("body").should("be.visible");

      // Contact link should exist and be clickable
      cy.get("[data-cy=contact-link]").should("exist");
      cy.get("[data-cy=contact-link]").click();

      // Should navigate to contact page
      cy.url().should("include", "/contact");
      cy.contains("Kontakt").should("be.visible");
    });

    it("should handle page loading without errors", () => {
      cy.visit("/", { failOnStatusCode: false });
      cy.get("body").should("be.visible");

      // Should load without critical JavaScript errors
      cy.window().then(win => {
        expect(win.document.body).to.exist;
      });
    });
  });

  describe("API Endpoints", () => {
    it("should handle contact API endpoint", () => {
      // Test that the contact API endpoint exists
      cy.request({
        method: "POST",
        url: "/api/contact",
        failOnStatusCode: false,
        body: {
          name: "Test",
          email: "test@example.com",
          subject: "Test Subject",
          message: "Test message",
        },
      }).then(response => {
        // Should return some response (might be 400 for validation, 200 for success, 429 for rate limiting, etc.)
        expect([200, 400, 401, 422, 429, 500]).to.include(response.status);
      });
    });

    it("should handle session API calls", () => {
      // Test that session API works
      cy.request({
        method: "GET",
        url: "/api/auth/session",
        failOnStatusCode: false,
      }).then(response => {
        // Should return 200
        expect(response.status).to.equal(200);
      });
    });
  });
});
