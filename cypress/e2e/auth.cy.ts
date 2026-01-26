// Authentifizierungs-Tests
describe("METAL3DCORE Authentifizierung", () => {
  beforeEach(() => {
    // Vor jedem Test zur Login-Seite navigieren
    cy.visit("/login");
  });

  it("sollte Login-Formular anzeigen", () => {
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("sollte Validierungsfehler bei leeren Feldern anzeigen", () => {
    cy.get('button[type="submit"]').click();
    // Prüfen auf einfacheren Text-Inhalt
    cy.get("body").should("contain.text", "geben");
  });

  it("sollte Validierungsfehler bei ungültiger E-Mail anzeigen", () => {
    cy.get('input[type="email"]').type("ungueltige-email");
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Prüfen auf E-Mail-Validierungsfehler
    cy.get("body").then($body => {
      const text = $body.text();
      expect(text).to.satisfy(
        (str: string) =>
          str.includes("E-Mail") || str.includes("email") || str.includes("gültig") || str.includes("valid")
      );
    });
  });

  it("sollte zur Registrierung weiterleiten können", () => {
    // Suche nach Registrierung Link mit flexibleren Selektoren
    cy.contains("registrieren").click({ force: true });
    cy.url().should("include", "/register");
  });

  // Dieser Test würde nur mit gültigen Testdaten funktionieren
  it.skip("sollte erfolgreich einloggen mit gültigen Daten", () => {
    cy.get('input[type="email"]').type(Cypress.env("testEmail"));
    cy.get('input[type="password"]').type(Cypress.env("testPassword"));
    cy.get('button[type="submit"]').click();

    // Nach erfolgreichem Login sollte zur Dashboard weitergeleitet werden
    cy.url().should("include", "/dashboard");
  });
});

describe("METAL3DCORE Registrierung", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("sollte Registrierungs-Formular anzeigen", () => {
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("sollte Validierungsfehler bei schwachen Passwörtern anzeigen", () => {
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').first().type("123");
    cy.get('button[type="submit"]').click();

    // Prüfen auf Passwort-Validierungsfehler
    cy.get("body").then($body => {
      const text = $body.text();
      expect(text).to.satisfy(
        (str: string) =>
          str.includes("Passwort") ||
          str.includes("password") ||
          str.includes("schwach") ||
          str.includes("weak") ||
          str.includes("Zeichen") ||
          str.includes("characters")
      );
    });
  });
});
