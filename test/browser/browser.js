'use strict';
var _ = require('lodash')
var webdriver = require('selenium-webdriver')
var Node = require('./node')
var WallPage = require('./wall_page')

function Browser(specified) {
  let options = _.assign({ secure: false, index: 0 }, specified)
  var scheme = 'http';
  var port = 1234
  if (options.secure) {
    scheme = 'https'
    port = 4321
  }
  var base_uri = scheme + '://localhost:' + port
  var driver = new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      .build();

  driver.manage().window().setSize(700, 800);
  driver.manage().window().setPosition(800 * options.index, 0);

  function start() {
    return driver.getWindowHandle()
  }
  function find(locator) {
    return Node(() => { return driver.findElement({css: locator}) })
  }
  function open_wall(name, options) {
    let path = '/walls/' + name;
    driver.get(base_uri + path)
    return WallPage(external)
  }
  function title() {
    return driver.getTitle()
  }
  function quit() {
    return driver.quit()
  }
  function wait_for(selector) {
    return driver.wait(() => {
          return webdriver.until.elementLocated({css:selector});
    }, 20000)
  }
  var external = {
    start: start,
    find: find,
    open_wall: open_wall,
    title: title,
    quit: quit,
    wait_for: wait_for
  }
  return external;
}

module.exports = Browser
