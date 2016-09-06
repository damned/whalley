'use strict';
var Wall = require('./wall')

class WallPage {
  constructor(browser) {
    this.browser = browser
  }

  title() {
    return this.browser.title()
  }

  wait_for_wall() {
    return this.browser.wait_for('.wall_status.ready')
  }

  wall() {
    return Wall(this.browser.find('#wall'))
  }
}
module.exports = WallPage