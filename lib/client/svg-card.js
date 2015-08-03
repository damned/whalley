
function SvgCard(cardlike, wall) {
  var logical = new whalley.LogicalCard(cardlike, wall)
  forward({ from: this, methods: 'has_id data matches display_as display_as_not move_to', to: logical})
}
