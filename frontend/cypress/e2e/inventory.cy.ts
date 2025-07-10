describe('Inventory API', () => {
  it('add and delete item', () => {
    cy.request('POST', '/ingredients/', { name: 'Cypress Rum' }).then((res) => {
      const ing = res.body
      cy.request('POST', '/inventory/', { ingredient_id: ing.id, quantity: 1 }).then((res2) => {
        const item = res2.body
        cy.request('DELETE', `/inventory/${item.id}`).its('status').should('eq', 204)
      })
    })
  })
})
