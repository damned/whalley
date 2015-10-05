require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var webdriver = require('selenium-webdriver')

describe('svg wall rendering', function() {
  var driver
  this.timeout(0)

  before(function() {
    driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();

    return driver.getWindowHandle()
  })
  after(function() {
    return driver.quit()
  })

  it('displays a card', function(done) {
    driver.get('http://localhost:1234/walls/json')

    expect(driver.getTitle()).to.eventually.equal('Whalley SVG Card Wall').notify(done)
  })
})