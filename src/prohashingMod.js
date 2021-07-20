let mod = (()=>{
  const wspassword = 'web';
  const autobahn = require('autobahn');
  const events = require('events');
  const config = require('../config');
  const _connection = new autobahn.Connection({
    url:'wss://live.prohashing.com:443/ws',
    realm:'mining',
    authid:'web',
    authmethods:['wampcra'],
    onchallenge:_onChallenge
  });
  _events = new events.EventEmitter();
  _connection.onopen = _onConnect;
  _miners = [];
  _failures = [];
  _balances = {};
  _profitability = {};
  function _parseMinerUpdate(minerObj){
    return{
      coin_name:minerObj.coin_name,
      hashrate:minerObj.hashrate,
      miner_name:minerObj.miner_name,
      difficulty:minerObj.difficulty,
      difficulty_is_static:minerObj.difficulty_is_static,
      share_count:minerObj.share_count,
      algorithm_name:minerObj.algorithm_name,
      uuid:minerObj.uuid
    };
  }
  function _initialSessionUpdatesReceived(updates){
    updates.forEach((update)=>{
      _miners.push(_parseMinerUpdate(update));
    });
  }
  function _initialBalanceReceived(balances){
    for(key in balances){
      _balances[key] = balances[key];
    }
  }
  function _intialProfitabilityReceived(profitability){
    for(key in profitability){
      _profitability[key] = profitability[key];
    }
  }
  function _onMinerUpdate(updates){
    updates.forEach((update)=>{
      _replaceMiner(update);
    });
    _events.emit('minerUpdate',_miners);
  }
  function _onBlockUpdate(block){
    _events.emit('foundBlock',block);
  }
  function _onBalanceUpdate(updates){
    updates.forEach((update)=>{
      _balances[update.coin] += update.balance
    });
    //console.table(_balances);
    _events.emit('balanceUpdate',updates);
  }
  function _onMinerFailure(failure){
    _failures.push(failure);
    _events.emit('minerFailure',failure);
  }
  function _onProfitabilityUpdate(updates){
    updates.forEach((update)=>{
      for(index in update){
        for(key in update[index]){
          _profitability[index][key] = update[index][key];
        }
      }
    });
    _events.emit('profitabilityUpdate',updates);
  }
  function _replaceMiner(minerObj){
    for(let i = 0; i < _miners.length; i++){
      if(_miners[i].uuid === minerObj.uuid){
        for(key in minerObj){
          if(key in _miners[i]){
            _miners[i][key] = minerObj[key];
          }
        }
      }
    }
  }
  function _onChallenge(session,method,extra){
    if(method == 'wampcra'){
      return autobahn.auth_cra.sign(wspassword,extra.challenge);
    }
  }
  function _onConnect(session,details){
    //console.log('Connection Established...');
    session.subscribe('found_block_updates',_onBlockUpdate);
    session.call('f_all_miner_updates', [config.api_key]).then(_initialSessionUpdatesReceived);
    session.call('f_all_balance_updates',[config.api_key]).then(_initialBalanceReceived);
    session.call('f_all_profitability_updates').then(_intialProfitabilityReceived);
    session.subscribe('miner_update_diffs_' + config.api_key,_onMinerUpdate);
    session.subscribe('balance_updates_' + config.api_key,_onBalanceUpdate);
    session.subscribe('mining_failures_' + config.api_key,_onMinerFailure);
    session.subscribe('profitability_updates',_onProfitabilityUpdate);


  }
  return {
    events:_events,
    connection:_connection,
    miners:function(){
      return _miners;
    },
    failures:function(){
      return _failures;
    },
    balances:function(){
      return _balances;
    },
    profitability:function(){
      return _profitability;
    }
  }
})();


module.exports = mod;
