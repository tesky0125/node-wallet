/**
 * @author wxm
 * @module security manager
 * @desc:  Wallet V6.11
 */
define(['WalletStore', 'Util', 'Config', 'cUtilCryptBase64'], function(WalletStore, Util, Config, cUtilCryptBase64) {

    var P, T, V;
    var it = WalletStore.SmStore.getInstance();

    var exports = {
        _e: function(i) {
            var r = '';

            if (i) {
                for (var l = 0; l < i.length; l++) {
                    var s = Math.random().toString();
                    r += s[s.length % (Math.floor(s.length / 5))];
                    r += i[l];
                    r += s[s.length % (Math.floor(s.length / 7))];
                }
            }

            return cUtilCryptBase64.Base64.encode(r);
        },
        _d: function(i) {
            var r = '';

            if (i) {
                i = cUtilCryptBase64.Base64.decode(i);
                if (i) {
                    for (var l = 0; l < i.length; l++) {
                        l++;
                        r += i[l];
                        l++;
                    }
                }
            }

            return r;
        },
        s: function() {
            it.setAttr('P', P);
            it.setAttr('V', V);
        },
        r: function() {
            P = it.getAttr('P');
            V = it.getAttr('V');
        },
        c: function() {
            it.setAttr('P', '');
        },
        setP: function(i) {
            P = this._e(i);
        },
        setP64: function(i) {
            this.setP(cUtilCryptBase64.Base64.encode(i));
        },
        getP: function() {
            return this._d(P);
        },
        getP64: function() {
            return cUtilCryptBase64.Base64.decode(this.getP());
        },
        //set touchinfo
        setT: function(i) {
            T = i;
        },
        getT: function() {
            return T;
        },
        setV: function(i) {
            V = i;
        },
        getV: function() {
            return V;
        },
        clearA:function(){
            this.setP('');
            this.setT({});
        }
    };

    if (!Config.IS_INAPP) {
        exports.r();
        exports.c();

        window.addEventListener('unload', function(e){
            if (P) {
                exports.s();
            }
        });
    }

    return exports;
});