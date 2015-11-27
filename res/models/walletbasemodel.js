/**
 * @module mockmodel
 * @author wxm, lzx
 * @description wallet ajax models base class
 */

define(['cCoreInherit', 'cModel', 'CommonStore', 'Log', 'Config', 'Util', 'WalletStore', 'cGuiderService', 'FeedModel'],
    function(cBase, cModel, CommonStore, Log, Config, Util, WalletStore, cGuiderService, FeedModel) {

        var headStore = CommonStore.HeadStore.getInstance();

        Config.platformType = Util.getPlatformType();
        Config.syscode = Util.getSyscode();

        FeedModel.init(); //init feed auth from cookie or localstorage

        //abscract model
        var AbscractModel = new cBase.Class(cModel, {
            __propertys__: function() {
                //this.usehead = false; //not to use commonstore head info
                this.protocol = 'HTTPS';
                this.isPipeModel = true; //if go through pipe in app, instead of soa2 webcall
                this.ajaxOnly = true; //apply to soa2 service call, framework baseclass variable, false to enable store cache, true for realtime webcall
            },
            initialize: function($super, options) {},
            /**
             * @description this function will delete invalid field by resposebitmp, and append valid data to store
             * @return data after filter
             */
            storeValidData: function(map, data, store) {
                var bmp = data.resbmp;
                var c = [1, 2, 4, 8]; //TODO, currently, only 4 bits are used.

                if (typeof bmp == 'undefined') {
                    bmp = 0xffffffff;
                }

                for (var i = 0; i < c.length; i++) {
                    if (!(bmp & c[i]) && map[i]) { //no data && has map
                        for (var j = 0; j < map[i].length; j++) {
                            delete data[map[i][j]];
                        }
                    }
                }
                for (var x in data) {
                    store.setAttr(x, data[x]);
                }

                return data;
            },
            //getData: function () {/*abstract*/ return {} },
            addRiskParams: function() {
                var _cInfo = localStorage.getItem("CINFO");
                if (_cInfo) {
                    try {
                        _cInfo = JSON.parse(_cInfo);
                        if (_cInfo) {
                            if (typeof _cInfo.longitude !== 'undefined' && typeof _cInfo.latitude !== 'undefined') {
                                var _lgtd = _cInfo.longitude.toString();
                                var _lttd = _cInfo.latitude.toString();
                                if (!Util.isEmpty(_lgtd) && !Util.isEmpty(_lttd)) {
                                    this.param.lgtd = _lgtd;
                                    this.param.lttd = _lttd;
                                }
                            }
                        }
                    } catch (e) {
                        console.log("parse cInfo error!!! cInfo = " + _cInfo);
                    };
                }
            },
            _isEqualResponse: function(cacheData, realtimeData) {
                var r = _.clone(realtimeData);
                var c = {};

                //just check valid response data
                //1. cache data may have some local data, ignore them
                for (i in r) {
                    if (typeof cacheData[i] != 'undefined') {
                        c[i] = cacheData[i];
                    }
                }
                //2. not compare resbmp
                typeof r.resbmp !== 'undefined' && delete r.resbmp;
                typeof c.resbmp !== 'undefined' && delete c.resbmp;
                //3. ResponseStatus is framework data, not compare it
                r.ResponseStatus && delete r.ResponseStatus;
                c.ResponseStatus && delete c.ResponseStatus;

                return _.isEqual(r, c);
            },
            exec: function(param) {
                var that = this;
                var reqparams = that.param;
                if(Config.LOG_REQUEST_INFO){
                    console.log('['+that.url + '] request:---------------------------------------->');
                    console.log(JSON.stringify(reqparams));
                }

                if (Config.DEBUG && Config.ENV !== 'pro') {
                    if(that.valFds){
                        var reqKeys = _.keys(reqparams);
                        for(var i=0;i<that.valFds.length;i++){
                            var key = that.valFds[i];
                            if(_.indexOf(reqKeys, key) === -1){
                                console.error('Service ['+that.url+'] param:'+key+' is missing!');
                            }
                        }
                    }
                }

                if (!param.fail && param.scope && param.scope.onModelExecFail) {
                    param.fail = param.scope.onModelExecFail;
                }

                //check if cache data is supported
                //if yes, callback with cache data first, then with service data
                var cacheData;
                if (param.cache && this.getCacheData) {
                    cacheData = this.getCacheData();
                    if (cacheData) {
                        param.suc.call(param.scope, cacheData, Config.MDL_CBK_STATUS.CACHE);
                    }
                }

                if (Config.MOCK_SERVICE_CALL) {
                    var bSuc = Math.random() > 0.1 ? true : false;
                    var delay = 0;

                    if (!that.getData) {
                        delay = 2000; //delay for mockdata.js to be loaded
                    }
                    setTimeout(function() {
                        var scope = param.scope || this;
                        if (!that.getData) {
                            param.fail.call(scope, {rc: 10, rmsg: 'mock: getData not ready'});
                        } else {
                            var data = that.getData(reqparams); 
                            if (that.dataformat) {
                                data = that.dataformat(data);
                            }
                            if (that.result) {
                                that.result.remove();
                                that.result.setObject(data);
                            }
                            if(Config.LOG_RESPONSE_INFO){
                                console.log('['+that.url + '] response:---------------------------------------->');
                                console.log(JSON.stringify(data));
                            }
                            setTimeout(function() {
                                if (Config.MOCK_SERVICE_SUCESS) {
                                    param.suc.call(scope, data);
                                } else {
                                    param.fail.call(scope, data);
                                }
                            }, Config.MOCK_SERVICE_DELAY); //mock async to test loading
                        }
                    }, delay);
                } else {
                    // var auth = headStore.getAttr('auth');
                    // if (typeof auth == 'undefined' || auth == '') {
                    //     Log.Info('autho invalid, jump to login page...');
                    //     Util.gotoLogin(param.scope);
                    //     return;
                    // }

                    if (this.isPipeModel) { //钱包CBU外的服务不需要plat,mchid，ver参数
                        this.param.ver = Config.CVER;
                        this.param.plat = Config.platformType;
                        this.param.mchid = 'CTRP';

                        this.addRiskParams();
                    }

                    if (Config.IS_INAPP && this.isPipeModel) { //
                        var that = this;
                        var _param = JSON.stringify(this.param);
                        var headobj = headStore.get();
                        headobj.cver = Config.CVER_HEAD_Hybrid;
                        headobj.syscode = Config.syscode;

                        //headobj.cid = '63538256681447737300';
                        var headstring = JSON.stringify(headobj);

                        this.callbackModel = function(info) {
                            var head;
                            info && info.resultHead && (head = JSON.parse(info.resultHead)); //JSON.parse will raise exception if format error
                            if (head && head.errcode == 0) {
                                var body = JSON.parse(info.resultBody);
                                if (that.dataformat) {
                                    body = that.dataformat(body);
                                }
                                if (that.result) {
                                    that.result.remove();
                                    that.result.setObject(body);
                                }
                                if(Config.LOG_RESPONSE_INFO){
                                    console.log('['+that.url + '] response:---------------------------------------->');
                                    console.log(JSON.stringify(body));
                                }
                                if (cacheData) {
                                    var type = that._isEqualResponse(cacheData, body) ? Config.MDL_CBK_STATUS.REALTIME_EQUAL : Config.MDL_CBK_STATUS.REALTIME_NOT_EQUAL;
                                    param.suc.call(param.scope, body, type);
                                } else {
                                    param.suc.call(param.scope, body);
                                }
                            } else {
                                if (param.fail) {
                                    if (info && info.resultBody) {
                                        info.resultBody.errorInformation = info.errorInformation;
                                        param.fail.call(param.scope, info.resultBody);
                                    } else {
                                        param.fail.call(param.scope, info);
                                    }
                                }
                            }
                        };

                        cGuiderService.pipe.socketRequest({
                            callback: this.callbackModel,
                            serviceCode: this.serviceCode,
                            data: _param,
                            header: headstring
                        });
                    } else {
                        //h5: this.result set in lizard.
                        this.excute(
                            function(data) {
                                if(Config.LOG_RESPONSE_INFO){
                                    console.log('['+that.url + '] response:---------------------------------------->');
                                    console.log(JSON.stringify(data));
                                }
                                if (cacheData) {
                                    var type = that._isEqualResponse(cacheData, data) ? Config.MDL_CBK_STATUS.REALTIME_EQUAL : Config.MDL_CBK_STATUS.REALTIME_NOT_EQUAL;
                                    param.suc.call(param.scope, data, type);
                                } else {
                                    param.suc.call(param.scope, data);
                                }
                            },
                            param.fail || function(info) {
                                console.log('ajax request error');
                            },
                            typeof param.ajaxOnly !== 'undefined' ? param.ajaxOnly : this.ajaxOnly,
                            param.scope || this,
                            param.abort || param.fail);
                    }
                }
            },
            //end of overriding cModel execute api

            buildurl: function() {
                var baseurl = this.baseurl();
                var tempUrl = this.protocol + '://' + (baseurl.domain) + '/' + (baseurl.path) + (typeof this.url === 'function' ? this.url() : this.url);
                if (Config.ENV == 'baolei' /*&& !Config.IS_INAPP*/ ) {
                    tempUrl += "?isBastionRequest=true";
                }
                return tempUrl;
            },

            baseurl: function(protocol, itf) {
                var host = location.host;
                var domain = 'secure.ctrip.com';
                var path = 'wallet';

                var protocoltemp = this.protocol.toLowerCase() || location.protocol.toLowerCase();
                domain = Config.DOMAINARR[Config.ENV]["domain"];
                path = Config.DOMAINARR[Config.ENV]["path"];

                if (Config.DEBUG) {
                    var debugOptStore = WalletStore.DebugOptStore.getInstance();
                    var opt = debugOptStore.get();

                    if (opt && opt.open && opt.domain && opt.path) {
                        this.protocol = opt.protocol;
                        return {
                            'domain': opt.domain,
                            'path': opt.path
                        }
                    }
                }

                return {
                    'domain': domain,
                    'path': path
                }
            }
        });

        return AbscractModel;
    });