/**
 * @module ubt
 * @author yanjj
 * @version since Wallet V6.7
 * @description ubt
 */
define([], function () {

    var exports = {
        _sendUBT:function(keyName,jsonObj,callback){
            var value = $.param(jsonObj);
            console.log('key:'+keyName+',data:'+value);
            if(typeof window['__bfi'] == 'undefined') window['__bfi'] = [];
            window['__bfi'].push(['_tracklog', keyName, value, callback]);
        },
        sendUBTWithRealName:function(jsonObj,callback){
            var keyName = 'wallet.realname';
            this._sendUBT(keyName,jsonObj,callback);
        }
    };

    return exports;
});