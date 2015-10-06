'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var webdriver = require('selenium-webdriver')

class Page {
  constructor(browser) {
    this.browser = browser
  }

  title() {
    return this.browser.title()
  }
}

class Browser {
  constructor() {
    this.base_uri = 'http://localhost:1234'
    this.driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();
  }
  start() {
    return this.driver.getWindowHandle()
  }
  open(path) {
    this.driver.get(this.base_uri + path)
    return new Page(this)
  }
  title() {
    return this.driver.getTitle()
  }
  quit() {
    return this.driver.quit()
  }
}

describe('svg wall rendering', function() {
  var browser
  this.timeout(0)

  before(function() {
    browser = new Browser()

    return browser.start()
  })
  after(function() {
    return browser.quit()
  })


  it('displays a card', function(done) {
    let page = browser.open('/walls/json')

    expect(page.title()).to.eventually.equal('Whalley SVG Card Wall').notify(done)
  })
})