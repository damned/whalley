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

  describe('defaulted properties', function() {
    describe('when not specified', function() {
      beforeEach(function(){ card = a_card({}) })
      it('defaults width and height', function() {
        expect(card.width).to.eq(100)
        expect(card.height).to.eq(60)
      })
      it('defaults type', function() {
        expect(card.type).to.eq('text')
      })
    })
    describe('when not specified', function() {
      it('allows setting of width and height', function() {
        card = a_card({ width: 1, height: 2})

        expect(card.width).to.eq(1)
        expect(card.height).to.eq(2)
      })
    })
  })

  describe('arbitrary properties', function() {
    it('reflects an arbitrary initial property', function() {
      card = a_card({ some_property: 'abc'})

      expect(card.some_property).to.eq('abc')
    })
  })


  function a_card(cardlike) {
    return new whalley.LogicalCard(cardlike)
  }
})