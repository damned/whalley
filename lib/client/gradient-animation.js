var ma = function() { var mg = $('#menu_gradient'); var d = new Date(); var t = (d.getSeconds() * 1000 + d.getMilliseconds()) % 1000; mg.attr('r', Math.abs(0.0016 * t - 0.8)) }
setInterval(ma, 40)