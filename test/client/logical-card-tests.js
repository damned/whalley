var expect = chai.expect;

describe('logical card', function() {
  var card, cardlike;

  describe('data_summary()', function() {
    it('summarises data from initial cardlike', function() {
      card = a_valid_card({ top: 123 });

      expect(card.data_summary()).to.contain('top: 123');
    })
    it('wraps string properties in double-quotes', function() {
      card = a_valid_card({ title: 'the title' });

      expect(card.data_summary()).to.contain('title: "the title"');
    })
    it('escapes double-quotes in strings', function() {
      card = a_valid_card({ text: 'some text with a "quote" in it' });

      console.log(card.data_summary())
      expect(card.data_summary()).to.contain('"some text with a \\"quote\\" in it"');
    })
  })

  describe('defaulted properties', function() {
    describe('when not specified', function() {
      beforeEach(function(){ card = a_valid_card({}) })
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
        card = a_valid_card({ width: 1, height: 2})

        expect(card.width).to.eq(1)
        expect(card.height).to.eq(2)
      })
    })
  })

  describe('required properties', function() {
    it('must have an id', function() {
      expect(function() {
        a_card({ })
      }).to.throw(/id/)
    })
    it('must have a non-null id', function() {
      expect(function() {
        a_card({ id: null })
      }).to.throw(/id/)
    })
  })

  describe('disallowed property names', function() {
    it('cannot have a data field as it conflicts with the data() serialisation method', function() {
      expect(function() {
        a_card({ id: '123', data: 'some data' })
      }).to.throw(/data/)
    })
  })

  describe('data()', function() {
    it('returns object including all defaulted properties', function() {
      data = a_card({ id: '123' }).data()

      expect(data.type).to.be.a('string')
      expect(data.left).to.be.a('number')
      expect(data.top).to.be.a('number')
      expect(data.width).to.be.a('number')
      expect(data.height).to.be.a('number')
    })
    it('returns an object including any specified un-defaulted properties', function() {
      card = a_valid_card({ 'colour': 'red' })

      expect(card.data().colour).to.eq('red')
    })
    it('converts a numeric id into a string', function() {
      card = a_card({ id: -1 })

      expect(card.data().id).to.eq('-1')
    })
  })

  describe('last_modification_status', function() {
    context('when card is moved', function(){
      it('is set to the value of status', function() {
        card = a_valid_card({
          last_modification_status: 'old_status',
          status: 'current_status'
        })

        card.move_to(0, 0)

        expect(card.last_modification_status).to.eq('current_status')
      })
      it('is removed when there is no current status', function() {
        card = a_valid_card({
          last_modification_status: 'old_status',
        })

        card.move_to(0, 0)

        expect(card.last_modification_status).to.be.undefined
      })
      it('is removed when status is null', function() {
        card = a_valid_card({
          last_modification_status: 'old_status',
          status: null // TODO force null status -> undefined and simplify this behaviour instead
        })

        card.move_to(0, 0)

        expect(card.last_modification_status).to.be.undefined
      })
      it('is removed when status is empty', function() {
        card = a_valid_card({
          last_modification_status: 'old_status',
          status: '' // TODO force empty status -> undefined and simplify this behaviour instead
        })

        card.move_to(0, 0)

        expect(card.last_modification_status).to.be.undefined
      })
    })
  })

  describe('matches()', function() {
    it('matches when its text contains the term', function() {
      expect(a_valid_card({ text: 'wolverhampton'}).matches('ham')).to.be.true
    })
    it('matches when its text does not contain the term', function() {
      expect(a_valid_card({ text: 'bob'}).matches('notbob')).to.be.false
    })
  })

  describe('has_id()', function() {
    it("has id if it matches the card's", function() {
      expect(a_valid_card({ id: 'the_id'}).has_id('the_id')).to.be.true
    })
    it("has id if its string representation matches the card's", function() {
      expect(a_valid_card({ id: '1234'}).has_id(1234)).to.be.true
    })
    it("does not have id if it does not match the card's", function() {
      expect(a_valid_card({ id: 'the_id'}).has_id('not the id')).to.be.false
    })
  })

  describe('arbitrary properties', function() {
    it('reflects an arbitrary initial property', function() {
      card = a_valid_card({ some_property: 'abc'})

      expect(card.some_property).to.eq('abc')
    })
  })


  function a_card(cardlike) {
    return new whalley.LogicalCard(cardlike)
  }
  function a_valid_card(extra_props) {
    var cardlike = { id: 'some valid id'}
    for (var prop in extra_props) {
      cardlike[prop] = extra_props[prop]
    }
    return new whalley.LogicalCard(cardlike)
  }
})