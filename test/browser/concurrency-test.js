'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var Browser = require('./browser')
var Store = require('../../lib/server/wall-stores.js').Store

var webdriver = require('selenium-webdriver')

require('shelljs/global')

require('./runner')
var User = require('./user')
var capturer = require('./capturer')

describe('wall concurrency', function() {
  const wall_name = 'concurrency-test-wall';
  var browser, page, captured, store, user
  var second_browser, second_page, second_user

  var existing_cards = [ 'existing to drag' ]

  this.timeout(10000)

  var card_to_drag = {
    x: 312,
    y: 258,
    width: 50,
    height: 60,
    type: "text",
    colour: "lightgray",
    id: "1472722094316",
    color: "white",
    text: "exists for dragging"
  }
  var concurrency_test_wall = {
    structure_version: "0.2",
    cards: [ card_to_drag ],
    wall: {}
  }


  before(() => {
    browser = Browser({secure: true})
    user = User()
    second_browser = Browser({index: 1})
    second_user = User()
    store = Store('.store/')
    store.write_wall(wall_name, JSON.stringify(concurrency_test_wall), '0.2')
    return browser.start().then(function() {
      return second_browser.start()
    })
  })

  before(() => {
    page = browser.open_wall(wall_name)
    page.wait_for_wall()
    second_page = second_browser.open_wall(wall_name)
    return second_page.wait_for_wall()
  })

  beforeEach(() => {
    captured = capturer()
  })

  after(() => {
    return browser.quit().then(second_browser.quit)
  })

  it('displays walls', (done) => {
    expect(page.wall().cards.size).to.eventually.be.above(0)
    expect(second_page.wall().cards.size).to.eventually.be.above(0).notify(done)
  })


  it('adds card to other browser', (done) => {
    page.wall().shelf.drag_down().then((shelf) => {
      var new_card = shelf.pull_out_card();
      expect(new_card.text).to.eventually.equal('new')
      return second_page.wall().card_named('new').text
    }).then((other_browser_text) => {
      expect(other_browser_text).to.equal('new')
      done()
    })
  })

  it('moves card on other browser', (done) => {
    var card = page.wall().card_named(card_to_drag.text)
    var start_x;
    card.location.then((location) => {
      start_x = location.x
      card.drag({x: 40, y: 30})
      var other_browser_card = second_page.wall().card_named(card_to_drag.text);
      expect(other_browser_card.location).to.eventually.include({ x: start_x + 40 }).notify(done)
    })
  })

  it('allows card to be added and have its text set, persisting to server', (done) => {
    var card_text = 'added card'
    page.wall().shelf.drag_down().then((shelf) => {
      var new_card = shelf.pull_out_card({ text: card_text});
      expect(new_card.text).to.eventually.equal(card_text)
      return second_page.wall().card_named(card_text)
    }).then((edited_copy) => {
      expect(edited_copy.text).to.eventually.equal(card_text).then(() => {
        var wall = JSON.parse(store.read_wall(wall_name, '0.2'));
        expect(card_named(wall.cards, card_text).text).to.equal(card_text)
        done()
      })
    })
  })

  it('allows card to be edited, persisting to server', (done) => {
    page.wall().shelf.drag_down().then((shelf) => {
      var new_card = shelf.pull_out_card({ text: 'for editing'});
      expect(new_card.text).to.eventually.equal('for editing')
      new_card.edit('edited')
      return second_page.wall().card_named('edited')
    }).then((edited_copy) => {
      expect(edited_copy.text).to.eventually.equal('edited').then(() => {
        var wall = JSON.parse(store.read_wall(wall_name, '0.2'));
        expect(card_named(wall.cards, 'edited').text).to.equal('edited')
        done()
      })
    })
  })

  function card_named(cards, name) {
    let found;
    cards.forEach((card) => {
      if (card.text == name) {
        found = card
        return
      }
    })
    return found || '[not found]'
  }
})

