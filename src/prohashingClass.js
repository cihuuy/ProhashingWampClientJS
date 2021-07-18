"use strict";
const EventEmitter = require('events').EventEmitter;
const autobahn = require('autobahn');
const config = require('../config');
const wspassword = 'web';

class Prohashing extends EventEmitter{
  constructor(){
    super();
    this.config = require('../config');
    this._miners = [];
    this.connection = new autobahn.Connection({
      url:'wss://live.prohashing.com:443/ws',
      realm:'mining',
      authid:'web',
      authmethods:['wampcra'],
      onchallenge:Prohashing._onChallenge
    });
    this.connection.onopen = this._onConnect;
  }
  static _onChallenge(session,method,extra){
    if(method == 'wampcra'){
      return autobahn.auth_cra.sign(wspassword,extra.challenge);
    }
  }
  _initialSessionUpdatesReceived(updates){
    updates.forEach((update)=>{
      this._miners.push(this._parseMinerUpdate(update));
    });
  }
  _onMinerUpdate(update){
    this._replaceMiner(update);
  }
  _replaceMiner(minerObj){
    for(let i = 0; i < this._miners.lenght; i++){
      if(this._miners[i].miner_name === minerObj.miner_name){
        this._miners.splice(i,i,this._parseMinerUpdate(minerObj));
      }
    }
  }
  _parseMinerUpdate(minerObj){
    return{
      coin_name:minerObj.coin_name,
      hashrate:minerObj.hashrate,
      miner_name:minerObj.miner_name,
      difficulty:minerObj.difficulty,
      difficulty_is_static:minerObj.difficulty_is_static,
      share_count:minerObj.share_count,
      algorithm_name:minerObj.algorithm_name
    };
  }
  _onConnect(session,details){
    console.log('Connection Established...');
    // session.call('f_all_miner_updates', [config.api_key]).then(this._initialSessionUpdatesReceived);
    //this won't work because _onMinerUpdate needs to be static, but that breaks the whole idea.
    session.subscribe('miner_update_diffs_' + config.api_key,this._onMinerUpdate);
  }
}

module.exports = Prohashing;
