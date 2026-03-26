import { gerarCpfValido } from '../support/utils'; // Certifique-se de que o caminho está correto

describe('Módulo de Usuários - Maker/Checker', () => {
  let emailGerente: string;
  let emailEstoquista: string;
  let emailFinanceiro: string;
  const senhaPadrao = 'Senha123';

  before(() => {
    const timestamp = Date.now();
    emailGerente = `gerente_${timestamp}@estoqueraiz.com`;
    emailEstoquista = `estoquista_${timestamp}@estoqueraiz.com`;
    emailFinanceiro = `financeiro_${timestamp}@estoqueraiz.com`;

    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/api/usuarios',
      failOnStatusCode: false,
      body: { nome: 'Gerente Teste', email: emailGerente, senha: senhaPadrao, cpf: gerarCpfValido() }
    }).then(() => {
      cy.exec(`docker exec postgres-db psql -U admin -d estoque_raiz -c "UPDATE usuarios SET cargo = 'gerente', status = 'aprovado' WHERE email = '${emailGerente}';"`);
    });

    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/api/usuarios',
      failOnStatusCode: false,
      body: { nome: 'Estoquista Teste', email: emailEstoquista, senha: senhaPadrao, cpf: gerarCpfValido() }
    }).then(() => {
      cy.exec(`docker exec postgres-db psql -U admin -d estoque_raiz -c "UPDATE usuarios SET cargo = 'estoquista', status = 'aprovado' WHERE email = '${emailEstoquista}';"`);
    });

    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/api/usuarios',
      failOnStatusCode: false,
      body: { nome: 'Financeiro Teste', email: emailFinanceiro, senha: senhaPadrao, cpf: gerarCpfValido() }
    }).then(() => {
      cy.exec(`docker exec postgres-db psql -U admin -d estoque_raiz -c "UPDATE usuarios SET cargo = 'financeiro', status = 'aprovado' WHERE email = '${emailFinanceiro}';"`);
    });
  });

  // ==============================================================
  // GRUPO 1: Ações permitidas apenas para o GERENTE
  // ==============================================================
  context('Acesso como Gerente', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.login(emailGerente, senhaPadrao);
      cy.visit('/usuarios');
    });

    it('Deve listar os usuários cadastrados', () => {
      cy.get('h1').should('contain', 'Usuários'); 
      
      cy.get('table').should('contain', emailGerente);
    });
  });

  // ==============================================================
  // GRUPO 2: Bloqueios de Segurança (Estoquista / Financeiro)
  // ==============================================================
  context('Validação de Segurança de Rotas (RBAC)', () => {
    
    it('Não deve permitir que um Estoquista acesse a gestão de usuários', () => {
      cy.clearLocalStorage();
      cy.login(emailEstoquista, senhaPadrao);
      
      cy.visit('/usuarios');
      
      cy.url().should('not.include', '/usuarios');
    });

    it('Não deve permitir que o Financeiro acesse a gestão de usuários', () => {
      cy.clearLocalStorage();
      cy.login(emailFinanceiro, senhaPadrao);
      
      cy.visit('/usuarios');
      
      cy.url().should('not.include', '/usuarios');
    });
  });
});