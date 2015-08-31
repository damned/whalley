require('should')
var chai = require('chai')
var expect = chai.expect
var mkdirp = require('mkdirp')
var stores = require('../../lib/server/wall-stores')
var rimraf = require('rimraf')

describe('wall_stores.Store', function() {
  const store_root_dir = 'builddir/wall-stores-tests';
  var store, wall

  beforeEach(function() {
    store = stores.Store(store_root_dir)
    mkdirp.sync(store_root_dir)
    rimraf.sync(store_root_dir + '/*')
    wall = {
      structure_version: '0.1',
      cards: [
        { id: 'card-a', top: 123, text: 'a' },
        { id: 'card-b', top: 456, text: 'b' }
      ]
    }
  })

  describe('write_wall,read_wall', function() {
    it('writes and reads wall at current version', function() {
      var wall_json = JSON.stringify(wall);

      store.write_wall('bob', wall_json)
      var stored_wall = store.read_wall('bob')

      expect(stored_wall).to.eq(wall_json)
    })
  })

})
