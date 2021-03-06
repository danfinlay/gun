
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var aeskey = require('./aeskey');
    var parse = require('./parse');

    SEA.decrypt = SEA.decrypt || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      var key = (pair||opt).epriv || pair;
      if(!key){
        pair = await SEA.I(null, {what: data, how: 'decrypt', why: opt.why});
        key = pair.epriv || pair;
      }
      const json = parse(data)
      const ct = await aeskey(key, shim.Buffer.from(json.s, 'utf8'), opt)
      .then((aes) => (/*shim.ossl ||*/ shim.subtle).decrypt({  // Keeping aesKey scope as private as possible...
        name: opt.name || 'AES-GCM', iv: new Uint8Array(shim.Buffer.from(json.iv, 'utf8'))
      }, aes, new Uint8Array(shim.Buffer.from(json.ct, 'utf8'))))
      const r = parse(new shim.TextDecoder('utf8').decode(ct))
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.decrypt;
  