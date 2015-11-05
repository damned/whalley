'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var Browser = require('./browser')


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

    expect(page.title()).to.eventually.equal('Whalley SVG Card Wall')
    expect(page.wall().card.text).to.eventually.equal('MINGLE').notify(done)
  })
})
