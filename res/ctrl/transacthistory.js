/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Util', 'Log', 'WalletPageView', 'WalletModel', 'WalletStore', 'Config', 'Message', 'text!transacthistory_html', 'CacheData'],
    function (Util, Log, WalletPageView, WalletModel, WalletStore, Config, Message, html, CacheData) {

        var STRING = {
            PAGE_TITLE: "现金余额",
            CANCEL: '取消',
            GO_SETTING: '去设置',
            CONFIRM: "确定"
        };

        var accnCheckModel = WalletModel.WalletAccountCheck.getInstance();
        var accnSearchModel = WalletModel.WalletAccountSearch.getInstance();
        var userInfoCheckModel = WalletModel.WalletUserInfoCheck.getInstance();

        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            homeBtn: false,
            //backToPage: 'index',
            routeMapping: {//?
                'goWithdrawRecord': 'withdrawlist',
                'goRechargeRecord': 'rechargelist',
                'goTranxList': 'tranxlist'
            },
            events: {
                'click .J_Withdraw': function () {
                    this._preGoWithdrawOrRecharge(true);
                },
                'click .J_Recharge': function () {
                    this._preGoWithdrawOrRecharge(false);
                },
                'click .J_WithdrawRecord': 'goWithdrawRecord',
                'click .J_RechargeRecord': 'goRechargeRecord',
                'click .J_TranxList': 'goTranxList',
                'click .J_Question': function () {
                    this.getCstMsg().showMessage(Message.get(106));
                },
            },
            _preGoWithdrawOrRecharge: function (bWithdraw) {
                if (CacheData.getAccntSearchResult().accstatus == 2) {//freezed
                    this.showDlg({
                        message: Message.get(114),
                        buttons: [{
                            text: STRING.CONFIRM,
                            click: function () {
                                this.hide();
                            }
                        }]
                    });

                    return;
                }

                if (CacheData.getIsHasPwd()) {
                    //no need to refresh data if user already has pwd setting
                    this._goRechargeOrWithDraw(bWithdraw);
                } else {
                    this.loading.show();

                    var that = this;
                    accnCheckModel.param.optype = 11;
                    accnCheckModel.exec({
                        suc: function (data) {
                            //data.rc = Config.RC_CODE.ACCNT_NOT_HAVE_PAYPWD;//DEBUG
                            that.loading.hide();
                            if (data.rc != 0) {
                                that.loading.hide();
                                if (data.rc == Config.RC_CODE.ACCNT_NOT_HAVE_PAYPWD) {
                                    CacheData.setIsHasPwd(false);
                                    that._showNotHasPwdAlert(data.rmsg);
                                } else {
                                    that.showToast(data.rmsg);
                                }
                            } else {
                                CacheData.setIsHasPwd(true);
                                that._goRechargeOrWithDraw(bWithdraw);
                            }
                        },
                        fail: function (data) {
                            that.onModelExecFailAsync(data, 330);
                        },
                        scope: that
                    });
                }
            },
            _showNotHasPwdAlert: function (rmsg) {
                var that = this;
                this.showDlg({
                    message: rmsg,
                    buttons: [{
                        text: STRING.CANCEL,
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: STRING.GO_SETTING,
                        click: function () {
                            this.hide();
                            that.forward('setpaypsd2');
                        }
                    }]
                });
            },
            _goRechargeOrWithDraw: function (bWithdraw) {
                if (bWithdraw) {
                    if (CacheData.getAccntSearchResult().payonly && parseFloat(CacheData.getAccntSearchResult().payonly) > 0) {
                        this.selectWithdrawType();
                    } else {
                        this.forward('withdraw');
                    }
                } else {
                    this.forward('recharge');
                }
            },
            onCreate: function () {
                this.inherited(arguments);

                this.render();

                this._updateWhitelistUI();
                this._updateAccntInfoUI();

                this.turning();
            },
            onShow: function () {
                this.inherited(arguments);

                if (!Util.checkUser(this))
                    return;

                if (!CacheData.getIsSupportWallet()) {
                    this.loading.show();
                    accnCheckModel.param.optype = 1;
                    accnCheckModel.exec({
                        suc: function (data) {
                            this.loading.hide();
                            if (data.rc != 0) {
                                this.onModelExecFailRcNotZero(data);
                            } else {
                                CacheData.setIsSupportWallet(true);
                                this._loadingMoreData();
                            }
                        },
                        scope: this
                    });
                } else {
                    this._loadingMoreData();
                }
            },
            render: function () {
                this.$el.html(_.template(this.tpl));
            },
            _loadingMoreData: function () {
                this._checkWhiteListExec();
                this._accnSearchExec();
                this._getMoneyMsg();
            },
            _getMoneyMsg: function(){
                this.loading.show();
                var queryTxtModel = WalletModel.WalletPublicQueryText.getInstance();
                queryTxtModel.param.reqtype = 1;
                queryTxtModel.exec({
                    suc: function (data) {
                        this.loading.hide();
                        if (data.rc == 0) {
                            this.$el.find('.J_MoneyMsg').removeClass('hidden').text(data.text);
                        } 
                    },
                    fail: function (data) {
                        //this.onModelExecFailAsync(data, 330);
                    },
                    scope: this
                });
            },
            _checkWhiteListExec: function () {
                userInfoCheckModel.param.reqtype = '13';//13：白名单功能检查
                userInfoCheckModel.exec({
                    suc: function (data) {
                        if (data.rc != 0) {
                            //this.onModelExecFailRcNotZero(data);
                        } else {
                            if (data.rflag == 2) {
                                CacheData.setIsInWhiteList(true);
                            } else if (data.rflag == 1){
                                CacheData.setIsInWhiteList(false);
                            }
                        }
                        this._updateWhitelistUI();
                    },
                    fail: function () { },
                    scope: this
                });
            },
            _updateWhitelistUI: function () {
                var rechargeWithdraw = this.$el.find('.J_RechargeWithdraw');
                var withdraw = this.$el.find('.J_OnlyWithdraw');
                if (CacheData.getIsInWhiteList()) {
                    rechargeWithdraw.removeClass('hidden');
                    withdraw.addClass('hidden');
                } else {
                    rechargeWithdraw.addClass('hidden');
                    withdraw.removeClass('hidden');
                }
            },
            _accnSearchExec: function () {
                accnSearchModel.param.reqbmp = 1;
                accnSearchModel.exec({
                    suc: function (data) {
                        if (data.rc != 0) {
                            //this.onModelExecFailRcNotZero(data);
                        } else {
                            CacheData.setAccntSearchResult(data);

                            this._updateAccntInfoUI();
                        }
                    },
                    fail: function() {},
                    scope: this
                });
            },
            _updateAccntInfoUI: function () {
                var unavail = CacheData.getAccntSearchResult().unavail;
                var frzBal = this.$el.find('.J_FreezeAmt');
                if (typeof (unavail) != 'undefined' && !Util.isZero(unavail)) {
                    unavail = parseFloat(unavail).toFixed(2);
                    this.$el.find('.J_Unavail').text(unavail);
                    frzBal.removeClass('hidden');
                } else {
                    frzBal.addClass('hidden');
                }
                
                var avail = CacheData.getAccntSearchResult().avail;
                if (typeof avail != 'undefined') {
                    avail = parseFloat(avail).toFixed(2);
                    this.$el.find('.J_MR').removeClass('hidden');
                    this.$el.find('.J_Money').text(avail);
                }
            },
            selectWithdrawType: function () {
                var target = '' +
                    '<div class="cui-pop-box">' +
                        '<div class="cui-hd" style=" padding-right:0px; background:#f2f2f2; color:#099fde; line-height:44px; height:44px; border-bottom:2px solid #43b6e6;" >' +
                            '选择提现类型' +
                            '<div class="cui-grayload-close close2 J_SelClose" style="position:relative;"></div>' +
                         '</div>' +
                        '<div class="cui-bd">' +
                            '<ul class="p10li2 lh1">' +
                                '<li class="J_SelWdNormal city_tab">' +
                                    '<div class="ellips">提现至储蓄卡<div class="fr"><i class="font12">￥</i>{1}</div></div>' +
                                    '<div class="font12 grey">余额来源于充值、返现，支持提现至储蓄卡</div></li>' +
                                '<li class="J_SelWdBack">' +
                                    '<div class="ellips">提现至原付款账户<div class="fr"><i class="font12">￥</i>{2}</div></div>' +
                                    '<div class="font12 grey">余额来源于订单退款，仅支持原路退回</div></li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>';

                this.mask = this.getCstMsg();
                this.mask.showMessage(Util.formatStr(target, CacheData.getAccntSearchResult().basicbal, CacheData.getAccntSearchResult().payonly), false, _.bind(function (e) {
                    //console.log($(e.target).attr('class'));
                }, this));

                $('.J_SelClose').one('click', _.bind(function (e) {
                    this.mask.close();
                }, this));

                $('.J_SelWdNormal').one('click', _.bind(function (e) {
                    this.mask.close();
                    this.forward('withdraw');
                }, this));

                $('.J_SelWdBack').one('click', _.bind(function (e) {
                    this.mask.close();
                    this.forward('withdrawback');
                }, this));
            },
            //returnHandler: function () {
            //    if (this.tokenInfoView && this.tokenInfoView.from) {
            //        this.jump2TokenUrl(this.tokenInfoView.from);
            //        this.tokenInfoView = undefined; //clear ret page after used
            //        return true;
            //    }
            //    if (this.getEntryView() == 'index') {
            //        this.back('index');
            //        return true;
            //    }
            //    if (this.retPage) {
            //        this.back(decodeURIComponent(this.retPage));
            //        return true;
            //    }
            //
            //    var tk = Util.getTokenInfoStore();
            //    if (tk && tk.from && tk.entryLast == 'transacthistory') {
            //        this.jump2TokenUrl(tk.from);
            //        return true;
            //    }
            //
            //    if (tk && tk.entryLast == 'index') {
            //        this.back('index');
            //        return true;
            //    }
            //    if(Config.IS_INAPP) {
            //        this.back();
            //    } else {
            //        this.back('index');
            //    }
            //    return true;
            //}
         });

        return View;
    });