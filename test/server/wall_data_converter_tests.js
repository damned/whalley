require('should');
var chai = require('chai');
var expect = chai.expect;

var converter = require('../../lib/server/wall_data_converter');

describe('wall_data_converter', function() {
  var target_version;
  describe('converting to pre-versioning data format', function() {
    it('leaves unversioned data unversioned', function() {
      var data = {
        'look_no_data_version_property': 'because i was written before versioning',
      }
      expect(converter.convert(data, null)).to.equal(data);
    });

    it('converts version 0.1 data, removing the data version', function() {
      var converted = converter.convert({data_version: '0.1', cards: []}, null);

      expect(converted.data_version).to.not.exist;
    });

    it('converts version 0.1 cards to pre-versioning format', function() {
      var data = {
        data_version: '0.1',
        cards: [
          { id: 'card-a', top: 123 },
          { id: 'card-b', top: 456 }
        ]
      }

      var converted = converter.convert(data, null);

      json(converted).should.equal(json({
        meta: {
          'lowfi-card-ids': [
              "card-a",
              "card-b"
          ]
        },
        cards: {
          'card-a': { id: 'card-a', top: 123 },
          'card-b': { id: 'card-b', top: 456 }
        }
      }));
    });
    function json(obj) {
      return JSON.stringify(obj);
    }
  });
});
