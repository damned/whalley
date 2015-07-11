require('should');
var chai = require('chai');
var expect = chai.expect;

var checker = require('../../lib/server/wall-data-checker');

describe('wall_data_checker', function() {
  describe('missing card data handling', function() {
    var card, cards;
    beforeEach(function() {
      card = {
        id: '123',
        top: 123,
        left: 0,
        text: 'some text'
      };
      cards = {cards: [card]};
    });

    it('throws if no text field', function() {
      delete card.text

      expect(function() {
        checker.check_wall(cards);
      }).to.throw(/[Mm]issing.*text.*field/);
    });
  })
});
