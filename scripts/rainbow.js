var config = require('../config');

var dgram = require('dgram');
var refreshrate = 10;

var pixmap = [];
var scale = 0.0015;
var offset = 0;

var _maxBuffer = 16182;

for (x = 0; x < config.width; x++) {
	pixmap[x] = [];
	for (y = 0; y < config.height; y++) {
		pixmap[x][y] = [0,0,0];
	}
}

function renderFrame() {

	var h = 0;
	var s = 1;
	var v = 1;
	var ii = 0;
	for (i = 0; i < offset; i++) {
		h += scale;  if (h > 1) { h = 0; }
	}
	if (h < 0.0002) { offset = 0; }

	for (y = 0; y < config.height; y++) {

		for (x = 0; x < config.width; x++) {
			if (ii % 10 == 0) {
				h += scale;  if (h > 1) { h = 0; }
			}
			ii++;
			var res = HSVtoRGB(h,s,v);
			pixmap[x][y] = res;
		}
	}

	offset += 2;

	sendFrame();

}

renderFrame();

function sendFrame() {

         var message = new Buffer(_maxBuffer);
    	 var cou = 0;

	 var h = config.height;
	 var w = config.width;

         for (var y=0,x; y<h; y++)  // y < ph
         {

		var flip = 0;
	        // each second row is flipped!
       		if (y % 2 == 0 && y < 31) {
			flip = 1;
        	} else if (y % 2 == 1 && y < 31) { 
			flip = 0;
               	} else if (y % 2 == 1 && y < 62) {
			flip = 1;
               	} else if (y % 2 == 0 && y < 62) { 
			flip = 0;
               	} else if (y % 2 == 1 && y > 61) {
			flip = 0;
               	} else if (y % 2 == 0 && y > 61) { 
			flip = 1;
               	}



            for (x=0; x<w; x++)  // x < pw
            {
		if (flip == 1) {
			var rgb = pixmap[(w-x)-1][y];
		} else {
			var rgb = pixmap[x][y];
		}				

		for (col = 0; col < 3; col++) {
			message.writeUInt8(rgb[col], cou);
			cou++;
		}

            }

         }


	  var client = dgram.createSocket('udp4');
	  client.bind();
	  client.on("listening", function () {
		  client.setBroadcast(true);
    	 	  client.send(message, 0, message.length, config.port, config.host, function(err, bytes) {
   		 	  if (err) throw err;
 //         	 	   console.log('UDP message sent to ' + config.host + ':'+ config.port);
			   curpackets++;
            		   client.close();
			   setTimeout(function() { renderFrame(); }, 50);
      	 	 });
	  });


}


fpscounter = setInterval(getFPS, 1000);

curpackets = 0;

function getFPS() {

	console.log(curpackets + " fps offset " + offset);
	curpackets = 0;

}


function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}



