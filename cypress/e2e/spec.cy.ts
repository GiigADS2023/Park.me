describe('Página de Análises', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/'); // ajuste o caminho se necessário
  });

  it('deve exibir o título corretamente', () => {
    cy.contains('Análises').should('be.visible');
  });

  it('deve permitir selecionar uma data', () => {
    cy.get('input[type="date"]').should('be.visible').click();
    cy.get('input[type="date"]').type('2023-10-28'); // ou a data desejada
    cy.get('input[type="date"]').should('have.value', '2023-10-28');
  });

  it('deve exibir os carros estacionados como 0', () => {
    cy.contains('Carros estacionados').siblings('h1').should('contain', '0');
  });

  it('deve exibir o total de ganho como R$00,00', () => {
    cy.contains('Total de ganho').siblings('h1').should('contain', 'R$00,00');
  });

  it('deve listar os carros cadastrados recentemente', () => {
    cy.get('table tbody tr').should('have.length', 2);
    cy.get('table tbody tr').eq(0).contains('ABC-1234');
    cy.get('table tbody tr').eq(1).contains('Teste');
  });

  it('deve ter um link para mostrar todos os carros cadastrados', () => {
    cy.get('a').contains('Mostrar Todos').should('be.visible').and('have.attr', 'href', '#');
  });
});
