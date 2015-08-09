
function SvgCard(cardlike, wall) {
  var logical = new whalley.LogicalCard(cardlike, wall)
  forward({
    from: this,
    methods: 'has_id data matches display_as display_as_not move_to on_moved',
    properties: 'width height half_width half_height x y',
    to: logical})
}
