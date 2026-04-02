import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      // URL base da API do backend
      API_BASE_URL: "http://localhost:8081/api",
      // Permitir testes com SQL direto (cuidado: apenas para setup!)
      ALLOW_SQL_IN_TESTS: false,
    },
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});
