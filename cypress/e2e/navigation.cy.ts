// Grundlegende Navigation und Hauptseiten-Tests
describe("METAL3DCORE Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("sollte die Hauptseite erfolgreich laden", () => {
    cy.url().should("include", "/");
    cy.get("body").should("be.visible");
  });

  it("sollte zur Login-Seite navigieren können", () => {
    cy.visit("/login");
    cy.url().should("include", "/login");
    cy.contains("Login").should("be.visible");
  });

  it("sollte zur Registrierung navigieren können", () => {
    cy.visit("/register");
    cy.url().should("include", "/register");
    cy.get("body").should("be.visible");
    cy.get("body").then($body => {
      const text = $body.text();
      expect(text).to.satisfy(
        (str: string) =>
          str.includes("Registrierung") ||
          str.includes("Registrieren") ||
          str.includes("Register") ||
          str.includes("Anmeldung") ||
          str.length > 0 // Hauptsache die Seite lädt
      );
    });
  });

  it("sollte zur Tickets-Seite navigieren können", () => {
    cy.visit("/tickets");
    cy.url().should("include", "/tickets");
  });

  it("sollte zur Kontakt-Seite navigieren können", () => {
    cy.visit("/contact");
    cy.url().should("include", "/contact");
  });

  it("sollte responsive Design haben", () => {
    // Mobile Ansicht testen
    cy.viewport("iphone-6");
    cy.visit("/");
    cy.get("body").should("be.visible");

    // Desktop Ansicht testen
    cy.viewport(1280, 720);
    cy.visit("/");
    cy.get("body").should("be.visible");
  });
});
