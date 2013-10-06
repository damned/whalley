function ColourWheel(canvas) {
  var colours = [ 'rgb(220, 230, 230)', 'white', 'pink', 'rgb(255,255,102)', 'fuchsia', 'olive', 'teal', 'rgba(0,0,0,0)' ];
  var colour_index = 0;
  var self = this;
  self.colour = function() {
    return colours[colour_index];
  };

  var circle = new fabric.Circle({ width: 100, height: 60, radius: 30, fill: self.colour(), top: 30, left: 30 });
  canvas.add(circle);
  circle.hasControls = false;

  var selected = false;
  
  function next_colour() {
    colour_index = (colour_index + 1) % colours.length
    return colours[colour_index];
  };
  
  canvas.observe('object:selected', function (event) {
    if (selected) {
      if (event.target === circle) {
        console.log('next colour');
        circle.set('fill', next_colour());
      }
      else {
        selected = false;
        if (event.target !== undefined) {
          console.log('updating card colour');
          event.target.get('card').setColour(self.colour());
        }
      }
    }
    else if (event.target === circle) {
      console.log('colour wheel selected, dude');
      selected = true;
    }
  });
  canvas.observe('selection:created', function (event) {
    if (selected) {
      selected = false;
      event.target.getObjects().forEach(function(visible_card) {
        visible_card.get('card').setColour(self.colour());
      })
    }
  });
}


