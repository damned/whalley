'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect

class ChimpPage {
  constructor(chimp) {
    this.chimp = chimp
  }
  get title() {
    return this.chimp.getTitle()
  }
}
class ChimpWebBrowser {
  constructor(chimp) {
    this.chimp = chimp
  }
  open(url) {
    this.chimp.url('http://localhost:1234' + url)
    return new ChimpPage(this.chimp)
  }
}

describe('svg wall rendering', function() {
  var page
  let web

  before(() => {
    web = new ChimpWebBrowser(browser)
  })
  it('displays a card', () => {
    page = web.open('/walls/json')
    expect(page.title).to.equal('Whalley SVG Card Wall')
    browser.waitForExist('g.card')
    var titles = browser.getText('g.card');

    expect(titles).to.include('MINGLE')
  })

  xit('has other cards', () => {
    page = web.open('/walls/json')
    expect(page.wall().card_named('TODO').text).to.eventually.equal('TODO')
  })

  //describe('second user', function() {
  //
  //  it('displays card which displays a menu', (done) => {
  //    page = browser.open('/walls/json')
  //    var card = page.wall().card_named('TODO');
  //    card.click_menu().click_first().then(done)
  //  })
  //  it('allows card to be dragged', (done) => {
  //    page = browser.open('/walls/json')
  //    var card = page.wall().card_named('TODO');
  //    expect(card.drag()).to.eventually.notify(done)
  //  })
  //  it('allows card to be edited', (done) => {
  //    page = browser.open('/walls/json')
  //    var card = page.wall().card_named('TODO');
  //    card.edit('abc').then((edited) => {
  //      expect(edited.text).to.eventually.equal('abcTODO').notify(done)
  //    })
  //  })
  //  it('allows card to be added', (done) => {
  //    page = browser.open('/walls/json')
  //    page.wall().shelf.drag_down().then((shelf) => {
  //      let last = shelf.pull_out_card()
  //      expect(last).to.eventually.notify(done)
  //    })
  //  })
  //})
})
//
//function check(object, name) {
//  console.log(name + ' raw: '    + object)
//  console.log(name + ': '    + Object.prototype.toString(object))
//  console.log(name + ' length: '    + object.length)
//  console.log(name + ' then: '    + object.then)
//}
