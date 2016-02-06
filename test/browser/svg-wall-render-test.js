'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var Browser = require('./browser')


var webdriver = require('selenium-webdriver')



describe('svg wall rendering', function() {
  var browser, page
  this.timeout(0)

  before(() => {
    browser = new Browser()

    return browser.start()
  })
  var second_browser, second_page
  before(() => {
    second_browser = new Browser()
    return second_browser.start()
  })

  before(() => {
    page = browser.open('/walls/json')
    second_page = second_browser.open('/walls/json')
  })

  after(() => {
    return browser.quit()
  })
  after(() => {
    return second_browser.quit()
  })


  it('displays a card', (done) => {
    expect(page.title()).to.eventually.equal('Whalley SVG Card Wall')
    expect(page.wall().card.text).to.eventually.equal('MINGLE').notify(done)
  })

  it('has other cards', (done) => {
    expect(page.wall().card_named('TODO').text).to.eventually.equal('TODO').notify(done)
  })

  describe('second user', function() {

    it('displays card which displays a menu', (done) => {
      var card = second_page.wall().card_named('TODO');
      //card.drag();
      expect(card.click_menu().click_first()).to.eventually.notify(done)
    })
  })
})

function check(object, name) {
  console.log(name + ' raw: '    + object)
  console.log(name + ': '    + Object.prototype.toString(object))
  console.log(name + ' length: '    + object.length)
  console.log(name + ' then: '    + object.then)
  console.log(name + ' findElement: '    + object.findElement)
  console.log(name + ' is promise: '    + webdriver.promise.isPromise(object))
}
