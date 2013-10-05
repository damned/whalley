function ColourWheel(canvas) {
  var colours = [ 'rgb(220, 230, 230)', 'white', 'pink', 'yellow', 'red', 'green', 'blue' ]
  var colour_index = 0;
  
  var circle = new fabric.Circle({ width: 100, height: 60, radius: 40, fill: 'blue', top: 40, left: 40 });
  canvas.add(circle);
  
  var selected = false;
  
  function next_colour() {
    return colours[ ++colour_index % colours.length];
  };
  
  this.colour = function() {
    colours[colour_index];
  };
  
  canvas.observe('object:selected', function (event) {
    if (selected) {
      console.log('circle active, dude');
      
      if (event.target !== undefined && event.target !== circle) {
        event.target.get('card').setColour(next_colour());
      }
      selected = false;
    }
    else if (event.target === circle) {
      selected = true;
    }
  });
}


