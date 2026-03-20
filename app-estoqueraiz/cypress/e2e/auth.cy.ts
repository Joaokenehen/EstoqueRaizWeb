/// <reference types="cypress" />
import { gerarCpfValido } from '../support/utils';

describe('Página de Login - Estoque Raiz', () => {
  let emailDinamico: string;
  const senhaFirme = 'Senha123';

  before(() => {
    emailDinamico = `testelogin_${Date.now()}@estoqueraiz.com`;
    const cpfDinamico = gerarCpfValido();

    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/api/usuarios', 
      failOnStatusCode: false, 
      body: {
        nome: 'Usuário Teste Login',
        email: emailDinamico,
        senha: senhaFirme,
        cpf: cpfDinamico
      }
    }).then((resposta) => {
      expect(resposta.status).to.eq(201);
      
      // 2. A MÁGICA: Roda um comando no Docker para aprovar o usuário no banco!
      // Nota: Assumi que a coluna se chama 'status' e o valor é 'aprovado'. 
      // Se no seu banco for diferente (ex: is_aprovado = true), é só ajustar o UPDATE abaixo.
      const comandoSQL = `UPDATE usuarios SET status = 'aprovado' WHERE email = '${emailDinamico}';`;
      
      cy.exec(`docker exec postgres-db psql -U admin -d estoque_raiz -c "${comandoSQL}"`);
    });
  });

  beforeEach(() => {
    cy.visit('/'); 
  });

  it('Deve fazer login com sucesso e salvar o token JWT', () => {
    cy.get('input[type="email"]').type(emailDinamico);
    cy.get('input[type="password"]').type(senhaFirme);

    cy.intercept('POST', '/api/auth/login').as('pedidoLogin');
    cy.get('button[type="submit"]').click();

    // Como o usuário foi aprovado via Banco de Dados, agora tem que dar 200 OK!
    cy.wait('@pedidoLogin').its('response.statusCode').should('eq', 200);

    cy.window().then((window) => {
      const token = window.localStorage.getItem('@EstoqueRaiz:token');
      expect(token).to.not.be.null; 
    });
  });

  it('Deve bloquear o login com usuário pendente/não aprovado', () => {
    // Vamos testar se o bloqueio realmente funciona criando um segundo usuário e NÃO aprovando ele
    const emailNaoAprovado = `bloqueado_${Date.now()}@estoqueraiz.com`;
    
    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/api/usuarios',
      body: {
        nome: 'Usuário Bloqueado',
        email: emailNaoAprovado,
        senha: senhaFirme,
        cpf: gerarCpfValido()
      }
    });

    cy.get('input[type="email"]').clear().type(emailNaoAprovado);
    cy.get('input[type="password"]').clear().type(senhaFirme);
    
    cy.intercept('POST', '/api/auth/login').as('loginBloqueado');
    cy.get('button[type="submit"]').click();

    // Tem que retornar 403 Forbidden
    cy.wait('@loginBloqueado').its('response.statusCode').should('eq', 403);
  });
});