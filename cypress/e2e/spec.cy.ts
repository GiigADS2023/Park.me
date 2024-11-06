describe('Página de Análises', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // URL da sua aplicação
  });

  it('deve carregar corretamente a página e exibir o título', () => {
    cy.contains('h1', 'Análises'); // Verifica se o título "Análises" está visível
  });
});
describe('Interação com o campo de data', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('deve permitir alterar a data e disparar a requisição', () => {
    const newDate = '2024-11-05'; // Data para testar
    cy.get('input[type="date"]').type(newDate); // Altera a data
    cy.get('input[type="date"]').should('have.value', newDate); // Verifica se a data foi atualizada
  });
});
describe('Campo de Data', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('deve exibir o campo de data', () => {
    cy.get('input[type="date"]').should('exist'); // Verifica se o campo de data está presente
  });
});


describe('Tabela de Carros Cadastrados', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('deve exibir a tabela de carros cadastrados', () => {
    cy.get('table').should('be.visible'); // Verifica se a tabela de carros está visível
  });

  it('deve exibir as colunas da tabela corretamente', () => {
    cy.get('thead').find('th').should('have.length', 4); // Verifica se há 4 colunas na tabela
  });

  it('deve exibir o texto "Placa" na primeira coluna', () => {
    cy.get('thead tr th').first().contains('Placa').should('be.visible');
  });

  it('deve exibir o texto "Modelo" na segunda coluna', () => {
    cy.get('thead tr th').eq(1).contains('Modelo').should('be.visible');
  });

  it('deve exibir o texto "Cor" na terceira coluna', () => {
    cy.get('thead tr th').eq(2).contains('Cor').should('be.visible');
  });

  it('deve exibir o texto "Proprietário" na quarta coluna', () => {
    cy.get('thead tr th').last().contains('Proprietário').should('be.visible');
  });
});
