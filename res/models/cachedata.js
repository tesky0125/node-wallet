/**
* @module cachedata
* @author wxm
* @description wallet cache data wrapper. use global memory or local storage to cache cross model/param result
*/

define(['WalletStore'], function (WalletStore) {

    /**
    * @module getXXXX(), setXXXX(newValue)
    * @author wxm
    * @description get/set data from/to cache
    */
    //memory cache datas
    var M_Keys = [
        'IsHasPwd',
        'IsSupportWallet',
        'IsInWhiteList',
        'IsFreezed',
        'IsUvsOpen',
        'IsAuthStateChanged',
        'IsFpSettingChanged',
        'IsMyInsrcStateChanged'
    ];
    //store cache datas
    var S_Keys = [
        'IsRealNamed',
        'TxtCashTips',
        'TxtQpTips',
        'Guid',
        'FsBkPage',
        'AdRowHeight',
        'IsFromInsrcAct',
        'RegMobile',
        'InsrcActFrmParam'
    ];

    var exports = {
        //----------------------
        //bellow is global memory cache data
        //----------------------
        _accntSearchResult: {},
        getAccntSearchResult: function () {
            return this._accntSearchResult;
        },
        setAccntSearchResult: function (obj) {
            this._accntSearchResult.avail = obj.avail;
            this._accntSearchResult.unavail = obj.unavail;
            this._accntSearchResult.accstatus = obj.accstatus;
            this._accntSearchResult.payonly = obj.payonly;
            this._accntSearchResult.basicbal = obj.basicbal;
        },

        //----------------------
        //bellow is local storage cache data
        //----------------------
        _cacheStore: WalletStore.CacheStore.getInstance(),
        _getCache: function (key) {
	        return this._cacheStore.getAttr(key);
	    },
	    _setCache: function (key, value) {
	        return this._cacheStore.setAttr(key, value);
	    }
    };

    for (var i in S_Keys) {
        exports['get' + S_Keys[i]] = (function (_param) {
            return function () {
                return this._getCache(_param);
            }
        })(S_Keys[i]);

        exports['set' + S_Keys[i]] = (function (_param) {
            return function (value) {
                return this._setCache(_param, value);
            }
        })(S_Keys[i]);
    };

    for (var i in M_Keys) {
        exports['get' + M_Keys[i]] = (function (_param) {
            return function () {
                return this[_param];
            }
        })(M_Keys[i]);

        exports['set' + M_Keys[i]] = (function (_param) {
            return function (value) {
                return this[_param] = value;
            }
        })(M_Keys[i]);
    };

    return exports;
});
