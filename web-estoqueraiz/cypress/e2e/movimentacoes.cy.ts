import { gerarCpfValido } from '../support/utils';

describe('Modulo de Movimentacoes - E2E Real (Entrada, Saída e Ajuste)', () => {
  const API_BASE_URL = 'http://localhost:8081/api';
  let emailGerente: string;
  let emailEstoquista: string;
  let tokenGerente = '';
  const senhaPadrao = 'Senha123';
  let idProduto = 0;
  let idUnidade = 0; 
  const nomeProduto = `Prod Movimentacoes ${Date.now()}`;

  before(() => {
    const timestamp = Date.now();
    emailGerente = `gerente_mov_${timestamp}@estoqueraiz.com`;
    emailEstoquista = `estoque_mov_${timestamp}@estoqueraiz.com`;

    cy.request({
      method: 'POST',
      url: `${API_BASE_URL}/usuarios`,
      failOnStatusCode: false,
      body: { nome: 'Gerente Movimentos', email: emailGerente, senha: senhaPadrao, cpf: gerarCpfValido() }
    }).then(() => {
      cy.exec(`docker exec postgres-db psql -U admin -d estoque_raiz -c "UPDATE usuarios SET cargo = 'gerente', status = 'aprovado' WHERE email = '${emailGerente}';"`);
    });

    cy.request({
      method: 'POST',
      url: `${API_BASE_URL}/auth/login`,
      body: { email: emailGerente, senha: senhaPadrao },
    }).then((loginRes) => {
      tokenGerente = loginRes.body.token;

      // Criando depêncidas para o banco ter os dados necessários para as movimentações
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/unidades`,
        headers: { Authorization: `Bearer ${tokenGerente}` },
        failOnStatusCode: false,
        body: { nome: `Unidade E2E ${timestamp}`, descricao: 'Matriz Principal', rua: 'Rua X', numero: '100', bairro: 'Centro', cidade: 'SP', estado: 'SP', cep: '01000-000' }
      }).then((resUnidade) => {
        idUnidade = resUnidade.body.unidade?.id || resUnidade.body.id;

        cy.request({
          method: 'POST',
          url: `${API_BASE_URL}/categorias`,
          headers: { Authorization: `Bearer ${tokenGerente}` },
          failOnStatusCode: false,
          body: { nome: `Categoria E2E ${timestamp}`, descricao: 'Gerada automaticamente' }
        }).then((resCategoria) => {
          const idCategoria = resCategoria.body.categoria?.id || resCategoria.body.id;

          cy.request({
            method: 'POST',
            url: `${API_BASE_URL}/usuarios`,
            failOnStatusCode: false,
            body: { nome: 'Estoquista Movimentos', email: emailEstoquista, senha: senhaPadrao, cpf: gerarCpfValido() }
          }).then((res1) => {
            const idUser = res1.body.usuario?.id || res1.body.id;
            cy.request({
              method: 'PATCH',
              url: `${API_BASE_URL}/usuarios/${idUser}/aprovar`,
              headers: { Authorization: `Bearer ${tokenGerente}` },
              body: { cargo: 'estoquista', unidade_id: idUnidade }, // <-- MUDOU AQUI
              failOnStatusCode: false,
            });
          });

          cy.request({
            method: 'POST',
            url: `${API_BASE_URL}/produtos`,
            headers: { Authorization: `Bearer ${tokenGerente}` },
            failOnStatusCode: false,
            body: {
              nome: nomeProduto,
              descricao: 'Produto E2E',
              codigo_barras: `MOV-${timestamp}`,
              preco_custo: 10,
              preco_venda: 20,
              quantidade_estoque: 50, 
              quantidade_minima: 5,
              categoria_id: idCategoria, // <-- MUDOU AQUI
              unidade_id: idUnidade      // <-- MUDOU AQUI
            }
          }).then((resProd) => {
            idProduto = resProd.body.produto?.id || resProd.body.id;
            
            cy.request({
              method: 'PATCH',
              url: `${API_BASE_URL}/produtos/${idProduto}/aprovar`,
              headers: { Authorization: `Bearer ${tokenGerente}` },
              failOnStatusCode: false,
              body: { preco_custo: 10, preco_venda: 20 }
            });
          });
        });
      });
    });
  });

  const selectPorLabel = (label: string) =>
    cy.contains('label', label).parent().find('select');

  context('[E2E real] Operações base de Estoque', () => {

    it('Gerente registra uma ENTRADA de 20 unidades com sucesso (Aumentando Estoque)', () => {
      cy.clearLocalStorage();
      cy.login(emailGerente, senhaPadrao);
      cy.visit('/movimentacoes');

      cy.intercept('POST', '**/api/movimentacoes').as('postMovimentacao');

      cy.contains('button', 'Registrar Movimento').click();
      cy.contains('label', 'ENTRADA').click();

      selectPorLabel('Unidade de Destino *').select(idUnidade.toString());
      selectPorLabel('Produto (Aprovados) *').select(idProduto.toString());

      cy.get('[data-testid="movimentacoes-input-quantidade"]').clear().type('20');
      cy.get('[data-testid="movimentacoes-input-documento"]').type('NF-E2E-12345');
      cy.get('[data-testid="movimentacoes-input-observacao"]').type('Compra validada pelo Cypress');

      cy.contains('button', 'Confirmar e Gravar Movimento').click();

      cy.wait('@postMovimentacao').its('response.statusCode').should('be.oneOf', [200, 201]);

      cy.get('[data-testid="barra-filtro-input-busca"]')
        .clear()
        .type('NF-E2E-12345');

      cy.wait(500); 

      cy.contains('NF-E2E-12345').should('be.visible');
    });

    it('Estoquista tem a SAÍDA bloqueada pelo backend caso tire mais unidades do que possui', () => {
      cy.clearLocalStorage();
      cy.login(emailEstoquista, senhaPadrao);
      cy.visit('/movimentacoes');

      cy.window().then((win) => { cy.stub(win, 'alert').as('windowAlert'); });
      cy.intercept('POST', '**/api/movimentacoes').as('postMovimentacaoError');

      cy.contains('button', 'Registrar Movimento').click();
      cy.contains('label', 'SAIDA').click();

      selectPorLabel('Unidade de Origem *').select(idUnidade.toString());
      selectPorLabel('Produto (Aprovados) *').select(idProduto.toString());

      cy.get('[data-testid="movimentacoes-input-quantidade"]').clear().type('999'); 
      cy.contains('button', 'Confirmar e Gravar Movimento').click();

      cy.wait('@postMovimentacaoError').its('response.statusCode').should('eq', 400);
      cy.get('@windowAlert').should('have.been.calledWithMatch', /Estoque insuficiente/i);
    });
  });
});