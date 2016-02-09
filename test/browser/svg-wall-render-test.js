'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var Browser = require('./browser')

var webdriver = require('selenium-webdriver')

describe('svg wall rendering', function() {
  const wall_name = 'render-test';
  var browser, page
  this.timeout(3000)

  before(() => {
    browser = new Browser()

    return browser.start()
  })

  beforeEach(() => {
    page = browser.open_wall(wall_name)
  })

  after(() => {
    return browser.quit()
  })

  it('displays a card', (done) => {
    expect(page.title()).to.eventually.equal('Whalley SVG Card Wall')
    expect(page.wall().card.text).to.eventually.equal('TODO').notify(done)
  })

  it('has other cards', (done) => {
    expect(page.wall().card_named('TODO').text).to.eventually.equal('TODO').notify(done)
  })

  it('displays card which displays a menu', (done) => {
    var card = page.wall().card_named('TODO');
    card.click_menu().click_first().then(done)
  })
  it('allows card to be dragged', (done) => {
    page.wait_for_wall().then(() => {
      var card = page.wall().card_named('TODO');
      expect(card.drag()).to.eventually.notify(done)
    })
  })
  it('allows card to be edited', (done) => {
    var card = page.wall().card_named('TODO');

    var text = card.edit('abc').then((edited) => { return edited.text});
    check(text, 'text')
    expect(text).to.eventually.equal('abcTODO').notify(done)
  })
  it('allows card to be added', (done) => {
    page.wall().shelf.drag_down().then((shelf) => {
      let last = shelf.pull_out_card()
      expect(last).to.eventually.notify(done)
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
