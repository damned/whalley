require('should');
var chai = require('chai');
var expect = chai.expect;

var converter = require('../../lib/server/wall-data-converter');

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
      structure_version: '0.1',
      cards: [
        { id: 'card-a', top: 123 },
        { id: 'card-b', top: 456 }
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
