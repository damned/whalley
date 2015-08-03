
function SvgCard(cardlike, wall) {
  var logical = new whalley.LogicalCard(cardlike)

  forward({ from: this, methods: 'has_id data matches', to: logical})

  const IMG_DATA_PREFIX = 'data:image';
  var card_view
  if (logical.text.indexOf(IMG_DATA_PREFIX) == 0) {
    card_view = wall.create_image_card_view(logical)
  }
  else {
    card_view = wall.create_text_card_view(logical)
  }

  forward({ from: this, methods: 'display_as display_as_not move_to', to: card_view})
}
