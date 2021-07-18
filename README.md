# ProhashingWampClient

## Preamble

This is a client...


## Setup

Update the `api_key` value in `config.js`

## Usage

the `prohashing` object wraps your connection to the WAMP router and serves as a container for your data.
It exposes its WAMP connection to you so that you can open/close etc. at will. You can interact directly with miner and balance properties, or listen for events.

```
const prohashing = require('./src/prohashingMod');

function _handleMinerUpdate(data){
  console.clear();
  console.table(data);
}
function _handleUpdate(data){
  console.clear();
  console.log(data);
}

//Listen for events
prohashing.events.on('minerUpdate',_handleMinerUpdate);
prohashing.events.on('minerFailure',_handleUpdate);
prohashing.events.on('balanceUpdate',_handleUpdate);
prohashing.events.on('foundBlock',_handleUpdate);
//Access elements directly
setInterval(()=>{
  console.clear();
  console.table(prohashing.miners());
  console.table(prohashing.balances());
},2000);

prohashing.connection.open();

```
