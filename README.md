# LED-array

Project space to work on the LED-array for the Loooooove Bus! 

1. Install Node.js 
 
[Linux/Mac/Windows instructions](https://nodejs.org/en/download/package-manager/)
 
[Alt Windows Guide](http://blog.teamtreehouse.com/install-node-js-npm-windows)
1. Create the dependencies -  
  `npm install`
1. Run the node viewer -  
  `node viewer.js`
1. In a separate terminal, run a visualizer -  
  `node plasma.js`
1. Open a web browser and test the visualization! [http://localhost:3000](http://localhost:3000)
 
"(Note: Replace localhost with whatever IP your terminal or vm is open to)"


The entire LED array works as follows:

- There is an ubuntu computer, that can run node.js, python, etc.
- The computer sends UDP frames, out the ethernet port, to 255.255.255.255
- The frames contain the data required for the panels to render the display
- There are 4 panels, (192.168.1.10-13) that each have a raspberry pi to drive them
- The Pis receive the UDP packets, and then translate them to a datastream for the LED strips (LPD8806)
- Each pixel is set using an intensity ranging from ??128-255??
