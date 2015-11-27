/**
* @module feedmodel
* @author wxm
* @version since Wallet V5.8
* @description for H5 only, module to process auth from login page, which is in local storage or coockie set by feed.html
*/

define(['cUtilDate', 'CommonStore', 'Log', 'Config', 'WalletStore', 'cUtilCryptBase64', 'Scmg'],
function (cUtilDate, CommonStore, Log, Config, WalletStore, cUtilCryptBase64, Scmg) {

    var WALLET_AUTH_INFO = 'WALLET_AUTH_INFO';
    var WALLET_AUTH_LAST = 'WALLET_AUTH_LAST';
    var WALLET_VER = 'WALLET_VER';
    var authFeed;

    return {
        /**
        * @description this function return the auth in secure wallet domain.
        * @return user auth
        */
        getFeedAuth: function () {
            return authFeed;
        },
        /**
        * @description init and set feed auth from store WALLET_AUTH_INFO or cookie.
        */
        init: function () {
            try {
                if (Config.IS_INAPP) {//
                    //check auth change...
                    var headStore = CommonStore.HeadStore.getInstance();
                    this._checkAuthChange(headStore.getAttr('auth'));
                    return;
                }

                var headStore = CommonStore.HeadStore.getInstance();
                //check if auth is updated asyncly by login page
                Log.Info('checking auth from WALLET_AUTH_INFO store...');
                var ui = this._getTokenFromLocalOrCookie();
                if (ui) {
                    this._mvCookie2Store();//add auth into localstorage. Hack the case that locatStorage does't work by cross site

                    var hs = headStore.get();
                    if (!hs) {
                        hs = {};
                    }
                    hs.cver = Config.CVER_HEAD_H5;
                    hs.syscode = '09';
                    var retryStore = WalletStore.LoginRetryStore.getInstance();
                    if (ui.islogin) {
                        //login
                        this._checkAuthChange(ui.auth);

                        //cmp expired time
                        var now = new Date();
                        //var then = new Date(Date.parse(ui.time));
                        ui.time = ui.time.replace(/-/g, '/');
                        var then = cUtilDate.parse(ui.time).date;
                        if (now > then) {
                            Log.Info('auth given from pub expired');
                            //var times = retryStore.getAttr('trytimes');
                            //retryStore.setAttr('trytimes', ++times);
                        } else {
                            hs.auth = ui.auth;
                            headStore.set(hs);
                            headStore.setAuth(ui.auth);

                            //lizard2.1 change: need to set userStore as well
                            CommonStore.UserStore.getInstance().setAuth(ui.auth);

                            authFeed = ui.auth;
                            retryStore.setAttr('trytimes', 1);
                        }
                    } else {
                        this._clearAuthInfo();

                        hs.auth = '';
                        headStore.set(hs);
                        headStore.setAuth('');

                        //lizard2.1 change: need to set userStore as well
                        CommonStore.UserStore.getInstance().setAuth('');

                        authFeed = undefined;
                        if (ui && !ui.islogin) {
                            //logout, clear info
                            retryStore.setAttr('trytimes', 0);
                        }
                        this._clearWalletStore();
                        localStorage.removeItem(WALLET_AUTH_LAST);
                    }
                }
                if (Config.DEBUG) {
                    var debugOptStore = WalletStore.DebugOptStore.getInstance();
                    var opt = debugOptStore.get();

                    if (opt && opt.useauth && opt.auth) {
                        Log.Info('Use auth from debug UI setting: ' + opt.auth);
                        var hs = headStore.get();
                        if (!hs) {
                            hs = {};
                        }
                        hs.cver = Config.CVER_HEAD_H5;
                        hs.auth = opt.auth;
                        headStore.set(hs);
                        headStore.setAuth(opt.auth);

                        //lizard2.1 change: need to set userStore as well
                        CommonStore.UserStore.getInstance().setAuth(opt.auth);

                        authFeed = opt.auth;
                    }
                }
            } catch (err) {
            }
        },
        /**
        * @description for security consideration, this function will clear all wallet storage data in secure wallet domain, which is normally happend when the auth is changed or expired
        */
        _clearWalletStore: function () {
            for (var S in WalletStore) {
                var store = WalletStore[S].getInstance();
                if (store && store.get() && store.key != "WALLET_DEBUGOPT" && store.key != "WALLET_DEBUGOPT2" && store.key != "WALLET_TIPS_FLAG") {
                    //store.set({});
                    localStorage.removeItem(store.key);
                    console.log('Clear old store: ' + store.key);
                }
            }
            Scmg.setP('');
            Scmg.setT({});
        },
        _checkAuthChange: function (newAuth) {
            var last = localStorage.getItem(WALLET_AUTH_LAST);
            if (newAuth != last) {
                this._clearWalletStore();
                localStorage.setItem(WALLET_AUTH_LAST, newAuth);
            }
            //clear cache datas if ver changed
            var lastVer = localStorage.getItem(WALLET_VER);
            if (Config.VER != lastVer) {
                this._clearWalletStore();
                localStorage.setItem(WALLET_VER, Config.VER);
            }
        },
        _getTokenFromLocalOrCookie: function () {
            var cookieVal = this._getTokenFromCookie();
            var localVal = this._getTokenFromLocal();
            if (!cookieVal && !localVal) {
                return false;
            } else {
                if (cookieVal) {
                    return this._parseToken(cookieVal);
                } else if (localVal) {
                    return this._parseToken(localVal);
                } else {
                    return false;
                }
            }
        },
        _getTokenFromCookie: function () {
            var v = this._getCookie(WALLET_AUTH_INFO);
            return v ? v : false;
        },
        _getTokenFromLocal: function () {
            var v = localStorage.getItem(WALLET_AUTH_INFO);
            return v ? v : false;
        },
        _mvCookie2Store: function () {
            var cookieVal = this._getTokenFromCookie();
            if (cookieVal) {
                localStorage.setItem(WALLET_AUTH_INFO, cookieVal);
                this._clearCookie(WALLET_AUTH_INFO);//clear cookie to save network bandwidth
            }
        },
        _clearAuthInfo: function () {
            localStorage.setItem(WALLET_AUTH_INFO, '');
            this._clearCookie(WALLET_AUTH_INFO);
        },
        _parseToken: function (val) {
            var tokenInfo;
            try {
                tokenInfo = JSON.parse(cUtilCryptBase64.Base64.decode(decodeURIComponent(val)));
                return tokenInfo;
            } catch (e) {
                console.log("parse token error!!! tokenInfo = " + val);
                return false;
            };
        },
        _getCookie: function (name) {
            var arr = document.cookie.split(';');
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i].replace(/\s+/g, '');
                if (item.indexOf(name) != -1) {
                    item = unescape(item);
                    return item.split('=')[1];
                }
            }
            return false;
        },
        _clearCookie: function (name) {
            this._setCookie(name, "", -1);
        },
        _setCookie: function (name, value, seconds) {
            seconds = seconds || 0;
            var expires = "";
            if (seconds != 0) {
                var date = new Date();
                date.setTime(date.getTime() + (seconds * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        }
    }
});