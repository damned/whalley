require('should');
var chai = require('chai');
var expect = chai.expect;

var converter = require('../../lib/server/wall_data_converter');

describe('wall_data_converter', function() {
  var target_version;
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
      data_version: '0.1',
      cards: [
        { id: 'card-a', top: 123 },
        { id: 'card-b', top: 456 }
      ]
    }

    it('leaves data when converting preversioned -> preversioned', function() {
      expect(converter.convert(pre_versioning_format, null)).to.equal(pre_versioning_format);
    });
    it('leaves data when converting 0.1 -> 0.1', function() {
      var converted = converter.convert(version_0_1_format, '0.1');

      expect(converted).to.equal(version_0_1_format);
    });

    it('converts version 0.1 data, removing the data version', function() {
      var converted = converter.convert(version_0_1_format, null);

      expect(converted.data_version).to.not.exist;
    });

    it('converts version 0.1 cards to pre-versioning format', function() {
      var converted = converter.convert(version_0_1_format, null);

      json(converted).should.equal(json(pre_versioning_format));
    });

    function json(obj) {
      return JSON.stringify(obj);
    }
  });
});
