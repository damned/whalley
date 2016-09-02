"use strict";

class User {
  add_card(page, text) {
    return page.wall().shelf.drag_down().then((shelf) => {
      var new_card = shelf.pull_out_card();
      return new_card.edit(text)
    })
  }
}
module.exports = User