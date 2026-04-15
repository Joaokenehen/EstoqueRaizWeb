/// <reference types="cypress" />
import { gerarCpfValido } from '../support/utils';

describe('Página de Cadastro - Testes de UI', () => {

  beforeEach(() => {
    cy.visit('/cadastro');
  });

  context('Testes de Validação no Frontend', () => {

    context('Senha', () => {

      it('Deve rejeitar senhas que não coincidem', () => {
        cy.get('[data-testid="nome-input"]').type('Usuário Teste');
        cy.get('[data-testid="email-input"]').type('teste@email.com');
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="senha-input"]').type('SenhaValida123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('SenhaErrada456!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'As senhas não coincidem!');
      });

      it('Deve rejeitar senha com menos de 6 caracteres', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario Senha Curta');
        cy.get('[data-testid="email-input"]').type(`senha_curta_${Date.now()}@test.com`);
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="senha-input"]').type('Ab1');
        cy.get('[data-testid="confirmar-senha-input"]').type('Ab1');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'pelo menos 6 caracteres');
      });

      it('Deve rejeitar senha sem letra maiúscula', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario Sem Maiuscula');
        cy.get('[data-testid="email-input"]').type(`sem_maiuscula_${Date.now()}@test.com`);
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="senha-input"]').type('senha123');
        cy.get('[data-testid="confirmar-senha-input"]').type('senha123');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'letra maiúscula');
      });

      it('Deve rejeitar senha sem número', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario Sem Numero');
        cy.get('[data-testid="email-input"]').type(`sem_numero_${Date.now()}@test.com`);
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="senha-input"]').type('SenhaMaiuscula');
        cy.get('[data-testid="confirmar-senha-input"]').type('SenhaMaiuscula');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'um número');
      });
    });

    context('CPF', () => {

      it('Deve rejeitar CPF com formato inválido', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario CPF Invalido');
        cy.get('[data-testid="email-input"]').type(`cpf_invalido_${Date.now()}@test.com`);
        cy.get('[data-testid="cpf-input"]').type('00000000000');
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'CPF inválido');
      });

      it('Deve rejeitar CPF com menos de 11 dígitos', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario CPF Curto');
        cy.get('[data-testid="email-input"]').type(`cpf_curto_${Date.now()}@test.com`);
        cy.get('[data-testid="cpf-input"]').type('1234567');
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'CPF inválido');
      });
    });

    context('Campos Obrigatórios', () => {

      it('Deve impedir o envio com o campo Nome vazio', () => {
        cy.get('[data-testid="email-input"]').type(`nome_vazio_${Date.now()}@test.com`);
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]').should('not.exist');
        cy.get('[data-testid="nome-input"]').then(($el) => {
          expect(($el[0] as HTMLInputElement).validity.valid).to.be.false;
        });
      });

      it('Deve impedir o envio com o campo E-mail vazio', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario Sem Email');
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]').should('not.exist');
        cy.get('[data-testid="email-input"]').then(($el) => {
          expect(($el[0] as HTMLInputElement).validity.valid).to.be.false;
        });
      });

      it('Deve impedir o envio com o campo CPF vazio', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario Sem CPF');
        cy.get('[data-testid="email-input"]').type(`sem_cpf_${Date.now()}@test.com`);
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]').should('not.exist');
        cy.get('[data-testid="cpf-input"]').then(($el) => {
          expect(($el[0] as HTMLInputElement).validity.valid).to.be.false;
        });
      });

      it('Deve impedir o envio com o campo Senha vazio', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario Sem Senha');
        cy.get('[data-testid="email-input"]').type(`sem_senha_${Date.now()}@test.com`);
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]').should('not.exist');
        cy.get('[data-testid="senha-input"]').then(($el) => {
          expect(($el[0] as HTMLInputElement).validity.valid).to.be.false;
        });
      });

      it('Deve rejeitar e-mail com formato inválido', () => {
        cy.get('[data-testid="nome-input"]').type('Usuario Email Invalido');
        cy.get('[data-testid="email-input"]')
          .invoke('val', 'email-sem-arroba.com')
          .trigger('input');
        cy.get('[data-testid="cpf-input"]').type(gerarCpfValido());
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]').should('not.exist');
        cy.get('[data-testid="email-input"]').then(($el) => {
          expect(($el[0] as HTMLInputElement).validity.valid).to.be.false;
        });
      });
    });
  });

  context('Limitadores de Caracteres (maxLength)', () => {

    it('Deve limitar o campo Nome a 100 caracteres', () => {
      cy.get('[data-testid="nome-input"]').type('A'.repeat(120));

      cy.get('[data-testid="nome-input"]').then(($el) => {
        expect(($el[0] as HTMLInputElement).value).to.have.length(100);
      });
    });

    it('Deve limitar o campo E-mail a 100 caracteres', () => {
      const emailAlem = `${'a'.repeat(90)}@test.com` + 'b'.repeat(20);

      cy.get('[data-testid="email-input"]').type(emailAlem);

      cy.get('[data-testid="email-input"]').then(($el) => {
        expect(($el[0] as HTMLInputElement).value).to.have.length(100);
      });
    });

    it('Deve limitar o campo CPF a 11 dígitos', () => {
      cy.get('[data-testid="cpf-input"]').type('1'.repeat(20));

      cy.get('[data-testid="cpf-input"]').then(($el) => {
        expect(($el[0] as HTMLInputElement).value).to.have.length(11);
      });
    });

    it('Deve limitar o campo Senha a 32 caracteres', () => {
      cy.get('[data-testid="senha-input"]').type('Senha123!'.repeat(10));

      cy.get('[data-testid="senha-input"]').then(($el) => {
        expect(($el[0] as HTMLInputElement).value).to.have.length(32);
      });
    });

    it('Deve limitar o campo Confirmar Senha a 32 caracteres', () => {
      cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!'.repeat(10));

      cy.get('[data-testid="confirmar-senha-input"]').then(($el) => {
        expect(($el[0] as HTMLInputElement).value).to.have.length(32);
      });
    });
  });
});