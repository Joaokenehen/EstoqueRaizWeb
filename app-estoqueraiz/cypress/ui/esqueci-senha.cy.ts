describe('Pagina de Recuperacao de Senha', () => {
  beforeEach(() => {
    cy.visit('/esqueci-senha');
  });

  // ----------------------------------------------------------------
  context('Solicitação de Código de Recuperação', () => {

    it('solicita o codigo e avanca para a segunda etapa', () => {
    cy.intercept('POST', '**/api/usuarios/solicitar-recuperacao-senha', {
      statusCode: 200,
      body: {},
    }).as('solicitarCodigo');

    cy.get('[data-testid="esqueci-input-email"]').type('usuario@estoqueraiz.com');
    cy.contains('button', 'Receber').click();

    cy.wait('@solicitarCodigo')
      .its('request.body')
      .should('deep.equal', { email: 'usuario@estoqueraiz.com' });

    cy.get('[data-testid="esqueci-input-codigo"]').should('be.visible');
    cy.get('[data-testid="esqueci-input-nova-senha"]').should('be.visible');
    cy.contains('enviado para o seu e-mail').should('be.visible');
  });

  it('mostra erro amigavel ao falhar na solicitacao do codigo', () => {
    cy.intercept('POST', '**/api/usuarios/solicitar-recuperacao-senha', {
      statusCode: 500,
      body: { message: 'Falha interna' },
    }).as('solicitarCodigo');

    cy.get('[data-testid="esqueci-input-email"]').type('usuario@estoqueraiz.com');
    cy.contains('button', 'Receber').click();

    cy.wait('@solicitarCodigo');
    cy.contains('Erro ao solicitar').should('be.visible');
  });
  });

  // ----------------------------------------------------------------
  context('Validação de Campos', () => {

  it('mantem o codigo somente numerico e com no maximo 6 digitos', () => {
    cy.intercept('POST', '**/api/usuarios/solicitar-recuperacao-senha', {
      statusCode: 200,
      body: {},
    }).as('solicitarCodigo');

    cy.get('[data-testid="esqueci-input-email"]').type('usuario@estoqueraiz.com');
    cy.contains('button', 'Receber').click();
    cy.wait('@solicitarCodigo');

    cy.get('[data-testid="esqueci-input-codigo"]').type('12ab345678');
    cy.get('[data-testid="esqueci-input-codigo"]').should('have.value', '123456');
  });
  });

  // ----------------------------------------------------------------
  context('Redefinição de Senha', () => {

  it('redefine a senha com sucesso e redireciona para o login apos 3 segundos', () => {
    cy.clock();

    cy.intercept('POST', '**/api/usuarios/solicitar-recuperacao-senha', {
      statusCode: 200,
      body: {},
    }).as('solicitarCodigo');

    cy.intercept('POST', '**/api/usuarios/redefinir-senha', (req) => {
      expect(req.body).to.deep.equal({
        email: 'usuario@estoqueraiz.com',
        codigoRecuperacao: '123456',
        novaSenha: 'NovaSenha123!',
      });

      req.reply({ statusCode: 200, body: {} });
    }).as('redefinirSenha');

    cy.get('[data-testid="esqueci-input-email"]').type('usuario@estoqueraiz.com');
    cy.contains('button', 'Receber').click();
    cy.wait('@solicitarCodigo');

    cy.get('[data-testid="esqueci-input-codigo"]').type('123456');
    cy.get('[data-testid="esqueci-input-nova-senha"]').type('NovaSenha123!');
    cy.contains('button', 'Alterar Senha').click();

    cy.wait('@redefinirSenha');
    cy.contains('Senha redefinida com sucesso').should('be.visible');

    cy.tick(3000);
    cy.url().should('include', '/login');
  });

  it('mostra a mensagem retornada pelo backend ao falhar na redefinicao', () => {
    cy.intercept('POST', '**/api/usuarios/solicitar-recuperacao-senha', {
      statusCode: 200,
      body: {},
    }).as('solicitarCodigo');

    cy.intercept('POST', '**/api/usuarios/redefinir-senha', {
      statusCode: 400,
      body: { message: 'Codigo invalido ou expirado' },
    }).as('redefinirSenha');

    cy.get('[data-testid="esqueci-input-email"]').type('usuario@estoqueraiz.com');
    cy.contains('button', 'Receber').click();
    cy.wait('@solicitarCodigo');

    cy.get('[data-testid="esqueci-input-codigo"]').type('123456');
    cy.get('[data-testid="esqueci-input-nova-senha"]').type('NovaSenha123!');
    cy.contains('button', 'Alterar Senha').click();

    cy.wait('@redefinirSenha');
    cy.contains('Codigo invalido ou expirado').should('be.visible');
  });
  });
});
