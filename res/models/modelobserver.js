/**
 * @module modelobserver
 * @author wxm
 * @description wallet model data ready observers
 */

define(['Config', 'WalletModel', 'WalletStore'], function(Config, WalletModel, WalletStore) {

    /******************************************
     * @description:  model data ready event subscriber
     * @author     :  wxm
     * @date       :  2015-2-4
     */
    var DoneState = {
        NOTLOAD: -1,
        EXECING: 1,
        SUC: 2,
        FAIL: 3
    };

    exports = {
        _lst: {}, //local model option and data list
        _exec: function(opt) {
            var m = WalletModel[opt.model].getInstance();
            if (opt.param) {
                m.param = opt.param;
            }
            this._lst[opt.model]._state = DoneState.EXECING;
            m.exec({
                suc: function(data, src) {
                    /*bellow code has nest issue, because cbSub may make register new callback to this._lst[opt.model], so you can't just
                    //reset the list by this._lst[opt.model]._arrCb = [] in the end, which will cause new registered callback in cbSub never triggered

                    //check if need to ignore equal realtime callback
                    if(src !== Config.MDL_CBK_STATUS.REALTIME_EQUAL){
                        this._lst[opt.model]._state = DoneState.SUC;
                        if (opt.showLoading) {
                            opt.scope.loading.hide();
                        }

                        this._lst[opt.model]._data = data;
                        for (var i in this._lst[opt.model]._arrCb) {
                            if (typeof (this._lst[opt.model]._arrCb[i].cbSuc) == 'function') {
                                this._lst[opt.model]._arrCb[i].cbSuc.call(this._lst[opt.model]._arrCb[i].scope, data); //nest call of observe result in issue
                            }
                        }
                    }
                    //cache data may trigger callback twice
                    //so check if it's from cache callback
                    if(src !== Config.MDL_CBK_STATUS.CACHE){
                        //not from cache data callback, so remove listener callback
                        this._lst[opt.model]._arrCb = [];
                    }
                    */

                    //check if need to ignore equal realtime callback
                    if (src !== Config.MDL_CBK_STATUS.REALTIME_EQUAL) {
                        //cache or diff realtime data, so callback
                        this._lst[opt.model]._state = DoneState.SUC;
                        this._lst[opt.model]._data = data;

                        var iBack = []; //backup of done callback items
                        var item;
                        var idx = 0;
                        var lArrayNow = this._lst[opt.model]._arrCb.length; //save current length because callback may change the list
                        while ((idx < lArrayNow) && (item = this._lst[opt.model]._arrCb.shift())) { //use shift it to make sure atom operation
                            idx++;
                            iBack.push(item);

                            if (item.showLoading) {
                                item.scope.loading.hide();
                            }

                            if (typeof(item.cbSuc) == 'function') {
                                item.cbSuc.call(item.scope, data); //watch out: this can change this._lst[opt.model]._arrCb
                            }
                        }
                        //cache data should not remove callback list, so move it back
                        if (src === Config.MDL_CBK_STATUS.CACHE) {
                            this._lst[opt.model]._arrCb = this._lst[opt.model]._arrCb.concat(iBack);
                        }
                    } else {
                        //same realtime data, no need to callback, just reset the list
                        this._lst[opt.model]._arrCb = [];
                    }
                },
                fail: function(data) {
                    this._lst[opt.model]._state = DoneState.FAIL;
                    this._lst[opt.model]._data = data;

                    for (var i in this._lst[opt.model]._arrCb) {
                        if (this._lst[opt.model]._arrCb[i].showLoading) {
                            this._lst[opt.model]._arrCb[i].scope.loading.hide();
                        }

                        if (typeof(this._lst[opt.model]._arrCb[i].cbFail) == 'function') {
                            this._lst[opt.model]._arrCb[i].cbFail.call(this._lst[opt.model]._arrCb[i].scope, data);
                        }
                    }
                    this._lst[opt.model]._arrCb = [];
                },
                scope: this,
                cache: opt.cache
            });
        },
        /**
         * @param opt.refresh: if need to reload data from server
         * @param opt.model: model name
         * @param opt.param: object type to specify model param, param change will force refresh data from server
         * @param opt.cbSuc: optional, successful model data callback api
         * @param opt.cbFail: optional, failure model data callback api
         * @description register model data call back.
         */
        register: function(opt) {
            if (typeof(this._lst[opt.model]) == 'undefined') {
                //init data structure
                this._lst[opt.model] = {};
                this._lst[opt.model]._arrCb = [];

                this._lst[opt.model]._state = DoneState.NOTLOAD;
            }
            //check if last request is ongoing and this request's param is changed, if in this case, defer current request
            if ((this._lst[opt.model]._state === DoneState.NOTLOAD || this._lst[opt.model]._state === DoneState.EXECING) &&
                this._lst[opt.model]._param && !_.isEqual(opt.param, this._lst[opt.model]._param)) {
                setTimeout(_.bind(this.register, this, opt), 1000); //defer it
                return;
            }

            //check if need to refresh
            if (opt.refresh || this._lst[opt.model]._state === DoneState.FAIL /*refresh data if last request fail*/ || (this._lst[opt.model]._data && this._lst[opt.model]._data.rc != 0) /*refresh data if last rc fail*/ || !_.isEqual(opt.param, this._lst[opt.model]._param)) {
                //reset state
                this._lst[opt.model]._state = DoneState.NOTLOAD;
            }

            if (this._lst[opt.model]._state === DoneState.NOTLOAD || this._lst[opt.model]._state === DoneState.EXECING) {
                if (opt.showLoading) {
                    opt.scope.loading.show();
                }

                this._lst[opt.model]._param = _.clone(opt.param);
                this._lst[opt.model]._arrCb.push(opt);

                if (this._lst[opt.model]._state === DoneState.NOTLOAD) {
                    this._exec(opt);
                }
            } else { //SUC, can't be FAIL, because fail is reseted to NOTLOAD just now
                if (this._lst[opt.model]._state === DoneState.SUC) {
                    if (opt.cbSuc) {
                        opt.cbSuc.call(opt.scope, this._lst[opt.model]._data);
                    }
                } else if (opt.cbFail) {
                    //assert, no chance to go here!
                    alert('report bug to WXM');//TODO, to remove this block code
                    opt.cbFail(opt.scope, this._lst[opt.model]._data);
                }
            }
        }
    };

    return exports;
});