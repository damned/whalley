'use strict';
var _ = require('lodash')
var webdriver = require('selenium-webdriver')
var Node = require('./node')
var WallPage = require('./wall_page')

class Browser {
  constructor(specified) {
    let options = _.assign({ secure: false, index: 0 }, specified)
    this.scheme = 'http';
    this.port = 1234
    if (options.secure) {
      this.scheme = 'https'
      this.port = 4321
    }
    this.base_uri = this.scheme + '://localhost:' + this.port
    this.driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();

    this.driver.manage().window().setSize(700, 800);
    this.driver.manage().window().setPosition(800 * options.index, 0);
  }
  start() {
    return this.driver.getWindowHandle()
  }
  find(locator) {
    return new Node(this.driver.findElement({css: locator}))
  }
  open_wall(name, options) {
    let path = '/walls/' + name;
    this.driver.get(this.base_uri + path)
    return new WallPage(this)
  }
  title() {
    return this.driver.getTitle()
  }
  quit() {
    console.log("this is... " + this)
    console.log("quitting... " + this.driver)
    return this.driver.quit()
  }
  wait_for(selector) {
    return this.driver.wait(() => {
          return webdriver.until.elementLocated({css:selector});
  }, 20000)
}
}

module.exports = Browser
