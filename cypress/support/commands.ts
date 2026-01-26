/// <reference types="cypress" />
// ***********************************************
// Custom Commands für METAL3DCORE Tests
// ***********************************************

// Login Command
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Logout Command
Cypress.Commands.add("logout", () => {
  cy.contains("Logout").click();
  // oder falls es ein Icon/Button ist:
  // cy.get('[data-testid="logout-button"]').click();
});

// Warten bis Seite vollständig geladen ist
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("be.visible");
  cy.window().should("have.property", "document");
});

// Custom Command für API-Request mit Authentifizierung
Cypress.Commands.add("apiRequest", (method: string, url: string, body?: any) => {
  return cy.request({
    method,
    url,
    body,
    failOnStatusCode: false,
    headers: {
      "Content-Type": "application/json",
    },
  });
});

// Command um auf spezifische Ladezeit zu warten
Cypress.Commands.add("waitForLoad", (timeout: number = 10000) => {
  cy.get("body", { timeout }).should("be.visible");
});

// Type Definitionen für TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      waitForPageLoad(): Chainable<void>;
      apiRequest(method: string, url: string, body?: any): Chainable<Cypress.Response<any>>;
      waitForLoad(timeout?: number): Chainable<void>;
    }
  }
}
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
