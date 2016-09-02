var expect = chai.expect;

describe('logical card', function() {
  var card, cardlike;
  var card_view_created;
  var wall;
  beforeEach(function(){
    wall = {
      create_text_card_view: fake_create_card_view('text'),
      create_image_card_view: fake_create_card_view('image')
    };
  })

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
        a_card({ text: 'a'})
      }).to.throw(/id/)
    })
    it('must have a non-null id', function() {
      expect(function() {
        a_card({ id: null, text: 'b' })
      }).to.throw(/id/)
    })
    it('must have a text field if specified as text card', function() {
      expect(function() {
        a_card({ id: '123', type: 'text'})
      }).to.throw(/text/)
    })
    it('must have a text field if defaults to text card (no type specified)', function() {
      expect(function() {
        a_card({ id: '123' })
      }).to.throw(/text/)
    })
    it('does not need a text field if specified as image card', function() {
      a_card({ id: '123', type: 'image' })
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
      data = a_card({ id: '123', text: 'some text' }).data()

      expect(data.type).to.be.a('string')
      expect(data.x).to.be.a('number')
      expect(data.y).to.be.a('number')
      expect(data.width).to.be.a('number')
      expect(data.height).to.be.a('number')
    })
    it('returns an object including any specified un-defaulted properties', function() {
      card = a_valid_card({ 'colour': 'red' })

      expect(card.data().colour).to.eq('red')
    })
    it('converts a numeric id into a string', function() {
      card = a_card({ id: -1, text: 'a' })

      expect(card.data().id).to.eq('-1')
    })
  })

  describe('edit_done', function() {
    it("updates card's text property", function() {
      card.edit_done('the updated text')

      expect(card.text).to.eq('the updated text')
    })

    it('fires the changed event', function() {
      var fired = false

      card.on_changed(function() { fired = true })

      card.edit_done('xx')

      expect(fired).to.be.true
    })
  })

  describe('move_happening', function() {
    it("updates card's x, y properties", function() {
      card.move_happening(1, 2)

      expect(card.x).to.eq(1)
      expect(card.y).to.eq(2)
    })

    it('fires the moving event', function() {
      var fired = false

      card.on_moving(function() { fired = true })

      card.move_happening(3, 4)

      expect(fired).to.be.true
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
    it('does not match when text does not exist', function() {
      expect(an_image_card().matches('some text')).to.be.false
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

  function a_card(cardlike, extra_props) {
    return new whalley.LogicalCard(merge(cardlike, extra_props), wall)
  }
  function an_image_card(cardlike) {
    return a_card({ id: 'some valid id', type: 'image', image_src: 'data:...'})
  }
  function a_valid_card(extra_props) {
    return a_card({ id: 'some valid id', text: 'some text'}, extra_props)
  }
  function merge(base, to_merge) {
    if (to_merge) {
      for (var prop in to_merge) {
        base[prop] = to_merge[prop]
      }
    }
    return base;
  }
  function fake_create_card_view(type) {
    return function() {
      card_view_created = type + ' card view'
      return {
        display_as: function() {},
        display_as_not: function() {},
        move_to: function() {},
        update_position: function() {}
      }
    }
  }
})
