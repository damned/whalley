require('should');
var chai = require('chai');
var expect = chai.expect;

var converter = require('../../lib/server/wall-data-converter.js');

describe('wall_data_converter', function() {
  var target_version;
  describe('0.1 <-> 0.2 conversion', function() {
    var version_0_1_format_copy;
    var version_0_1_format;
    var version_0_2_format;

    beforeEach(function() {
      version_0_1_format = {
        structure_version: '0.1',
        cards: [
          {id: 'card-a', left: 12, top: 123, text: 'a'},
          {id: 'card-b', left: 45, top: 456, text: 'b'},
          {id: 'card-c', left: 1, top: 2, text: 'img: bug.png'},
          {id: 'card-d', left: 1, top: 2, text: 'data:image/png;base64,XXX='}
        ]
      };
      version_0_2_format = {
        structure_version: '0.2',
        cards: [
          {id: 'card-a', x: 12, y: 123, type: 'text'},
          {id: 'card-b', x: 45, y: 456, type: 'text'},
          {id: 'card-c', x: 1, y: 2, type: 'image', image_src: '/images/bug.png'},
          {id: 'card-d', x: 1, y: 2, type: 'image', image_src: 'data:image/png;base64,XXX='}
        ]
      };
    })

    it('leaves data when converting 0.2 -> 0.2', function() {
      var converted = converter.convert(version_0_2_format, '0.2');

      expect(converted).to.equal(version_0_2_format);
    });

    describe('0.1 -> 0.2', function() {
      var converted
      beforeEach(function() {
        version_0_1_format_copy = JSON.stringify(version_0_1_format)
        converted = converter.convert(version_0_1_format, '0.2')
      })

      it('marks version as 0.2', function() {
        expect(converted.structure_version).to.eq('0.2');
      })

      it('does not mutate input data', function() {
        expect(JSON.stringify(version_0_1_format)).to.eq(version_0_1_format_copy);
      })

      it('replaces left, top with x, y', function() {
        expect(converted.cards[0].x).to.eq(version_0_1_format.cards[0].left);
        expect(converted.cards[0].left).to.eq(undefined);
        expect(converted.cards[0].y).to.eq(version_0_1_format.cards[0].top);
        expect(converted.cards[0].top).to.eq(undefined);
      })

      it('defaults card type to "text"', function() {
        expect(converted.cards[0].type).to.eq('text')
        expect(converted.cards[1].type).to.eq('text')
      })

      it('uses "image" type and "image_src" converted to full relative path for referenced image cards', function() {
        var image_card = converted.cards[2];
        expect(image_card.type).to.eq('image')
        expect(image_card.text).to.eq(undefined)
        expect(image_card.image_src).to.eq('/images/bug.png')
      })

      it('uses "image" type and "image_src" for inline-data image cards', function() {
        var image_card = converted.cards[3];
        expect(image_card.type).to.eq('image')
        expect(image_card.text).to.eq(undefined)
        expect(image_card.image_src).to.eq('data:image/png;base64,XXX=')
      })

      it('leaves unchanged wall metadata', function() {
        version_0_1_format.wall = { somedata: 'its value' }

        converted = converter.convert(version_0_1_format, '0.2')

        expect(converted.wall).to.eql(version_0_1_format.wall)
      })
    })
    describe('0.2 downgrade to 0.1', function() {
      var converted
      beforeEach(function() {
        version_0_2_format_copy = JSON.stringify(version_0_2_format)
        converted = converter.convert(version_0_2_format, '0.1')
      })

      it('marks version as 0.1', function() {
        expect(converted.structure_version).to.eq('0.1');
      })

      it('does not mutate input data', function() {
        expect(JSON.stringify(version_0_2_format)).to.eq(version_0_2_format_copy);
      })

      it('replaces x, y with left, top', function() {
        expect(converted.cards[0].left).to.eq(version_0_2_format.cards[0].x);
        expect(converted.cards[0].x).to.eq(undefined);
        expect(converted.cards[0].top).to.eq(version_0_2_format.cards[0].y);
        expect(converted.cards[0].y).to.eq(undefined);
      })

      it('removes card type for text cards', function() {
        expect(converted.cards[0].type).to.eq(undefined)
        expect(converted.cards[1].type).to.eq(undefined)
      })

      it('uses "image" type and "image_src" converted to full relative path for referenced image cards', function() {
        var image_card = converted.cards[2];
        expect(image_card.image_src).to.eq(undefined)
        expect(image_card.text).to.eq('img: bug.png')
      })

      it('uses "image" type and "image_src" for inline-data image cards', function() {
        var image_card = converted.cards[3];
        expect(image_card.type).to.eq(undefined)
        expect(image_card.image_src).to.eq(undefined)
        expect(image_card.text).to.eq('data:image/png;base64,XXX=')
      })

      it('leaves unchanged wall metadata', function() {
        version_0_2_format.wall = { otherdata: 'the value' }

        converted = converter.convert(version_0_2_format, '0.1')

        expect(converted.wall).to.eql(version_0_2_format.wall)
      })
    })

  })

  describe('preversioned <-> 0.2 (double hop [up/down]grade)', function() {
    var preversioned;
    beforeEach(function(){
      preversioned = {
        meta: {'lowfi-card-ids': ['card']},
        cards: {card: {id: 'card', top: 1, left: 2, text: 'hey'}}
      };
      version_0_2_format = {
        structure_version: '0.2',
        cards: [{id: 'card', x: 2, y: 1, type: 'text', text: 'hey'}]
      };
    })

    it('upgrades prever -> 0.2', function() {
      expect(converter.convert(preversioned, '0.2')).to.eql(version_0_2_format)
    })

    it('downgrades 0.2 -> preversioned', function() {
      expect(converter.convert(version_0_2_format, null)).to.eql(preversioned)
    })
  })

  describe('converting between 0.1 and pre-versioning formats', function() {
    var pre_versioning_format = {
      meta: {
        'lowfi-card-ids': [
          "card-a",
          "card-b"
        ]
      },
      cards: {
        'card-a': {id: 'card-a', top: 123},
        'card-b': {id: 'card-b', top: 456}
      }
    };

    var version_0_1_format = {
      structure_version: '0.1',
      cards: [
        {id: 'card-a', top: 123},
        {id: 'card-b', top: 456}
      ]
    }

    it('leaves data when converting preversioned -> preversioned (null target_version)', function() {
      expect(converter.convert(pre_versioning_format, null)).to.equal(pre_versioning_format);
    });

    it('also accepts undefined to denoted preversioning', function() {
      expect(converter.convert(pre_versioning_format, undefined)).to.equal(pre_versioning_format);
    });

    it('leaves data when converting 0.1 -> 0.1', function() {
      var converted = converter.convert(version_0_1_format, '0.1');

      expect(converted).to.equal(version_0_1_format);
    });

    it('converts version 0.1 data, removing the structure version', function() {
      var converted = converter.convert(version_0_1_format, null);

      expect(converted.structure_version).to.not.exist;
    });

    it('converts version 0.1 data to pre-versioning format', function() {
      var converted = converter.convert(version_0_1_format, null);

      json(converted).should.equal(json(pre_versioning_format));
    });

    it('converts pre-versioning format data to version 0.1', function() {
      var converted = converter.convert(pre_versioning_format, '0.1');

      json(converted).should.equal(json(version_0_1_format));
    });

    function json(obj) {
      return JSON.stringify(obj);
    }
  });

  describe('unknown structure_version handling', function() {
    it('throws on unknown target version', function() {
      expect(function() {
        converter.convert({structure_version: '0.1'}, '1.7');
      }).to.throw(/target_version.*1.7/);
    });

    it('throws on unknown source version', function() {
      expect(function() {
        converter.convert({structure_version: 'foobar'}, '0.1');
      }).to.throw(/source.*structure_version.*'foobar'/);
    });
  })
});
