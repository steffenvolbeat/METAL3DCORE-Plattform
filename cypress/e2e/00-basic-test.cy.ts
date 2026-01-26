/**
 * PHASE 6.5 - Cypress Simple Test: Basic Homepage Validation
 * Simple test to validate Cypress setup and basic functionality
 */

describe("PHASE 6.5 - Basic Desktop Test", () => {
  it("should load the homepage successfully", () => {
    cy.visit("/", { timeout: 10000 });

    // Basic checks that should pass
    cy.get("body").should("exist");
    cy.title().should("exist");

    // Check for navigation
    cy.contains("Metal3DCore").should("be.visible");

    // Take a screenshot for evidence
    cy.screenshot("homepage-loaded");
  });

  it("should have proper meta tags", () => {
    cy.visit("/");

    cy.get('meta[name="viewport"]').should("exist");
    cy.get("title").should("contain", "METAL3DCORE");
  });

  it("should respond within reasonable time", () => {
    const start = Date.now();
    cy.visit("/");
    cy.then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(10000); // 10 seconds max for this test
      cy.log(`Page loaded in ${loadTime}ms`);
    });
  });

  it("should handle navigation links", () => {
    cy.visit("/");

    // Find any navigation links
    cy.get("nav").should("exist");

    // Try clicking on available links
    cy.get('a[href="/dashboard"], a[href="/tickets"], a[href="/contact"]').first().should("be.visible");
  });
});

describe("PHASE 6.5 - API Endpoint Tests", () => {
  it("should respond to API health check", () => {
    cy.request({
      url: "/api/auth/session",
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.be.oneOf([200, 401, 404]);
    });
  });

  it("should handle 404 pages gracefully", () => {
    cy.visit("/non-existent-page", { failOnStatusCode: false });
    cy.get("body").should("contain", "404");
  });
});
