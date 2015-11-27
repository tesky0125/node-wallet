/**
* @module walletfilterlistpageview
* @author wxm
* @description wallet filter list page view, for list pages with filter contrl on the top
* @version since Wallet V5.8
*/

define(['Config', 'Log', 'Util', 'WalletSelectCtrl', 'WalletListView', 'WalletModel', 'WalletStore', 'Message'],
function (Config, Log, Util, WalletSelectCtrl, WalletListView, WalletModel, WalletStore, Message) {

    var View = WalletListView.extend({
        backBtn: true,
        homeBtn: false,
        lastrfno: '',
        scrolltop: 0,
        isSelectPopup: false,//drop down icon or not
        clearDataOnHide: false,
        selectCtrl: null,
        cmdRefresh: 'wflp_ref',
        scrollZero: false, //consult result of vlw, set this param to workaround scrollbar position reset issue
        events: {
            'click .J_ListRow': 'onListRowClick'
        },
        _setHeaderIcon: function ($header) {
            if (Config.IS_WEBH5 && $header) {//
                //web h5 icon
                if ($header.hasClass('expanded')) {
                    $header.removeClass('expanded')
                } else {
                    $header.addClass('expanded')
                }
            } else {
                //hybrid/直连 icon
                var baseAddr = 'wallet/webresource/res/img/hybrid/';
                if (this.isSelectPopup) {
                    this.citybtnImagePath = baseAddr + 'arr_up.png';
                } else {
                    this.citybtnImagePath = baseAddr + 'arr_down.png';
                }
            }
        },
        _setCustomHeader: function () {
            var title = this.selectData[this.selectIdx].nameTitle;
            this.citybtn = title;

            this._setHeaderIcon();
            this.setHeaderView();
        },
        setHeaderView: function () {
            var that = this;

            this.header.set({
                citybtnImagePath: that.citybtnImagePath,
                center: {
                    tagname: 'select',
                    value: that.citybtn,
                    callback: function (e) {
                        that.citybtnHandler.call(that,e);
                    }
                },
                back: true,
                events: {
                    returnHandler: function () {
                        //copy from walletpageview.js
                        if (that.bIgnoreBackKey) {
                            //that.bIgnoreBackKey = false;//reset
                            //that.returnHandler.call(that);
                            return;
                        }

                        if (!that.tryHideMaskLayers()) {//close mask layer first
                            that.returnHandler.call(that);
                        }
                    }
                }
            });
        },
        /**
        * @description base class override api
        */
        onCreate: function () {
            this._initModelData();
            this.inherited(arguments);
            var slx = this.getQuery('selectidx');
            if (slx) {
                this.selectIdx = slx;
            }
        },
        _initModelData: function () {
            this.lastrfno = '';
            this.modelDataList = [];
        },
        /**
        * @return none
        * @description clear and rest list page data and state
        */
        resetList: function () {
            this._initModelData();
            this._gettingData = false;
            this.inherited(arguments);
        },
        onListRowClick: function (e) {
            this.scrolltop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
        },
        citybtnHandler: function (e) {
            var that = this;
            this.selectCtrl = new WalletSelectCtrl();
            this.selectCtrl.toggleSelect(that.selectData, that.selectIdx,
                function (idx) {
                    if (idx >= 0 && that.selectIdx != idx) {
                        that.selectIdx = idx;
                        that._setCustomHeader();
                        that.resetList();
                        that.onShow(that.cmdRefresh);
                    }
                },
                function (isPopup) {
                    that.isSelectPopup = isPopup;

                    //web h5 icon
                    if (Config.IS_WEBH5) {//
                        var $header = $(e.currentTarget);
                        that._setHeaderIcon($header);
                    } else {
                        that._setCustomHeader();

                    }
                    //15.11.6: ios9 got some ui issue:M18QBCBU-28, attempt to fix it
                    if(Config.platformType == 3/*ios hybrid*/){
                        if(isPopup){
                            $('.J_TrHead').css('display', 'none');
                        }else{
                            $('.J_TrHead').css('display', 'block');
                        }
                    }
                }
            );
        },
        /**
        * @description base class override api
        */
        onShow: function () {
            this._setCustomHeader();

            if (!this.modelDataList.length) {
                this.loading.show();
                this.inherited(arguments); //will call bind event and exec service
                document.body.scrollTop = this.scrolltop = 0;
                this.render();
            } else {
                this.turning();
                document.body.scrollTop = this.scrolltop;
            }
        },
        /**
        * @description base class override api
        */
        returnHandler: function () {
            if (this.selectCtrl && this.selectCtrl.visible()) {
                this.selectCtrl.close(); //close it
                return true;//v6.2, close mask only, not back page
            }
            this.clearDataOnHide = true;
            this.resetList(); //clear scroll event, to prevent onscroll event triggering
            this.inherited(arguments);
        },
        /**
        * @description base class override api
        */
        onHide: function () {
            this.inherited(arguments);
        },
        //onShow: function () {
        //this.restoreScrollPos();
        //document.body.scrollTop = this.scrolltop;
        //},
        /**
        * @description base class override api
        */
        onButtomPull: function (param, callback) {
            var that = this;

            this.setModelParam();

            //generate unique code.
            this.model.uniqueCode = new Date().getTime();
            param.uniqueCode = this.model.uniqueCode;

            this.model.exec({
                scope: this,
                suc: function (data) {

                    if (!(param.uniqueCode == this.model.uniqueCode)) {
                        Log.Info('invalid request! Params unique:' + param.uniqueCode);
                        return;
                    }
                    Log.Info('filter model exec suc!  Params unique:' + param.uniqueCode);
                    if (data.rc == 0) {
                        if (param.firstRequest && data.generalizedlist.length == 0) {
                            this.noRecord.removeClass('hidden');
                            this.itemContainter.hide();
                        }
                        if (data.generalizedlist.length) {
                            this.lastrfno = data.generalizedlist[data.generalizedlist.length - 1].rfno;
                            this.modelDataList = _.union(this.modelDataList, data.generalizedlist);
                        }

                        callback(data.generalizedlist);
                        if (Config.IS_INAPP) {//
                            $('.J_TrHead').css('top', '0px');
                        } else {
                            $('.J_TrHead').css('top', '44px');
                        }
                    } else {
                        var rc = data.rc;
                        //6.10: login alert refact, not show it
                        ///if (rc == Config.RC_CODE.AUTH_NONE || rc == Config.RC_CODE.AUTH_INVALID || rc == Config.RC_CODE.AUTH_EXP) {
                        ///    Util.showLoginAlert(this);
                        ///    return;
                        ///} else {
                            callback(null, data);
                            if (!this._isFirstRequest) {//first request error not toast, because first request fail will show404
                                this.showToast(data.rmsg);
                            }
                        ///}
                    }
                },
                fail: function (data) {
                    if (!(param.uniqueCode == this.model.uniqueCode)) {
                        Log.Info('invalid failed request! Params unique:' + param.uniqueCode);
                        return;
                    }
                    this.onButtomPullExecFail(data, callback);
                }
            });
        },
        /**
        * @description base class override api
        */
        render: function () {
            this.$el.html(_.template(this.tpl));
            this.noRecord = this.$el.find('.J_NoRecord');
            this.itemContainter = this.$el.find('.J_ItemContainter');
            this.moreDivParent = this.$el.find('.J_WalletContainer');
            //this.fireGetDataEvent();
        }
    });

    return View;
});
