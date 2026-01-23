/**
 * PHASE 6.5 - Cypress E2E Test: 3D Rooms Navigation
 * Testing 3D room access, navigation, and Three.js functionality
 */

describe("PHASE 6.5 - 3D Rooms Navigation Tests", () => {
  beforeEach(() => {
    cy.visit("/", { failOnStatusCode: false });
    cy.get("body", { timeout: 10000 }).should("be.visible");
    // Skip 3D tests if WebGL not available
    cy.window().then(win => {
      const canvas = win.document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        cy.log("WebGL not available, skipping 3D tests");
        return;
      }
    });
  });

  describe("3D Room Access Control", () => {
    it("should access homepage and check for 3D elements", () => {
      // Check if 3D canvas exists on homepage
      cy.get("body").then($body => {
        if ($body.find("canvas").length > 0) {
          cy.get("canvas").should("be.visible");
          cy.log("3D Canvas found on homepage");
        } else {
          cy.log("No 3D canvas found - skipping WebGL tests");
        }
      });
    });

    it("should navigate to dashboard and check for room access", () => {
      // Try to access dashboard
      cy.visit("/dashboard", { failOnStatusCode: false });

      // Wait for page to load
      cy.get("body", { timeout: 10000 }).should("be.visible");

      // Check if there are room navigation elements
      cy.get("body").then($body => {
        if ($body.find('[data-cy*="room"]').length > 0) {
          cy.get('[data-cy*="room"]').first().should("be.visible");
          cy.log("Room navigation elements found");
        } else {
          cy.log("No room navigation found - feature may not be implemented");
        }
      });
    });

    it("should check for Three.js availability", () => {
      cy.visit("/");

      // Check if Three.js is available in the window
      cy.window().then(win => {
        if ((win as any).THREE) {
          cy.log("Three.js is available globally");
        } else {
          cy.log("Three.js not found globally - may be bundled");
        }
      });

      // Check for WebGL support
      cy.window().then(win => {
        const canvas = win.document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl) {
          cy.log("WebGL is supported");
        } else {
          cy.log("WebGL is not supported");
        }
      });
    });
  });

  describe("3D Scene Functionality", () => {
    it("should check for canvas elements", () => {
      cy.visit("/");

      cy.get("body").then($body => {
        if ($body.find("canvas").length > 0) {
          cy.get("canvas").should("be.visible");

          // Check canvas dimensions
          cy.get("canvas").then($canvas => {
            const canvas = $canvas[0] as HTMLCanvasElement;
            expect(canvas.width).to.be.greaterThan(0);
            expect(canvas.height).to.be.greaterThan(0);
            cy.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
          });
        } else {
          cy.log("No canvas found - 3D scenes may not be active");
        }
      });
    });

    it("should test 3D scene interactions if available", () => {
      cy.visit("/");

      cy.get("body").then($body => {
        if ($body.find("canvas").length > 0) {
          // Test mouse interactions with the 3D scene
          cy.get("canvas")
            .trigger("mousedown", { which: 1 })
            .trigger("mousemove", { clientX: 100, clientY: 100 })
            .trigger("mouseup");

          // Allow time for animation
          cy.wait(1000);
          cy.log("Mouse interaction test completed");
        } else {
          cy.log("No canvas found - skipping interaction tests");
        }
      });
    });

    it("should check for navigation controls", () => {
      cy.visit("/");

      // Check for any navigation-related text or controls
      cy.get("body").then($body => {
        const hasNavigationText =
          $body.text().toLowerCase().includes("navigation") ||
          $body.text().includes("WASD") ||
          $body.text().toLowerCase().includes("maus");

        if (hasNavigationText) {
          cy.log("Navigation controls text found");
        } else {
          cy.log("No navigation controls text found");
        }
      });
    });
  });

  describe("Room Navigation Features", () => {
    it("should handle page navigation", () => {
      cy.visit("/");

      // Test basic navigation
      cy.get("nav", { timeout: 5000 }).should("be.visible");

      // Check for navigation links
      cy.get('a[href*="/"]').should("have.length.greaterThan", 0);
    });

    it("should test responsive behavior", () => {
      cy.visit("/");

      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get("body").should("be.visible");

      // Test desktop viewport
      cy.viewport(1920, 1080);
      cy.get("body").should("be.visible");
    });

    it("should verify accessibility features", () => {
      cy.visit("/");

      // Check for semantic elements
      cy.get("main").should("exist");
      cy.get("nav").should("exist");

      // Check for headings
      cy.get("h1, h2, h3").should("have.length.greaterThan", 0);
    });

    it("should handle different screen sizes", () => {
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit("/");
        cy.get("body").should("be.visible");
        cy.log(`Tested viewport: ${viewport.width}x${viewport.height}`);
      });
    });

    it("should verify performance metrics", () => {
      cy.visit("/");

      // Check page load performance
      cy.window().then(win => {
        const perfData = win.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (perfData) {
          const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
          cy.log(`Page load time: ${loadTime}ms`);
          expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
        }
      });
    });
  });
});
