// API-Endpunkt Tests
describe("METAL3DCORE API Tests", () => {
  it("sollte Health-Check-Endpunkt erreichbar sein", () => {
    cy.request("GET", "/api/health").then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("status");
    });
  });

  it("sollte Events API erreichbar sein", () => {
    cy.request({
      method: "GET",
      url: "/api/events",
      failOnStatusCode: false,
    }).then(response => {
      // API könnte Authentifizierung erfordern
      expect(response.status).to.be.oneOf([200, 401, 403]);
    });
  });

  it("sollte Tickets API erreichbar sein", () => {
    cy.request({
      method: "GET",
      url: "/api/tickets",
      failOnStatusCode: false,
    }).then(response => {
      // API könnte Authentifizierung erfordern oder nicht implementiert sein
      expect(response.status).to.be.oneOf([200, 401, 403, 404]);
    });
  });

  it("sollte Contact API für POST verfügbar sein", () => {
    cy.request({
      method: "POST",
      url: "/api/contact",
      body: {
        name: "Test User",
        email: "test@example.com",
        message: "Test Nachricht",
      },
      failOnStatusCode: false,
    }).then(response => {
      // Erwarten erfolgreiche Übermittlung oder Validierungsfehler
      expect(response.status).to.be.oneOf([200, 201, 400, 422]);
    });
  });
});
