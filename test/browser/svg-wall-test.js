'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var Browser = require('./browser')

var webdriver = require('selenium-webdriver')

require('shelljs/global')

require('./runner')
var User = require('./user')
var capturer = require('./capturer')

describe('svg wall', function() {
  const wall_name = 'temp-test-wall';
  var browser, page, captured
  var user

  this.timeout(10000)

  before(() => {
    browser = Browser()
    user = User()
    return browser.start()
  })

  before(() => {
    page = browser.open_wall(wall_name)
  })

  beforeEach(() => {
    captured = capturer()
  })

  after(() => {
    return browser.quit()
  })

  it('displays a new empty wall', (done) => {
    expect(page.title()).to.eventually.equal('Whalley SVG Card Wall')
    expect(page.wall().cards.size).to.eventually.equal(0).notify(done)
  })

  it('allows card to be added', (done) => {
    page.wall().shelf.drag_down().then((shelf) => {
      var new_card = shelf.pull_out_card();
      expect(new_card.text).to.eventually.equal('new').notify(done)
    })
  })

  it('allows card to be edited', (done) => {
    var card = page.wall().card_named('new');
    card.edit('updated')
    expect(page.wall().card_named('updated').text).to.eventually.include('updated').notify(done)
  })

  it('card menu can be cancelled', (done) => {
    user.add_card(page, 'to cancel').then((card) => {
      return card.click_menu().sub_menu('change colour')
    }).then((menu) => {
      expect(menu.has_gone).to.eventually.equal(false)
      menu.select('cancel')
      expect(menu.has_gone).to.eventually.equal(true).notify(done)
    })
  })

  it('allows card to be dragged', (done) => {
    user.add_card(page, 'to drag')
    var card = page.wall().card_named('to drag')
    card.location.then(capture('start'))
    card.drag({x: 50, y: 20})
    card.location.then((location) => {
      expect(location.x).to.equal(captured.start.x + 50)
      done()
    })
  })

  it('card displays a menu', (done) => {
    user.add_card(page, 'to be pink').then((card) => {
      card.click_menu().sub_menu('change colour').then((menu) => {
        menu.select('pink')
        expect(card.colour).to.eventually.equal('rgba(255, 192, 203, 1)')
        done()
      })
    })
  })

  function capture(name) {
    return captured.capture(name)
  }

})

