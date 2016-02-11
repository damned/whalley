'use strict';
var webdriver = require('selenium-webdriver')
var Node = require('./node')
var WallPage = require('./wall_page')

class Browser {
  constructor(specified) {
    let options = specified || { secure: false }
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
    let i = options.secure ? 0 : 1
    this.driver.manage().window().setPosition(800 * i, 0);
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
