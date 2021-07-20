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
// prohashing.events.on('minerUpdate',_handleMinerUpdate);
// prohashing.events.on('minerFailure',_handleUpdate);
//prohashing.events.on('balanceUpdate',_handleUpdate);
// prohashing.events.on('foundBlock',_handleUpdate);

//Access elements directly
setInterval(()=>{
  console.clear();
  console.table(prohashing.miners());
  console.table(prohashing.balances());
},2000);

prohashing.connection.open();
