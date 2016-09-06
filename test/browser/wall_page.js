'use strict';
var Wall = require('./wall')

function WallPage(browser) {
  return {
    title: function() {
      return browser.title()
    },
    wait_for_wall: function() {
      return browser.wait_for('.wall_status.ready')
    },
    wall: function() {
      return Wall(() => { return browser.find('#wall') })
    }
  }
}
module.exports = WallPage