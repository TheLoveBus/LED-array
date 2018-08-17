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

## MacOS

To get this to run on MacOS, execute the following commands:

`sudo sysctl net.inet.udp.maxdgram=32768`
`sudo sysctl net.inet.raw.maxdgram=32768`

