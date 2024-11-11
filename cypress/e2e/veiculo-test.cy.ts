describe('Página de Cadastro de Veículos', () => {
    beforeEach(() => {
      // Antes de cada teste, carregar a página
      cy.visit('http://localhost:3000/Veiculos'); // Substitua pelo caminho correto da sua página
    });

    it('Deve carregar a página e exibir o título corretamente', () => {
      // Verificar se o título da página está correto
      cy.contains('Cadastro de Carros').should('be.visible');
    });
  
    it('Deve abrir o modal de cadastro de veículos ao clicar no botão "Cadastrar"', () => {
      // Clicar no botão "Cadastrar"
      cy.get('button.new').click();
  
      // Verificar se o modal foi aberto
      cy.get('.modal-container').should('be.visible');
      cy.contains('Adicionar/Editar Veículo').should('be.visible');
    });

    it('Deve mostrar mensagem de erro se campos obrigatórios estiverem vazios ao salvar', () => {
      // Abrir o modal
      cy.get('button.new').click();
  
      // Deixar campos obrigatórios vazios e tentar salvar
      cy.get('button.save-button').click();
  
      // Verificar se a mensagem de erro é exibida
      cy.contains('Por favor, preencha todos os campos.').should('be.visible');
    });

    it('Deve fechar o modal ao clicar no botão "Cancelar"', () => {
      // Abrir o modal
      cy.get('button.new').click();
  
      // Clicar no botão "Cancelar"
      cy.get('button.cancel-button').click();
  
      // Verificar se o modal foi fechado
      cy.get('.modal-container').should('not.exist');
    });


    
});
