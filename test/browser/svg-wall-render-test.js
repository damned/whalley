'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
var Browser = require('./browser')

describe('svg wall rendering', function() {
  const wall_path = '/walls/render-test';
  var browser, page
  this.timeout(3000)

  before(() => {
    browser = new Browser()

    return browser.start()
  })

  beforeEach(() => {
    page = browser.open(wall_path)
  })

  after(() => {
    return browser.quit()
  })

  it('displays a card', () => {
    expect(page.title()).to.equal('Whalley SVG Card Wall')
    expect(page.wall().card.text).to.equal('TODO')
  })

  it('has other cards', () => {
    expect(page.wall().card_named('TODO').text).to.equal('TODO')
  })

  xit('displays card which displays a menu', (done) => {
    var card = page.wall().card_named('TODO');
    card.click_menu().click_first().then(done)
  })

  xit('allows card to be dragged', (done) => {
    page.wait_for_wall().then(() => {
      var card = page.wall().card_named('TODO');
      expect(card.drag()).to.eventually.notify(done)
    })
  })
  xit('allows card to be edited', (done) => {
    var card = page.wall().card_named('TODO');

    var text = card.edit('abc').then((edited) => { return edited.text});
    check(text, 'text')
    expect(text).to.eventually.equal('abcTODO').notify(done)
  })
  xit('allows card to be added', (done) => {
    page.wall().shelf.drag_down().then((shelf) => {
      let last = shelf.pull_out_card()
      expect(last).to.eventually.notify(done)
    })
  })
})
