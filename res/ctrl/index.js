/**
 * @author wxm
 * @desc:  Wallet V5.7
 */

define(['cGuiderService', 'Util', 'Log', 'WalletPageView', 'WalletModel', 'WalletStore', 'Config', 'Message', 'text!index_html', 'ModelObserver', 'CacheData', 'IndexPlugin', 'FingerHelper', 'AdPlugin', 'Scmg'],
    function(cGuiderService, Util, Log, WalletPageView, WalletModel, WalletStore, Config, Message, html, ModelObserver, CacheData, IndexPlugin, FingerHelper, AdPlugin, Scmg) {

        var STRING = {
            PAGE_TITLE: "我的钱包",
            CANCEL: '取消',
            GO_SETTING: '去设置',
            CONFIRM: "确定",
            CONSUMERECORDS: '消费记录'
        };

        var POPUP_DLG_TYPE = {
            UNKNOWN: 0,
            NONE: 1,
            INSRC: 2,
            RN_FORCE: 3,
            RN_NOT_FORCE: 4,
            RN_CAN_SKIP: 5, //6.12 add type
            INSRC_CAN_SKIP: 6 //6.12 add type
        };

        var POPUP_DLG_STAT = {
            UNKNOWN: 0,
            WILL_SHOW: 1,
            SHOWING: 2,
            SHOW_CLOSED: 3
        };

        var userInfoCheckModel = WalletModel.WalletUserInfoCheck.getInstance();
        var bankCardModel = WalletModel.WalletBindedCreditCardListSearch.getInstance();
        var formPageStore=WalletStore.SetPageStore.getInstance();

        var ctripMenuAddr = '//webresource.c-ctrip.com/ResCRMOnline/R5/basewidget/main.js';
        Config.IS_HYBRID && (ctripMenuAddr = '../basewidget/main.js'); //
        require([ctripMenuAddr], function() {
            cPublic.ctripMenu({
                show: true,
                buName: 'wallet'
            });
        });

        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            homeBtn: false,
            model: {}, //index view model
            vmPlugin: {}, //plugin view model
            _statePopupDlg: POPUP_DLG_STAT.UNKNOWN,
            _typePopupDlg: POPUP_DLG_TYPE.UNKNOWN,
            ubtRealNameDataHandler: function(type) {
                var enforcement = this.model.flagMustRnBal || this.model.flagMustRnLipin || this.model.flagMustRnRecash,
                    value;
                if (type === 'ok') {
                    if (Config.IS_H5) {
                        value = enforcement ? 'click_realname_h5_enforcement' : 'click_realname_h5';
                    } else {
                        value = enforcement ? 'click_realname_hybrid_enforcementz' : 'click_realname_hybrid';
                    }
                } else if (type === 'cancel') {
                    if (Config.IS_H5) {
                        value = enforcement ? 'click_realname_h5_enforcement_cancel' : 'click_realname_h5_cancel';
                    } else {
                        value = enforcement ? 'click_realname_hybrid_enforcementz_cancel' : 'click_realname_hybrid_cancel';
                    }
                }
                return {
                    id: value
                };
            },
            commitHandler: {
                id: 'J_Explain',
                callback: function() {
                    if (Config.IS_HYBRID) {
                        this.jump(Config.H5_DOMAIN_URL + '/wallet/consumerecords?fromHybrid=1');
                    } else {
                        this.forward('consumerecords'); //go web in web
                    }
                }
            },
            events: {
                'click .J_FloatRow': function() {
                    if (this.model.flagInsrcActOn) {
                        this.forward('insrcactivity');
                    } else if (this.model.flagUvsOn) {
                        formPageStore.setAttr('rmFromPage', 'index');
                        this.forward('accountverified');
                    }
                },
                'click .J_SecHead': function(e) {
                    if (!$(e.target).hasClass('J_StateFrz') && this.model.accstatus != 2 && this.model.flagUvsOn) {
                        this.forward('accountverified');
                    }
                },
                'click .J_StateFrz': function(e) {
                    this.getCstMsg().showMessage(Message.get(105));
                },
                'click .J_Balance': function() {
                    this._checkFrozenState(1, function() {
                        this.forward('transacthistory');
                    });
                },
                'click .J_Lipin': function() {
                    this._checkFrozenState(2, function() {
                        if (Config.IS_INAPP) { //
                            cGuiderService.cross({
                                path: 'lipin',
                                param: 'index.html#/webapp/lipin/money?from=wallet'
                            });
                        } else {
                            this.jump(Config.H5_MAIN_HOME_APP_URL + '/lipin/money?from=wallet');
                        }
                    });
                },
                'click .J_CashRet': function() {
                    this._checkFrozenState(3, function() {
                        this.forward('useraccount');
                    });
                },
                'click .J_Mybank-card': function() {
                    this._checkFrozenState(4, function() {
                        this.forward('mybankcard');
                    });
                }
            },
            _goFastPay: function() {
                var that = this;

                if (typeof(this.model.accstatus) == 'undefined' || typeof(this.model.haspwd) == 'undefined') {
                    if (this.bAccountSearchReturned && this.bUserInfoReturned) {
                        this.showToast(Message.get(123));

                        //background force reload data
                        if (typeof(this.model.accstatus) == 'undefined') {
                            this._accnSearchExec();
                        }
                        if (typeof(this.model.haspwd) == 'undefined') {
                            this._userinfoSearchExec();
                        }
                    }
                    return;
                }

                /*if (!this.model.fastpaynoticecleared) {
                    var tipsFlagStore = WalletStore.TipsFlagStore.getInstance();
                    tipsFlagStore.setAttr('FastPayNewTip', true);
                    this.model.fastpaynoticecleared = true;
                    this.els.fastNew.addClass('hidden');
                }*/

                if (this.model.accstatus == 2) { //freezed
                    this.showDlg({
                        message: Message.get(114),
                        buttons: [{
                            text: STRING.CONFIRM,
                            click: function() {
                                this.hide();
                            }
                        }]
                    });
                    return;
                }

                //this.model.haspwd = 0;

                if (!this.model.haspwd) {
                    this.showDlg({
                        message: Message.get(121),
                        buttons: [{
                            text: STRING.CANCEL,
                            click: function() {
                                this.hide();
                            }
                        }, {
                            text: STRING.GO_SETTING,
                            click: function() {
                                this.hide();
                                that.forward('setpaypsd2');
                            }
                        }]
                    });
                    return;
                }

                this._getCreditCardList();
            },
            _getCreditCardList: function() {
                this.loading.show();
                bankCardModel.param = {};
                var _param = {
                    'PayChannel': 'ProtocolBind'
                };
                bankCardModel.param.reqtype = 4;
                bankCardModel.param.paymchid = Config.PAYMCHIDS.FASTPAY; //TODO independentset
                bankCardModel.param.scenparam = JSON.stringify(_param);
                bankCardModel.param.authstatus = 0;
                bankCardModel.exec({
                    scope: this,
                    suc: function(data) {
                        this.loading.hide();
                        this.procRcCode(data, true);
                        if (data.rc == 0) {
                            if (data.first == 0) {
                                this.forward('fastpaywithpsd?path=guide');
                            } else {
                                this.forward('fastpaysetting?source=1'); //1：钱包
                            }
                        }
                    },
                    fail: function(data) {
                        this.onModelExecFailAsync(data, 330);
                    }
                })

            },
            onCreate: function() {
                this.inherited(arguments);
                this.isFromLipin === undefined && (this.isFromLipin = location.href.indexOf('from=lipin') >= 0);
                this.adPlugIn = undefined;

                this.render();
                this.turning();

                if (Config.IS_INAPP) {
                    this.vmPlugin.showSvc = true;
                }

                IndexPlugin.render({
                    selector: '.J_Bill',
                    action: 'insertAfter',
                    data: this.vmPlugin,
                    view: this,
                    ver: Config.CVER_HEAD_Hybrid
                });

            },
            onShow: function() {
                //Scmg.setP('112233');
                //if('112233' !== Scmg.getP())
                //    alert(111)
                //Scmg.setP64('112233');
                //if('112233' !== Scmg.getP64())
                //    alert(222);
                Scmg.clearA();
                //to show ctrip menu
                if (typeof(cPublic) == 'object') {
                    cPublic.ctripMenu({
                        show: true,
                        buName: 'wallet'
                    });
                }

                this.inherited(arguments);
                if (!Util.checkUser(this))
                    return;

                //reset view data
                //this.model = {}; //reset all data will clear flags bellow! so don't reset it
                this.bUserInfoReturned = false;
                this.bAccountSearchReturned = false;

                if (CacheData.getIsRealNamed()) {
                    this.els.secHead.removeClass('hidden');
                    this.els.secHead.css({
                        height: '40px'
                    });
                }

                if (CacheData.getAdRowHeight()) {
                    this._setAdRowHeight(); //not first time, no animate
                    this._createAdRow();
                }

                if (this._typePopupDlg === POPUP_DLG_TYPE.UNKNOWN || CacheData.getIsAuthStateChanged() || CacheData.getIsMyInsrcStateChanged()) {

                    this._hideFloatRow(); //M10ZH-1756, hide float layer first

                    CacheData.setIsAuthStateChanged(false);
                    CacheData.setIsMyInsrcStateChanged(false);

                    this.loading.show();
                    //1	    是否支持钱包					0:获取失败;1不支持；2:支持
                    //13	    用户是否在白名单				0:获取失败;1不在白名单；2:在白名单
                    //12	用户是否冻结					0:获取失败;1非冻结；2:已冻结
                    //21	现金余额是否需要强制实名		0:获取失败;1不强制；2:强制
                    //22	礼品卡是否需要强制实名		0:获取失败;1不强制；2:强制
                    //23	返现是否需要强制实名			0:获取失败;1不强制；2:强制
                    //24	是否非强制实名提醒			0:获取失败;1不提醒；2:提醒
                    //25	独立实名认证开关				0:获取失败;1关闭；2:打开
                    //26  是否提示账号险活动                   0:获取失败;1不提示；2:提示
                    //28  送保险活动开关                 0:获取失败;1无；2:有
                    //29  用户实名状态                 0：未认证；1：已认证；2:认证失败 3:认证无结果 100:认证审核中


                    userInfoCheckModel.param.reqtype = '1|13|12|21|22|23|24|25|26|28|29';
                    userInfoCheckModel.exec({
                        suc: this._checkaccount_suc,
                        scope: this
                    });
                } else {
                    this._loadingMoreData();
                    this.adPlugIn.adjAdHeight(); //sometimes ad row not shown, set the height will show it
                }

                //after 6.11, pagemanager will restore url param to make sure page-url is not changed, so mark bellow
                // this.$el.attr({
                //     'page-url': this.viewname
                // }); //to workaround framework test: removeFlag = ((this.curView.$el.attr('page-url') != url
            },
            onHide: function() {
                this.inherited(arguments);
                //to hide ctrip menu
                if (typeof(cPublic) == 'object') {
                    cPublic.ctripMenu({
                        show: false,
                        buName: 'wallet'
                    });
                }
            },
            render: function() {
                this.$el.html(_.template(this.tpl));
                this.els = {
                    'secHead': this.$el.find('.J_SecHead'),
                    'un': this.$el.find('.J_UN'),
                    /////'realName': this.$el.find('.J_RealName'),
                    'bankCard': this.$el.find('.J_Bc'),
                    ///'secLevel': this.$el.find('.J_SL_Color'),
                    'bcSetting': this.$el.find('.J_BcSetting'),
                    ///'accsStatus': this.$el.find('.J_AU'),
                    /////'stateFrz': this.$el.find('.J_StateFrz'),
                    'avail': this.$el.find('.J_Avail'),
                    'linpCard': this.$el.find('.J_LC'),
                    'retCash': this.$el.find('.J_FX'),
                    'frz': this.$el.find('.J_IconFrz'),
                    'JExplain': this.$el.find('#J_Explain'),
                    'fltRow': this.$el.find('.J_FloatRow'),
                    'bill': this.$el.find('.J_Bill')
                };
            },
            _updateFingerCapability: function() {
                if (Config.MOCK_FINGER_SUPPORT) {
                    this.vmPlugin.supportFinger = 0;
                    IndexPlugin.update({
                        data: this.vmPlugin,
                        view: this
                    });
                }

                if (Config.IS_INAPP) { //
                    var that = this;

                    if (!Util.isRootedDevice()) {
                        FingerHelper.callFingerMethod(1000, function(rc) {
                            //supportFinger=0 支持指纹验证并且设置过指纹
                            //supportFinger=1 支持指纹验证但是未设置过指纹
                            //supportFinger=2 不支持指纹验证
                            if (rc.resultCode === 0 || rc.resultCode === 1) {
                                that.vmPlugin.supportFinger = rc.resultCode;
                                IndexPlugin.update({
                                    data: that.vmPlugin,
                                    view: that
                                });
                            }
                        });
                    }
                }

            },
            _checkaccount_suc: function(data) {
                this.loading.hide();
                if (data.rc != 0) {
                    this.procRcCode(data);
                    if (Config.IS_INAPP && this.alert && this.alert.hide && typeof(this.alert.hide) == 'function' && this.alert.status == Config.FRW_UI_STATUS.SHOW) { //
                        this.bIgnoreBackKey = true; //6.2 require: in hybrid, when alert comes off firstly, disable backkey
                    }
                } else {
                    var flags = data.rflag.split('|');

                    if (flags[0] == '2') {
                        CacheData.setIsSupportWallet(true);

                        this._updateUserFlags(flags);
                        this._loadingMoreData();
                    } else {
                        //not support wallet or service fail
                        if (flags[0] == '1') {
                            Util.showAcntUnsupAlert(this);
                        } else {
                            this.onModelExecFail(data);
                        }
                        return;
                    }
                }
            },
            _loadingMoreData: function() {
                //aync call of more services...
                var that = this;

                if (Config.IS_HYBRID && !that._bPluginChecked) { //
                    //if(1){
                    try {
                        require([Config.H5_WALLET_URL_INDEX_PI + '/' + Util.getDateNowFmt()], function(data) {
                            that._bPluginChecked = true; //only check once during wallet app life cycle
                            if (data && typeof data.url == "string" && data.url) {
                                require([data.url], function(plugin) {
                                    IndexPlugin = plugin;
                                    IndexPlugin.remove({
                                        view: that
                                    });
                                    IndexPlugin.render({
                                        selector: '.J_Bill',
                                        action: 'insertAfter',
                                        data: that.vmPlugin,
                                        view: that,
                                        ver: Config.CVER_HEAD_Hybrid
                                    });
                                });
                            }
                        });
                    } catch (err) {}
                }

                this._updateFingerCapability();
                this._userinfoSearchExec();
                this._accnSearchExec();
                ///this._moneyQueryTextExec();
                ///this._fastpayQueryTextExec();
                ///this._usernoticeExec();

                if (Config.IS_INAPP || Config.MOCK_FINGER_SUPPORT) { //
                    FingerHelper.toastFingerOperationResult(this);
                }
            },
            _showBankCardState: function(idx) {
                this.els.bcSetting.next().addClass('hidden'); //hide loading icon

                idx === 0 ? this.els.bankCard.removeClass('hidden') : this.els.bankCard.addClass('hidden');
                idx === 1 ? this.els.bcSetting.removeClass('hidden') : this.els.bcSetting.addClass('hidden');
                idx === 3 ? this.els.bcSetting.next().next().removeClass('hidden') : this.els.bcSetting.next().next().addClass('hidden');
            },
            _onUserInfoLoadFail: function(bmp) {
                var c = [1, 2];
                if (!bmp) { //0 or undefined means all
                    bmp = 0xffffffff;
                }
                for (var i = 0; i < c.length; i++) {
                    if (bmp & c[i]) {
                        switch (i + 1) {
                            case 1: //bankcard button
                                this._showBankCardState(3);
                                break;
                            case 2: //security level
                                this.vmPlugin.seclevel = undefined;
                                IndexPlugin.update({
                                    data: this.vmPlugin,
                                    view: this
                                });
                                break;
                        }
                    }
                }

            },
            _userinfoSearchExec: function() {
                ModelObserver.register({
                    scope: this,
                    refresh: true,
                    cache: true,
                    model: 'WalletUserInfoSearch',
                    param: {
                        reqbmp: 0
                    },
                    cbFail: function(data) {
                        this.bUserInfoReturned = true;

                        //update fail UI
                        this._onUserInfoLoadFail();
                    },
                    cbSuc: function(data) {
                        this.bUserInfoReturned = true;
                        CacheData.setIsHasPwd(data.haspwd == 1); //save for other page use
                        CacheData.setIsRealNamed(data.authstatus == 1);
                        //save data for later use
                        this.model.haspwd = data.haspwd;
                        this.model.authstatus = data.authstatus;
                        this.model.username = data.username;

                        this._updateHeadSec();

                        if (data.cardcnt > 0) {
                            this.els.bankCard.html(data.cardcnt + '<span class="font12" style="padding-left:3px;">张</span>');
                            this._showBankCardState(0);
                        } else if (data.cardcnt === 0) {
                            this._showBankCardState(1);
                        } else {
                            this._showBankCardState(3);
                        }

                        this.vmPlugin.seclevel = data.seclevel;
                        IndexPlugin.update({
                            data: this.vmPlugin,
                            view: this
                        });
                        ///if (typeof data.seclevel != 'undefined') {
                        ///var seclevelUI = Util.getSafeLevel(data.seclevel);
                        ///this.els.secLevel.text(seclevelUI);
                        ///if (this.lastSecLevCss) {
                        ///    this.els.secLevel.removeClass(this.lastSecLevCss);
                        ///}
                        ///this.lastSecLevCss = Util.getSafeLevelClass(data.seclevel);
                        ///this.els.secLevel.addClass(this.lastSecLevCss);
                        ///}
                    }
                });
            },
            _onAccnSearchLoadFail: function(bmp) {
                var c = [1, 2, 4];
                if (!bmp) { //0 or undefined means all
                    bmp = 0xffffffff;
                }
                for (var i = 0; i < c.length; i++) {
                    if (bmp & c[i]) {
                        switch (i) {
                            case 0: //avail
                                this.els.avail.addClass('hidden');
                                this.els.avail.next().addClass('hidden'); //remove loading cursor
                                this.els.avail.next().next().removeClass('hidden'); //show load error
                                break;
                            case 1: //linpCard
                                this.els.linpCard.addClass('hidden');
                                this.els.linpCard.next().addClass('hidden'); //remove loading cursor
                                this.els.linpCard.next().next().removeClass('hidden'); //show load error
                                break;
                            case 2: //retCash
                                this.els.retCash.addClass('hidden');
                                this.els.retCash.next().addClass('hidden'); //remove loading cursor
                                this.els.retCash.next().next().removeClass('hidden'); //show load error
                                break;
                        }
                    }
                }

            },
            _showMoneyRow: function(dom, money) {
                dom.next().addClass('hidden'); //remove loading cursor
                dom.next().next().addClass('hidden'); //remove load error
                dom.html(Util.fmtMoney(money));
                dom.removeClass('hidden'); //show money
            },
            _accnSearchExec: function() {
                ModelObserver.register({
                    scope: this,
                    refresh: true,
                    cache: true,
                    model: 'WalletAccountSearch',
                    param: {
                        reqbmp: 0
                    },
                    cbFail: function(data) {
                        this.bAccountSearchReturned = true;

                        //update fail UI
                        this._onAccnSearchLoadFail();
                    },
                    cbSuc: function(data) {
                        var that = this;
                        this.bAccountSearchReturned = true;
                        //save data for later use
                        this.model.accstatus = data.accstatus;
                        if (Config.MOCK_HAS_CONSUMERECORDS || data.csmRecNum && data.csmRecNum != 0) {
                            this.resetHeaderView({
                                btn: {
                                    title: STRING.CONSUMERECORDS,
                                    id: 'J_Explain',
                                    classname: 'explain'
                                },
                                events: {
                                    commitHandler: function() {
                                        that.commitHandler.callback.call(that);
                                    }
                                }
                            });
                        }

                        this._updateHeadSec();

                        if (typeof data.avail == 'undefined') {
                            this._onAccnSearchLoadFail(1);
                        } else if (data.avail) {
                            this._showMoneyRow(this.els.avail, data.avail);
                        }
                        if (typeof data.lipincard == 'undefined') {
                            this._onAccnSearchLoadFail(2);
                        } else if (data.lipincard) {
                            this._showMoneyRow(this.els.linpCard, data.lipincard);
                        }
                        if (typeof data.rtcash == 'undefined') {
                            this._onAccnSearchLoadFail(4);
                        } else if (data.rtcash) {
                            this._showMoneyRow(this.els.retCash, data.rtcash);
                        }

                        if (data.unavail) {
                            //unavail ready, update UI...
                            if (!Util.isZero(data.unavail)) {
                                this.els.frz.addClass('alarm2');
                            } else {
                                this.els.frz.removeClass('alarm2');
                            }
                        }
                        //save data for other page use
                        if (typeof data.avail != 'undefined') {
                            CacheData.setAccntSearchResult(data);
                        }
                    }
                });
            },
            returnHandler: function() {
                if (Config.IS_INAPP) { //
                    CtripBusiness.app_do_business_job(1, 'refresh_account_info', {}, new Date().getTime()); //
                }
                this.hide404();
                //    if (this.tokenInfoView && this.tokenInfoView.from) {
                //        this.jump2TokenUrl(this.tokenInfoView.from);
                //        return true;
                //    }
                //
                //    var tk = Util.getTokenInfoStore();
                //    if (tk && tk.from) {
                //        this.jump2TokenUrl(tk.from);
                //        return true;
                //    }

                this.inherited(arguments);
                return true;
                //
            },
            //bellow are APIs exported for plugin call
            onFastPayClick: function() {
                var that = this;

                if (!this.bAccountSearchReturned || !this.bUserInfoReturned) {
                    if (!this.bAccountSearchReturned) {
                        ModelObserver.register({
                            scope: this,
                            refresh: false,
                            showLoading: true,
                            model: 'WalletAccountSearch',
                            param: {
                                reqbmp: 0
                            },
                            cbSuc: function() {
                                that._goFastPay();
                            },
                            cbFail: function() {
                                that.showToast(Message.get(123));
                            }
                        });
                    }
                    if (!this.bUserInfoReturned) {
                        ModelObserver.register({
                            scope: this,
                            refresh: false,
                            showLoading: true,
                            model: 'WalletUserInfoSearch',
                            param: {
                                reqbmp: 0
                            },
                            cbSuc: function(data) {
                                that._goFastPay();
                            },
                            cbFail: function() {
                                that.showToast(Message.get(123));
                            }
                        });
                    }
                } else {
                    that._goFastPay();
                }
            },
            onSecurityLevelClick: function() {
                this._checkFrozenState(5, function() {
                    this.forward('securitycenter');
                });
            },
            onFpSettingClick: function() {
                var that = this;
                ModelObserver.register({
                    scope: this,
                    refresh: CacheData.getIsFpSettingChanged(),
                    showLoading: true,
                    model: 'WalletUserInfoSearch',
                    param: {
                        reqbmp: 0
                    },
                    cbFail: function(data) {},
                    cbSuc: function(data) {
                        CacheData.setIsFpSettingChanged(false);
                        FingerHelper.goFingerSetting(that, data);
                    }
                });
            },
            //6.7 new functions bellow...
            /*
            scene: 1    balance
            scene: 2    lipin
            scene: 3    recash
            scene: 4    mybankcard
            scene: 5    security center*/
            _checkFrozenState: function(scene, callback) {
                var that = this;

                if (!this.bAccountSearchReturned) {
                    ModelObserver.register({
                        scope: this,
                        refresh: false,
                        showLoading: true,
                        model: 'WalletAccountSearch',
                        param: {
                            reqbmp: 0
                        },
                        cbSuc: function() {
                            that._checkFrozenAndRealNameFlag.call(that, scene, callback);
                        },
                        cbFail: function() {
                            that.showToast(Message.get(123));
                        }
                    });
                } else {
                    that._checkFrozenAndRealNameFlag.call(that, scene, callback);
                }
            },
            _checkFrozenAndRealNameFlag: function(scene, callback) {
                if (typeof this.model.accstatus === 'undefined') {
                    this.showToast(Message.get(123));

                    //background force reload data
                    this._accnSearchExec();
                    return;
                }
                if (this.model.accstatus == 2) { //freezed
                    var userInfoStore = WalletStore.UserInfoStore.getInstance();
                    userInfoStore.setAttr('freezed', true);
                    this.showDlg({
                        message: Message.get(114),
                        buttons: [{
                            text: STRING.CONFIRM,
                            click: function() {
                                this.hide();
                            }
                        }]
                    });
                    return;
                }

                if (scene <= 3) {
                    if (this.model.flagUvsOn && ((scene == 1 && this.model.flagMustRnBal) || (scene == 2 && this.model.flagMustRnLipin) || (scene == 3 && this.model.flagMustRnRecash))) {
                        this._cbWhenImgFail = callback;
                        this._typePopupDlg = POPUP_DLG_TYPE.RN_FORCE; // set dlg type
                        this._preShowPopupDlg(true);
                    } else {
                        callback.call(this);
                    }
                } else {
                    //6.12: mybank + security center
                    if (this.model.flagUvsOn && (this.model.authstatus === 0 || this.model.authstatus === 2)) { // 0：未认证；1：已认证；2:认证失败 3:认证无结果 100:认证审核中
                        this._cbWhenImgFail = callback;

                        if (this.model.flagInsrcActOn) {
                            this._typePopupDlg = POPUP_DLG_TYPE.INSRC_CAN_SKIP; // set dlg type
                        } else {
                            this._typePopupDlg = POPUP_DLG_TYPE.RN_CAN_SKIP; // set dlg type
                        }
                        this._preShowPopupDlg(true);
                    } else {
                        callback.call(this);
                    }
                }
            },
            _isStopShowPopupDlg: function() {
                return this.getEntryView() !== 'index' || this.isFromLipin === true || this._statePopupDlg == POPUP_DLG_STAT.SHOW_CLOSED;
            },
            _updateUserFlags: function(flags) {
                if (flags[1] == '2') {
                    CacheData.setIsInWhiteList(true);
                } else if (flags[1] == '1') {
                    CacheData.setIsInWhiteList(false);
                }

                if (flags[2] == '2') {
                    this.model.accstatus = 2; //freeze
                } else {
                    //this.model.accstatus = undefined;
                }

                //considering service degrade, treat fail as optional
                if (flags[3] == '2') {
                    this.model.flagMustRnBal = true;
                } else {
                    this.model.flagMustRnBal = false;
                }
                if (flags[4] == '2') {
                    this.model.flagMustRnLipin = true;
                } else {
                    this.model.flagMustRnLipin = false;
                }
                if (flags[5] == '2') {
                    this.model.flagMustRnRecash = true;
                } else {
                    this.model.flagMustRnRecash = false;
                }
                if (flags[6] == '2') {
                    this.model.flagRemindRn = true;
                } else {
                    this.model.flagRemindRn = false;
                }
                if (flags[7] == '2') {
                    this.model.flagUvsOn = true;
                    CacheData.setIsUvsOpen(true);
                } else {
                    this.model.flagUvsOn = false;
                    CacheData.setIsUvsOpen(false);
                }

                //6.10: insrc flags...
                if (flags[8] == '2') {
                    this.model.flagRemindInsrcAct = true;
                } else {
                    this.model.flagRemindInsrcAct = false;
                }

                if (flags[9] == '2') {
                    this.model.flagInsrcActOn = true;
                } else {
                    this.model.flagInsrcActOn = false;
                }

                this.model.authstatus = parseInt(flags[10]);


                //this.model.flagRemindRn = true; //debug
                //this.model.flagMustRnLipin = true; //debug
                //this.model.flagInsrcActOn = false;//debug
                //this.model.flagRemindInsrcAct = true; //debug

                //ignore remind if any of service fail!
                //check if need to show popup dialogs
                this._typePopupDlg = POPUP_DLG_TYPE.NONE;
                if (this.model.accstatus != 2) {
                    //6.10 add: 弹出规则： 在保险开关开启的情况下，且用户未实名，首次进入我的钱包首页弹出
                    //浮层、弹窗优先级： 保险赠送>强制实名 > 非强制实名
                    if (this.model.authstatus === 0 || this.model.authstatus === 2) { // 0：未认证；1：已认证；2:认证失败 3:认证无结果 100:认证审核中
                        if (this.model.flagInsrcActOn && this.model.flagRemindInsrcAct) {
                            this._typePopupDlg = POPUP_DLG_TYPE.INSRC;
                        } else if (this.model.flagUvsOn) {
                            //uvs is on
                            if (this.model.flagMustRnBal || this.model.flagMustRnLipin || this.model.flagMustRnRecash) {
                                this._typePopupDlg = POPUP_DLG_TYPE.RN_FORCE;
                            } else if (this.model.flagRemindRn) {
                                this._typePopupDlg = POPUP_DLG_TYPE.RN_NOT_FORCE;
                            }
                        }

                        if (this._typePopupDlg != POPUP_DLG_TYPE.NONE) {
                            //show popup some dialog
                            if (!this._isStopShowPopupDlg()) { //if from lipin, or back from other wallet page: not show dlg
                                this._statePopupDlg = POPUP_DLG_STAT.WILL_SHOW;
                                this._preShowPopupDlg();
                            } else {
                                this._typePopupDlg = POPUP_DLG_TYPE.NONE; //ignore popup dlg
                            }
                        }
                    }
                }

                this._createAdRow(); //create advertize row
            },
            _showFloatRow: function(bAnimate) {
                if (this.model.flagInsrcActOn) {
                    this.els.fltRow.html('<span class="fr"><i></i></span><i class="a3"></i>为了资金安全, 请实名认证(赠账户安全险)');
                } else {
                    this.els.fltRow.html('<span class="fr">为资金安全，请认证<i></i></span><i class="a3"></i>账户未实名认证');
                }
                this.els.fltRow.addClass('auditing');
                this.els.fltRow.addClass('no');

                this.els.secHead.addClass('hidden');
                if (bAnimate) {
                    this.$el.find('.J_Wrp').animate({
                        top: "0px"
                    }, 400);
                } else {
                    this.$el.find('.J_Wrp').css({
                        top: "0px"
                    });
                }
            },
            _hideFloatRow: function() {
                this.els.fltRow.html('');
                this.els.fltRow.removeClass('auditing');
                this.els.fltRow.removeClass('no');

                this.$el.find('.J_Wrp').css({
                    top: "-40px"
                });
            },
            _showUserStateRow: function() {
                //not show float layer, how about user state row
                this._hideFloatRow(); //hide float layer first
                //前台显示状态：
                //已认证：通过实名认证
                //审核中：审核中&无法认证
                //未实名：未实名&认证失败

                //0：未认证；1：已认证；2:认证失败 3:认证无结果 100:认证审核中
                if (this.model.accstatus == 2 ||
                    this.model.authstatus == 1 ||
                    this.model.authstatus == 100 ||
                    this.model.authstatus == 3
                ) {
                    //show state row
                    if (this.els.secHead.hasClass('hidden')) {
                        if (this.model.authstatus == 1) {
                            //no animation if realnamed
                            this.els.secHead.removeClass('hidden');
                            this.els.secHead.css({
                                height: '40px'
                            });
                        } else {
                            this.els.secHead.css({
                                height: '0px'
                            });
                            this.els.secHead.removeClass('hidden');
                            this.els.secHead.animate({
                                height: '40px'
                            }, 250);
                        }
                    }

                    if (this.model.username) {
                        this.els.un.html(Util.escapeWlt(this.model.username));
                    }
                    if (this.model.accstatus == 2) {
                        this.$el.find('.J_StateFrz').removeClass('hidden');
                    } else {
                        this.$el.find('.J_StateFrz').addClass('hidden');
                    }

                    if (this.model.authstatus == 1) {
                        this.$el.find('.J_StateVerified').removeClass('hidden');
                        this.$el.find('.J_StateVerifing').addClass('hidden');
                    } else if (this.model.authstatus == 100 || this.model.authstatus == 3) {
                        this.$el.find('.J_StateVerifing').removeClass('hidden');
                        this.$el.find('.J_StateVerified').addClass('hidden');
                    }
                } else {
                    this.els.secHead.addClass('hidden');
                }
            },
            _updateHeadSec: function() {
                if (typeof this.model.accstatus != 'undefined' && typeof this.model.authstatus != 'undefined') {
                    if (this._typePopupDlg != POPUP_DLG_TYPE.RN_FORCE && this._typePopupDlg != POPUP_DLG_TYPE.RN_NOT_FORCE && this._typePopupDlg != POPUP_DLG_TYPE.INSRC) {
                        //not show realname or insrc dlg, how about float layer
                        if (this.model.accstatus != 2) {
                            if (this.model.flagInsrcActOn || this.model.flagUvsOn) {
                                if (this.model.authstatus == 0 || this.model.authstatus == 2) {
                                    //not realnamed or realname fail: show float row
                                    this._showFloatRow();
                                } else {
                                    //realnamed or realnaming: just show realname status
                                    this._showUserStateRow();
                                }
                            } else {
                                //insrc is off, and realname is off, do not show float row
                                this._showUserStateRow();
                            }
                        } else {
                            //frozen: show frozen state, not show float
                            this._showUserStateRow();
                        }
                    } else {
                        //show reanlname or insrc dlg, hide sechead first
                        this.els.secHead.addClass('hidden');

                        //bellow cases should show the float:
                        //case 1: not show dlg, like back from other wallet page, or from lipin/consumerecord
                        //case 2: should show dlg, and the dlg is closed
                        if (this._statePopupDlg != POPUP_DLG_STAT.WILL_SHOW || this._statePopupDlg == POPUP_DLG_STAT.SHOW_CLOSED) {
                            this._showFloatRow();
                        }
                    }
                }
            },
            _preShowPopupDlg: function(isBtnClick) {
                if (this._statePopupDlg === POPUP_DLG_STAT.WILL_SHOW || isBtnClick) {
                    if (this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_NOT_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_CAN_SKIP) {
                        //realname dlgs...
                        var optype;
                        if (this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE) {
                            optype = 11;
                            this._txtRnDlg = this.TxtRnMust;
                        } else {
                            optype = 13;
                            this._txtRnDlg = this.TxtRnOptional;
                        }

                        if (!this._txtRnDlg) {
                            var that = this;
                            this._realNameQueryTextExec(optype,
                                function() {
                                    that._showPopupDlg(isBtnClick);
                                },
                                function() {
                                    if (isBtnClick) {
                                        this.showToast(Message.get(330));
                                    }
                                });
                        } else {
                            this._showPopupDlg(isBtnClick);
                        }
                    } else if (this._typePopupDlg === POPUP_DLG_TYPE.INSRC || this._typePopupDlg === POPUP_DLG_TYPE.INSRC_CAN_SKIP) {
                        //insrc dlg
                        this._showPopupDlg(isBtnClick);
                    }
                }
            },
            _showPopupDlg: function(isBtnClick) {
                var that = this;

                var img = new Image();
                var isShowLoading = true;
                that.loading.show();

                img.onload = function() {
                    isShowLoading = false;
                    that.loading.hide();
                    img.onload = undefined;
                    that._showPopupDlgOnImgReady.call(that, isBtnClick);
                };
                img.cancel = img.onabort = img.onerror = function() {
                    isShowLoading = false;
                    that.loading.hide();

                    if (!isBtnClick) {
                        //first time page load, but show dlg failed
                        that.bIgnoreBackKey = false;
                        that._statePopupDlg = POPUP_DLG_STAT.SHOW_CLOSED;
                        that._showFloatRow(true);
                    } else {
                        //button click fail, to degrade, should go click target
                        if (that._cbWhenImgFail) {
                            that._cbWhenImgFail.call(that);
                            that._cbWhenImgFail = undefined;
                        } else {
                            that.showToast(Message.get(123));
                        }
                    }
                };

                if (this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_NOT_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_CAN_SKIP) {
                    //realname dlg
                    img.src = Util.getH5ImgUrl('rzbg2.png');

                    var sel = '.authentication';
                    //Util.createCss('.authentication{ background: url(' + img.src + ') no-repeat; background-size:260px 310px; height:310px;}');
                } else if (this._typePopupDlg === POPUP_DLG_TYPE.INSRC || this._typePopupDlg === POPUP_DLG_TYPE.INSRC_CAN_SKIP) {
                    //insrc dlg
                    img.src = Util.getH5ImgUrl('zhxbg3.png');

                    var sel = '.aqxbg2';
                    //Util.createCss('.aqxbg2{ background: url(' + img.src + ') no-repeat; background-size:290px 301px; height:301px;}');
                }
                if (Config.IS_HYBRID && Config.ENV != 'pro') {
                    //for hybrid test convenience, change image address to http and test env
                    var result = Util.getCSS(sel);
                    result && result[0] && result[0].style && (result[0].style.backgroundImage = 'url(' + img.src + ')');
                }

                setTimeout(function() {
                    if (isShowLoading) {
                        img.onerror.call(that);
                    }
                }, 8000);
            },
            _showPopupDlgOnImgReady: function(isBtnClick) {
                var isRnDlg = this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_NOT_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_CAN_SKIP;

                var that = this;
                this.mask = this.getCstMsg();
                if (!isBtnClick) {
                    //remove wlt-cm-up-in because somehow popup dlg is not clear after animation
                    this.mask.setCbOnShow(function() {
                        setTimeout(function() {
                            that.mask.setCbOnShow(undefined);
                            $('.J_DivRn').removeClass('wlt-cm-up-in');
                        }, 2000);
                    });
                }
                var isSingleBtn;

                if (isRnDlg) {
                    // var target = '' +
                    //     '<div class="cui-view {1} J_DivRn" id="Div1" style="margin-left: 20px; z-index: 3007; visibility: visible;">' +
                    //     '<div class="rztips cblack">' +
                    //     '<div class="closerz J_SelX"></div>' +
                    //     '<div class="rz_title {2}">{3}</div>' +
                    //     '<div class="font13 p10_15">{4}</div>' +
                    //     '<div class="gorenzhen J_SelGo"></div>' +
                    //     '</div>' +
                    //     '</div>';

                    //realname dlg
                    var target = '' +
                        '<div class="cui-view pop_box {1} J_DivRn" id="Div1" style="width:260px;margin-left: -130px; z-index: 3007; visibility: visible;">' +
                        '<div class="authentication">' +
                        '<div class="nav {2}">{3}</div>' +
                        '<div class="info">{4}</div>' +
                        '<div class="btn J_SelGo {5}">立即去认证</div>' +
                        '<div class="close J_SelX {6}"></div>' +
                        '<div class="quqiang J_SelGo {7}">立即去认证</div>' +
                        '<div class="cancel J_SelZb {8}">暂不</div>' +
                        '</div>' +
                        '</div>';

                    isSingleBtn = this._typePopupDlg !== POPUP_DLG_TYPE.RN_CAN_SKIP;
                    this.mask.showMessage(Util.formatStr(target,
                            isBtnClick ? ' ' : ' wlt-cm-up-in ',
                            this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE ? ' red' : 'cblack',
                            this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE ? '账户实名认证后才可操作资金' : '为了资金安全，请账户实名认证',
                            this._txtRnDlg,
                            isSingleBtn ? '' : 'hidden',
                            isSingleBtn ? '' : 'hidden',
                            isSingleBtn ? 'hidden' : '',
                            isSingleBtn ? 'hidden' : ''),
                        false,
                        function(e) {
                            //console.log($(e.target).attr('class'));
                        });
                } else {
                    // var target = '' +
                    //     '<div class="cui-view {1} J_DivRn" id="Div1" style=" width:290px;margin-left: 5px; z-index: 3007; visibility: visible;">' +
                    //     '<div class="aqxbg2">' +
                    //     '<div class="closerz J_SelX"></div>' +
                    //     '<div class="quqiang J_SelGo"></div>' +
                    //     '</div>' +
                    //     '</div>';

                    //insrc dlg
                    var target = '' +
                        '<div class="cui-view pop_box {1} J_DivRn" id="Div1" style="width:290px;margin-left: -145px; z-index: 3007; visibility: visible;">' +
                        '<div class="aqxbg2">' +
                        '<div class="nav">为了资金安全 请账户实名认证</div>' +
                        '<div class="info">实名后，携程钱包中的返现和现金余额只能转出至该实名信息的储蓄卡，有效防止他人盗取。</div>' +
                        '<div class="btn J_SelGo {2}">立即去认证</div>' +
                        '<div class="close J_SelX {3}"></div>' +
                        '<div class="quqiang J_SelGo {4}">立即去认证</div>' +
                        '<div class="cancel J_SelZb {5}">暂不</div>' +
                        '</div>' +
                        '</div>';

                    isSingleBtn = this._typePopupDlg !== POPUP_DLG_TYPE.INSRC_CAN_SKIP;
                    this.mask.showMessage(Util.formatStr(target,
                            isBtnClick ? ' ' : ' wlt-cm-up-in ',
                            isSingleBtn ? '' : 'hidden',
                            isSingleBtn ? '' : 'hidden',
                            isSingleBtn ? 'hidden' : '',
                            isSingleBtn ? 'hidden' : ''),
                        false,
                        function(e) {
                            //console.log($(e.target).attr('class'));
                        });
                }

                if (!isBtnClick) {
                    this.bIgnoreBackKey = true; //require: in hybrid, when alert comes off firstly, disable backkey
                }

                if (!isSingleBtn) {
                    $('.J_SelZb').on('click', _.bind(function(e) {
                        this.mask.close();
                        this._cbWhenImgFail.call(this);
                    }, this));
                }

                $('.J_SelX, .J_MlBm').on('click', _.bind(function(e) {
                    var that = this;

                    if (!isSingleBtn && $(e.currentTarget).hasClass('J_MlBm')) {
                        return; //two button case: must click ignore button, so just ignore mask click
                    }

                    if (isBtnClick) {
                        that.mask.close();
                    } else {
                        this.bIgnoreBackKey = false; //reset

                        $('.J_DivRn').removeClass('wlt-cm-up-in');
                        $('.J_DivRn').addClass('wlt-cm-down-out');

                        setTimeout(function() {
                            that.mask.close();
                            setTimeout(function() {
                                //it's page entry invoke, set animation and flags...
                                that._statePopupDlg = POPUP_DLG_STAT.SHOW_CLOSED;
                                that._showFloatRow(true);
                            }, 200);
                        }, 1000);
                    }

                    if (isRnDlg) {
                        this.sendUBT('wallet.realname', this.ubtRealNameDataHandler('cancel'));
                    }

                    return false;
                }, this));

                $('.J_SelGo').on('click', _.bind(function(e) {
                    if (!isRnDlg || this.model.flagInsrcActOn) {
                        this.forward('insrcactivity');
                    } else {
                        formPageStore.setAttr('rmFromPage', 'index');
                        this.forward('accountverified');
                    }
                    this.mask.close();
                    this._statePopupDlg = POPUP_DLG_STAT.SHOW_CLOSED;
                    this._showFloatRow();

                    if (isSingleBtn && isRnDlg) {
                        this.sendUBT('wallet.realname', this.ubtRealNameDataHandler('ok'));
                    }

                    return false;
                }, this));

                if (this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_NOT_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.INSRC) {
                    this._clearUserinfoNotice();
                }
            },
            _clearUserinfoNotice: function() {
                var clrModel = WalletModel.UserInfoClearNotice.getInstance();
                if (this._typePopupDlg === POPUP_DLG_TYPE.RN_FORCE || this._typePopupDlg === POPUP_DLG_TYPE.RN_NOT_FORCE) {
                    clrModel.param.noticetype = '1';
                } else if (this._typePopupDlg === POPUP_DLG_TYPE.INSRC) {
                    clrModel.param.noticetype = '2';
                }

                clrModel.exec({
                    suc: function() {},
                    fail: function() {},
                    scope: this
                });
            },
            _realNameQueryTextExec: function(optype, cbSuc, cbFail) {
                var queryTxtModel = WalletModel.WalletPublicQueryText.getInstance();
                queryTxtModel.param.reqtype = optype;
                this.loading.show();
                queryTxtModel.exec({
                    suc: function(data) {
                        this.loading.hide();
                        if (data.rc == 0) {
                            if (optype == 11) {
                                this.TxtRnMust = data.text;
                            } else if (optype == 13) {
                                this.TxtRnOptional = data.text;
                            }
                            this._txtRnDlg = data.text;
                            cbSuc && cbSuc(data.text);
                        }
                    },
                    fail: function(data) {
                        //this.onModelExecFailAsync(data, 330);
                        this.loading.hide();
                        cbFail && cbFail();
                    },
                    scope: this
                });
            },
            //6.8 new functions bellow...
            _createAdRow: function() {
                //6.10: wait till popup dlg dismissed
                if (!CacheData.getAdRowHeight() && this._statePopupDlg === POPUP_DLG_STAT.WILL_SHOW) {
                    var total = 0;
                    this.timerSrc = setInterval($.proxy(function() {
                        if (this._statePopupDlg != POPUP_DLG_STAT.WILL_SHOW || total > 30000) {
                            clearInterval(this.timerSrc);
                            this._bAdAnimate = true;
                            this._renderAdRow();
                        } else {
                            total += 500;
                        }
                    }, this), 500);
                } else {
                    this._renderAdRow();
                }
            },
            _renderAdRow: function() {
                //6.10 add
                if (this.adPlugIn) {
                    this.adPlugIn.adjAdHeight(); //sometimes ad row not shown, set the height will show it
                    return; //in case re-entry
                }

                if (!this._bAdAnimate) {
                    this._setAdRowHeight(); //set ht asap
                }

                this.adPlugIn = new AdPlugin({
                    selector: '.J_Bill',
                    tpl: '<div class="mt15 J_Bill" style="height:0px"></div>',
                    view: this,
                    ver: Config.CVER_HEAD_Hybrid,
                    animate: this._bAdAnimate
                });
                this.adPlugIn.render();
            },
            _setAdRowHeight: function() {
                var ht = CacheData.getAdRowHeight();
                if (ht) {
                    this.els.bill.css({
                        height: ht
                    }); //show ad row if last ad request success
                }
            },
            //6.10 new api...
            onMyInsrcClick: function() {
                this.forward('myinsrc');
            },
            //6.11 new api...
            onSvcClick: function() {
                var url = 'http://m.ctrip.com/webapp/LivechatH5/chat?groupcode=CustomerService&version=2.0&origin=2&exinfo=appqb';
                if (!Config.IS_INAPP) {
                    this.jump(url);
                } else {
                    cGuiderService.jump({
                        targetModel: 'h5',
                        url: url //title: document.title
                    });
                }
            }
        });
        return View;
    });