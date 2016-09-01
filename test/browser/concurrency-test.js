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
    browser = new Browser({secure: true})
    user = new User()
    second_browser = new Browser({index: 1})
    second_user = new User()
    store = Store('.store/')
    store.write_wall(wall_name, JSON.stringify(concurrency_test_wall), '0.2')
    return browser.start().then(function() {
      console.log('trying to start second browser')
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
    return browser.quit().then(function() {
      second_browser.quit() // need to watch out for es6 classes and 'this' it seems :/
                            // had problems doing ...then(second_browser.quit)
    })
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


  xit('xxxxxxxxxx allows card to be edited, persisting to server', (done) => {
    var card = page.wall().card_named('new');
    card.edit('updatagain').then((edited) => {
      expect(edited.text).to.eventually.include('updatagain').then(() => {
        var cards = store.read_wall(wall_name, '0.2');
        expect(card_named(cards, 'new')).to.equal({})
        //expect(store.read_wall('edit-session', '0.2').cards).to.equal({})
        done()
      })
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
})

