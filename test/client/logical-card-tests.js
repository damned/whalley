var expect = chai.expect;

describe('logical card', function() {
  var card, cardlike;

  describe('data_summary()', function() {
    it('summarises data from initial cardlike', function() {
      card = a_card({ top: 123 });

      expect(card.data_summary()).to.contain('top: 123');
    })
    it('wraps string properties in double-quotes', function() {
      card = a_card({ title: 'the title' });

      expect(card.data_summary()).to.contain('title: "the title"');
    })
    it('escapes double-quotes in strings', function() {
      card = a_card({ text: 'some text with a "quote" in it' });

      console.log(card.data_summary())
      expect(card.data_summary()).to.contain('"some text with a \\"quote\\" in it"');
    })
  })
  function a_card(cardlike) {
    return new whalley.LogicalCard(cardlike)
  }
})