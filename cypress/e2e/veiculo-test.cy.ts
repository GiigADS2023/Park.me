describe('Página de Cadastro de Veículos', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/Veiculos'); // ajuste o caminho conforme necessário
    });

    afterEach(() => {
        // Exclui o veículo se ele existir
        cy.intercept('GET', '/api/veiculos').as('getVeiculos');
        cy.wait('@getVeiculos').then((interception) => {
            if (interception && interception.response && interception.response.body) {
                const veiculos = interception.response.body;
                if (veiculos.length > 0) {
                    cy.get('.delete-button').first().click();
                    cy.on('window:confirm', () => true); // Simula clicar em "OK" no confirm
                    cy.wait('@getVeiculos'); // Espera a lista de veículos ser atualizada após a exclusão
                }
            }
        });
    });

    it('deve exibir a tabela de veículos', () => {
        cy.contains('Cadastro de Carros').should('be.visible');
        cy.get('table').should('be.visible');
    });

    it('deve abrir o modal ao clicar em "Cadastrar"', () => {
        cy.get('.new').click();
        cy.get('.modal-container').should('be.visible');
        cy.get('h3').should('contain', 'Adicionar/Editar Veículo');
    });

    it('deve cadastrar um novo veículo', () => {
        cy.get('.new').click();
        cy.get('input[name="placa"]').type('XYZ-1234');
        cy.get('input[name="modelo"]').type('Fusca');
        cy.get('input[name="cor"]').type('Azul');
        cy.get('input[name="proprietario"]').type('Maria Silva');
        cy.get('.save-button').click();

        // Fecha o modal, se ele ainda estiver aberto
        cy.get('.modal-container').should('not.exist');

        // Agora, tente editar o veículo
        cy.get('.edit-button').first().click();
        cy.get('input[name="modelo"]').clear().type('Fusca 1970');
        cy.get('.save-button').click();

        cy.contains('Fusca 1970').should('be.visible');
    });

    it('deve editar um veículo existente', () => {
        // Primeiro, adicione um veículo
        cy.get('.new').click();
        cy.get('input[name="placa"]').type('XYZ-1234');
        cy.get('input[name="modelo"]').type('Fusca');
        cy.get('input[name="cor"]').type('Azul');
        cy.get('input[name="proprietario"]').type('Maria Silva');
        cy.get('.save-button').click();

        // Agora, edite o veículo
        cy.get('.edit-button').first().click();
        cy.get('input[name="modelo"]').clear().type('Fusca 1970');
        cy.get('.save-button').click();

        cy.contains('Fusca 1970').should('be.visible');
    });

    it('deve excluir um veículo', () => {
        // Adicione um veículo com uma placa única
        cy.get('.new').click();
        cy.get('input[name="placa"]').type('XYZ-1234');
        cy.get('input[name="modelo"]').type('Fusca');
        cy.get('input[name="cor"]').type('Azul');
        cy.get('input[name="proprietario"]').type('Maria Silva');
        cy.get('.save-button').click();

        // Espera que a lista de veículos seja atualizada após a adição
        cy.intercept('GET', '/api/veiculos').as('getVeiculos');
        cy.wait('@getVeiculos');

        // Verifica se o veículo foi adicionado à lista
        cy.contains('XYZ-1234').should('be.visible');

        // Agora, exclua o veículo
        cy.get('.delete-button').first().click();
        cy.on('window:confirm', () => true); // Simula clicar em "OK" no confirm 

        // Espera que a lista de veículos seja atualizada após a exclusão
        cy.wait('@getVeiculos');

        // Verifica se o veículo foi removido
        cy.contains('XYZ-1234').should('not.exist');
    });

    it('deve fechar o modal ao clicar em "Cancelar"', () => {
        cy.get('.new').click();
        cy.get('.cancel-button').click();
        cy.get('.modal-container').should('not.exist');
    });
});
