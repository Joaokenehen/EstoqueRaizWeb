import { gerarCpfValido } from '../support/utils';

describe('Página de Login - Estoque Raiz', () => {

  // ========================================================
  // CONTEXTO 1: Testes Reais batendo no Banco de Dados
  // ========================================================
  context('Integração Real (Front + Back + DB)', () => {
    let emailDinamico: string;
    const senhaFirme = 'Senha123';

    before(() => {
      emailDinamico = `testelogin_${Date.now()}@estoqueraiz.com`;
      
      cy.request({
        method: 'POST',
        url: 'http://localhost:8081/api/usuarios', 
        failOnStatusCode: false, 
        body: {
          nome: 'Usuário Teste Login',
          email: emailDinamico,
          senha: senhaFirme,
          cpf: gerarCpfValido()
        }
      }).then((resposta) => {
        expect(resposta.status).to.eq(201);
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

      cy.wait('@pedidoLogin').its('response.statusCode').should('eq', 200);

      cy.window().then((window) => {
        const token = window.localStorage.getItem('@EstoqueRaiz:token');
        expect(token).to.not.be.null; 
      });
    });

    it('Deve bloquear o login com usuário pendente/não aprovado', () => {
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

      cy.wait('@loginBloqueado').its('response.statusCode').should('eq', 403);
    });
  });

  // ========================================================
  // CONTEXTO 2: Testes Mockados (Focados na Interface/UX)
  // ========================================================
  context('Comportamento da Interface (Mockado)', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('Deve mostrar erro genérico para credenciais inválidas (Proteção Enumeração)', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { message: 'Email ou senha incorretos' }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('hacker@teste.com');
      cy.get('input[type="password"]').type('senhaErrada123');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@loginRequest');
      cy.contains('Email ou senha incorretos').should('be.visible');
    });

    it('Deve mostrar aviso amigável para conta Pendente', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 403,
        body: { message: 'Conta nao aprovada' } 
      }).as('loginPendente');

      cy.get('input[type="email"]').type('novo@teste.com');
      cy.get('input[type="password"]').type('SenhaCorreta123');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@loginPendente');
      cy.contains('Sua conta está em análise').should('be.visible');
    });
  });

});
