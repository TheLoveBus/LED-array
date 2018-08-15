var config = require('../config');

/**
 * HTML5 Canvas Plasma (fillRect technique)
 * 
 * Kevin Roast 10/8/11
 */

var RAD = Math.PI/180.0;
var Sin = Math.sin;
var Cos = Math.cos;
var Sqrt = Math.sqrt;

var HEIGHT;
var WIDTH;
var g_plasma;
var g_canvas;
var g_framestart;

var wcdiff = 30;

var dgram = require('dgram');

var refreshrate = 10;

//window.addEventListener('load', onloadHandler, false);
//window.addEventListener('resize', resizeHandler, false);

/**
 * Global window onload handler
 */



   // fullscreen the canvas element



/**
 * Global window resize handler
 */
/*function resizeHandler()
{
   if (g_canvas)
   {
      WIDTH = g_canvas.width = window.innerWidth;
      HEIGHT = g_canvas.height = window.innerHeight;
   }
}
*/
/**
 * Main render loop
 */
function loop()
{
   var frameStart = Date.now();
   
   g_plasma.frame.call(g_plasma)
   
 /*  if (g_plasma.ShowFPS)
   {
      var g = g_canvas.getContext('2d');
      g.save();
      g.globalAlpha = 1;
      g.fillStyle = "#000";
      g.fillRect(0,26,72,16);
      g.font = "12pt Courier New";
      g.fillStyle = "#FFF";
      g.fillText("FPS: " + Math.round(1000 / (frameStart - g_framestart)), 0, 38);
      g_framestart = frameStart;
      g.restore();
   }
   
   */
    timeo = setTimeout(loop, refreshrate);
//    requestAnimFrame(loop);
}

(function()
{
   Plasma = function()
   {
      // generate some palettes
      function rgb(g,b,r)
      {
//	   g = 0;
//	   b = 0;

           return String.fromCharCode(Math.floor(b / 2) + 128) + String.fromCharCode(Math.floor(r / 2) + 128) + String.fromCharCode(Math.floor(g / 2) + 128);
//         return "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
      }
      
      this.palettes = [];
      
      var palette = [];
      for (var i=0; i<256; i++)
      {
         palette.push(rgb(i,i,i));
      }
      this.palettes.push(palette);
      
      palette = [];
      for (var i=0; i<128; i++)
      {
         palette.push(rgb(i*2,i*2,i*2));
      }
      for (var i=0; i<128; i++)
      {
         palette.push(rgb(255-(i*2),255-(i*2),255-(i*2)));
      }
      this.palettes.push(palette);
      
      palette = new Array(256);
      for (var i = 0; i < 64; i++)
      {
         palette[i] = rgb(i << 2,255 - ((i << 2) + 1),64);
         palette[i+64] = rgb(255,(i << 2) + 1,128);
         palette[i+128] = rgb(255 - ((i << 2) + 1),255 - ((i << 2) + 1),192);
         palette[i+192] = rgb(0,(i << 2) + 1,255);
      }
      this.palettes.push(palette);
      
      palette = [];
      for (var i = 0,r,g,b; i < 256; i++)
      {
         r = ~~(128 + 128 * Sin(Math.PI * i / 32));
         g = ~~(128 + 128 * Sin(Math.PI * i / 64));
         b = ~~(128 + 128 * Sin(Math.PI * i / 128));
         palette.push(rgb(r,g,b));
      }
      this.palettes.push(palette);
      
      palette = [];
      for (var i = 0,r,g,b; i < 256; i++)
      {
          r = ~~(Sin(0.3 * i) * 64 + 190),
          g = ~~(Sin(0.3 * i + 2) * 64 + 190),
          b = ~~(Sin(0.3 * i + 4) * 64 + 190);
          palette.push(rgb(r,g,b));
      }
      this.palettes.push(palette);
      
      // init public properties for the GUI controls
      this.CycleSpeed = 2;
      this.ShowFPS = false;
      this.PlasmaDensity = 64;
      this.TimeFunction = 512;
//      this.TimeFunction = 512;
      this.PlasmaFunction = 0;
      this.Jitter = 8;
      this.Alpha = 0.1;
      this.PaletteIndex = 2;
      
      return this;
   };
   
   Plasma.prototype =
   {
      // public properties - exposed by GUI controls
      ShowFPS: false,
      CycleSpeed: 0,
      PlasmaDensity: 0,
      TimeFunction: 0,
      PlasmaFunction: 0,
      Jitter: 0,
      Alpha: 0.0,
      PaletteIndex: 0,
      
      // internal properties
      paletteoffset: 0,
      palettes: null,
      
      // animation frame rendering function
      frame: function frame()
      {
         // init context and img data buffer
         var w = WIDTH, h = HEIGHT,                      // canvas width and height
             pw = this.PlasmaDensity, ph = (pw * (h/w)),    // plasma source width and height
   //          ctx = g_canvas.getContext('2d'),
             palette = this.palettes[this.PaletteIndex],
             paletteoffset = this.paletteoffset+=this.CycleSpeed,
             plasmafun = this.PlasmaFunction;
         // scale the plasma source to the canvas width/height
         var vpx = (w/pw), vpy = (h/ph);
         
         var dist = function dist(a, b, c, d)
         {
            return Sqrt((a - c) * (a - c) + (b - d) * (b - d));
         }
         
         var time = Date.now() / this.TimeFunction;
         
         var colour = function colour(x, y)
         {
            switch (plasmafun)
            {
               case 0:
                  return ((Sin(dist(x + time, y, 128.0, 128.0) / 8.0)
                          + Sin(dist(x - time, y, 64.0, 64.0) / 8.0)
                          + Sin(dist(x, y + time / 7, 192.0, 64) / 7.0)
                          + Sin(dist(x, y, 192.0, 100.0) / 8.0)) + 4) * 32;
                  break;
               case 1:
                  return (128 + (128 * Sin(x * 0.0625)) +
                          128 + (128 * Sin(y * 0.03125)) +
                          128 + (128 * Sin(dist(x + time, y - time, w, h) * 0.125)) +
                          128 + (128 * Sin(Sqrt(x * x + y * y) * 0.125)) ) * 0.25;
                  break;
            }
         }
         
    //     ctx.save();
    //     ctx.globalAlpha = this.Alpha;
         var jitter = this.Jitter ? (-this.Jitter + (Math.random()*this.Jitter*2)) : 0;

         var message = new Buffer(16182);
    	 var cou = 0;

         for (var y=0,x; y<h; y++)  // y < ph
         {

            for (x=0; x<w; x++)  // x < pw
            {
               // map plasma pixels to canvas pixels using the virtual pixel size
               //ctx.fillStyle = palette[(~~colour(x, y) + paletteoffset) % 256];
               //ctx.fillRect(x * vpx + jitter, y * vpy + jitter, vpx, vpy);

               // each second row is flipped!
               if (y % 2 == 0 && y < 31) {
                 pixel = palette[(~~colour(w - x, y) + paletteoffset) % 256];
               } else if (y % 2 == 1 && y < 31) { 
                 pixel = palette[(~~colour(x, y) + paletteoffset) % 256];            
               } else if (y % 2 == 1 && y < 62) {
                 pixel = palette[(~~colour(w - x, y) + paletteoffset) % 256];
               } else if (y % 2 == 0 && y < 62) { 
                 pixel = palette[(~~colour(x, y) + paletteoffset) % 256];            
               } else if (y % 2 == 1 && y > 61) {
                 pixel = palette[(~~colour(x, y) + paletteoffset) % 256];
               } else if (y % 2 == 0 && y > 61) { 
                 pixel = palette[(~~colour(w - x, y) + paletteoffset) % 256];
               }

               message.write(pixel, cou, "ascii");
               
		cou += 3;

//               console.log("x: " + x + " y: " + y + " r: " + pixel.charCodeAt(2) + " g: " + pixel.charCodeAt(1) + " b: " + pixel.charCodeAt(0));
//               console.log(cou);
            }

         }

// do this in C now:
//        message[5394] = 0;
//	  message[5395] = 0;
//     	  message[5396] = 0;

	  var client = dgram.createSocket('udp4');
	  client.bind();
	  client.on("listening", function () {
		  client.setBroadcast(true);
    	 	  client.send(message, 0, message.length, config.port, config.host, function(err, bytes) {
   		 	  if (err) throw err;
 //         	 	   console.log('UDP message sent to ' + config.host + ':'+ config.port);
			   curpackets++;
            		   client.close();
      	 	 });
	  });


//         ctx.restore();
      }
   };
})();


//var Canvas = require('canvas');
//   g_canvas = new Canvas(58,31);

   // create the Plasma object
   g_plasma = new Plasma();
   
   // create the GUI controls
   /*var gui = new DAT.GUI(); // height of 30px per control ish
   gui.domElement.style.opacity = "0.75";
   gui.add(g_plasma, "PaletteIndex").min(0).max(4).step(1);
   gui.add(g_plasma, "CycleSpeed").min(0).max(8).step(1);
   gui.add(g_plasma, "PlasmaDensity").min(16).max(256).step(16);
   gui.add(g_plasma, "PlasmaFunction").min(0).max(1).step(1);
   gui.add(g_plasma, "TimeFunction").min(64).max(640).step(64);
   gui.add(g_plasma, "Jitter").min(0).max(16).step(1);
   gui.add(g_plasma, "Alpha").min(0.1).max(1.0).step(0.1);
   gui.add(g_plasma, "ShowFPS");
   gui.close();*/
   
   // init the animation loop
   g_framestart = Date.now();
   timeo = setTimeout(loop, refreshrate);

   fpscounter = setInterval(getFPS, 1000);

curpackets = 0;

function getFPS() {

	console.log(curpackets + " fps, wcdiff = " + wcdiff);
	curpackets = 0;

}

/*
var spawn = require('child_process').spawn;
var crazytimer;

getWebcam();

function getWebcam() {

        var wc = spawn('/home/ubuntu/webcam.sh');


        wc.stdout.on('data', function(data) {
                wcdiff = parseFloat(data);
		if (wcdiff < 17) { 
			// shit is going down
			g_plasma.TimeFunction = 16;
			clearTimeout(crazytimer);
			crazytimer = setTimeout(function(){g_plasma.TimeFunction = 512;},10000);
		} else {
			// shit is chill yo
		}
        });

        wc.on('close', function(code) {
                getWebcam();
        });
}
*/


/*
window.requestAnimFrame = (function()
{
   return  window.requestAnimationFrame       || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame    || 
           window.oRequestAnimationFrame      || 
           window.msRequestAnimationFrame     || 
           function(callback, element)
           {
               window.setTimeout(callback, 1000 / 60);
                      };
})();*/

