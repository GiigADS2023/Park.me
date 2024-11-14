describe('Página de Análises', () => {

  beforeEach(() => {
    // Antes de cada teste, vamos carregar a página
    cy.visit('http://localhost:3000'); // Certifique-se de que a URL está correta para seu ambiente de testes
  });

  it('Deve carregar a página sem erros', () => {
    // Verifica se a página carrega corretamente
    cy.contains('Análises').should('be.visible');
  });

  it('Deve exibir os campos de data corretamente', () => {
    // Verifica se os campos de data estão visíveis
    cy.get('input[type="date"]').should('have.length', 2); // Espera dois campos de data
  });

  it('Deve exibir dados ao preencher as datas corretamente', () => {
    // Esperar um pouco para garantir que os campos de data estejam disponíveis
    cy.wait(1000); // Espera de 1 segundo (ajuste conforme necessário)

    // Preencher datas válidas
    const startDate = '2023-10-01';
    const endDate = '2023-10-31';

    // Preenche os campos de data usando os placeholders
    cy.get('input[placeholder="Data Inicial"]').type(startDate); // Campo de data inicial
    cy.get('input[placeholder="Data Final"]').type(endDate);   // Campo de data final

    // Dispara a requisição ao desfoque (blur) no campo de data final
    cy.get('input[placeholder="Data Final"]').blur();

    // Verifica se os dados de carros estacionados e total de ganhos são exibidos corretamente
    cy.get('.carsParked h1').should('not.be.empty'); // Verifica se o número de carros estacionados aparece
    cy.get('.totalParking h1').should('not.be.empty'); // Verifica se o total de ganhos aparece
  });

  it('Deve mostrar mensagem de erro se a data final for preenchida sem a data inicial', () => {
    // Esperar um pouco para garantir que os campos de data estejam disponíveis
    cy.wait(1000); // Espera de 1 segundo (ajuste conforme necessário)

    // Preencher a data final sem a data inicial
    const endDate = '2023-10-31';

    // Preenche o campo da data final
    cy.get('input[placeholder="Data Final"]').type(endDate);
    cy.get('input[placeholder="Data Final"]').blur(); // Ou qualquer outro evento para disparar a requisição

    // Verifica se o toast de erro aparece
    cy.get('.Toastify__toast').should('contain.text', 'Por favor, insira uma data inicial ou ambas as datas.');
  });
});
