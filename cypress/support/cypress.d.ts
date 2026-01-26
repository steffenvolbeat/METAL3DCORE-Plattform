/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login with email and password
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<Element>;

    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<Element>;

    /**
     * Custom command to make API requests
     * @example cy.apiRequest('GET', '/api/health')
     */
    apiRequest(method: string, url: string, body?: any): Chainable<Response<any>>;
