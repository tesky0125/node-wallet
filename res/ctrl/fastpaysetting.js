/**
* @author wwg
* @desc:  Wallet V6.2
*/

define(['WalletPageView', 'WalletModel', 'WalletStore', 'Util', 'text!fastpaysetting_html', 'Message', 'Config', 'cGuiderService', 'PayVerify', 'FingerHelper','CacheData', 'Scmg'],
function (WalletPageView, WalletModel, WalletStore, Util, html, Message, Config, cGuiderService, PayVerify, FingerHelper,CacheData, Scmg) {
    var STRING = {
        FAST_PAY_SETTING_TITLE: '快捷支付设置',
        DEFAULT_CREDIT_CARD_TITLE: '设置默认信用卡',
        FAST_PAY_SETTING_EXIT_TIP: '确认退出快捷支付设置？',
        FAST_PAY_SETTING_SAVE_TIP: '保存当前更改的默认付款方式？',
        SAVE_NO: '暂不',
        SAVE_YES: '保存',
        COMPLETE: '完成',
        CANCEL: '取消',
        GO_SETTING: '去设置',
        EXIT: '退出',
        WALLET_EXPLAIN: '• 优先使用“携程钱包”付款时，我们将优先使用您的礼品卡和现金余额抵扣订单金额</Br>' +
                        '• 您同时拥有礼品卡和现金余额时，我们将根据以下优先顺序进行抵扣：任我住、任我游、任我行、现金余额</Br>' +
                        '• 同类型礼品卡，我们会优先使用即将到期的进行抵扣</Br>' +
                        '• 订单如不支持礼品卡或现金余额，相应的礼品卡或现金余额无法进行抵扣'
    };

    var bankCardModel = WalletModel.WalletBindedCreditCardListSearch.getInstance();
    var setDefaultModel = WalletModel.CreditCardSetDefault.getInstance();
    var checkBinModel = WalletModel.CheckBin.getInstance();

    var fastPayStore = WalletStore.FastPayStore.getInstance();
    var cardBinStore = WalletStore.CardBinStore.getInstance();

    var MODE = {
        CREDIT_CARD_SELECT: 0, //默认信用卡选择页面
        CREDIT_CARD_SETTING: 1//信用卡优先级设置页面
    };

    var SOURCE = {
        WALLET: '1',      //1：钱包
        PAY_NATIVE: '11', //11：支付Native
        PAY_HYBRID: '12', //12：支付Hybrid
        PAY_H5: '13'      //13：支付H5
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.FAST_PAY_SETTING_TITLE,
        backBtn: true,
        headerBtn: { title: STRING.COMPLETE, id: 'J_Complete', classname: 'explain' },
        model: {},
        mode: MODE.CREDIT_CARD_SETTING,
        source: '',
        //页面状态 Native.
        status: {
            active: 1, //是否使用钱包 1优先；2非优先
            bindID: '' // 默认信用卡 协议绑定信息ID
        },
        events: {
            'click .J_AddCard': '_checkPaypsdAndAddCard',
            'click .J_Card': '_onCardClick',
            'click .J_DefectCard': '_onDefectCardClick',
            'click .J_Active': function () { this._onActiveClick(1); },
            'click .J_Inactive': function () { this._onActiveClick(2); },
            'click .J_Explain': function () { this.getCstMsg().showMessage(STRING.WALLET_EXPLAIN); }
        },
        commitHandler: {
            id: 'J_Complete',
            callback: function () { this._complete(); }
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            var _path = this.getQuery('path');
            if (_path && _path == 'defaultcredit') {

                this.mode = MODE.CREDIT_CARD_SELECT;
                this.title = STRING.DEFAULT_CREDIT_CARD_TITLE;

                this.headerBtn = null;
            }

            this.inherited(arguments);

            this.model.renderType = this.mode;

            var _source = this.getQuery('source');
            this.source = '';
            switch (_source) {
                case SOURCE.WALLET:
                    this.source = SOURCE.WALLET;
                    break;
                case SOURCE.PAY_NATIVE:
                    this.source = SOURCE.PAY_NATIVE;
                    break;
                case SOURCE.PAY_HYBRID:
                    this.source = SOURCE.PAY_HYBRID;
                    break;
                case SOURCE.PAY_H5:
                    this.source = SOURCE.PAY_H5;
                    break;
            }

            if (this.mode == MODE.CREDIT_CARD_SETTING) {

                if (!Util.isEmpty(_source)) {
                    fastPayStore.remove();
                    fastPayStore.setAttr('source', this.source);

                    if (this.source == SOURCE.WALLET) {
                        var _param = { 'PayChannel': 'ProtocolBind' }; //钱包

                        fastPayStore.setAttr('scenparam', JSON.stringify(_param));

                        this.paymchid = Config.PAYMCHIDS.FASTPAY;
                    } else if (this.source == SOURCE.PAY_NATIVE) {
                        var _param = { 'GatheringType': 'D',
                            'PayChannel': 'ProtocolPay'
                        }; //支付

                        fastPayStore.setAttr('scenparam', JSON.stringify(_param));

                        var _bustype = this.getQuery('bustype');
                        console.log('fastpaysetting-paymchid:'+_bustype);
                        fastPayStore.setAttr('bustype', _bustype);

                        this.paymchid = _bustype;
                    }
                } else {
                    //非入口来源
                    this.source = fastPayStore.getAttr('source');

                    this.paymchid = fastPayStore.getAttr('bustype');
                    console.log('fastpaysetting-paymchid:'+this.paymchid);
                    if(!this.paymchid){
                        this.paymchid = Config.PAYMCHIDS.FASTPAY;
                    }
                }

                fastPayStore.setAttr('from', 'independentset'); //独立设置

            } else {
                fastPayStore.setAttr('from', 'payingset'); //支付中设置

                this.source = fastPayStore.getAttr('source');
                this.paymchid = fastPayStore.getAttr('bustype');
                console.log('fastpaysetting-paymchid:'+this.paymchid);
            }

            if (Util.isEmpty(this.source)) {
                this.back('index');
                return;
            }

            this.isLoadFinish = false;
            this._initialValue();
            this._getCreditCardList();

        },
        _initialValue: function () {
            this.status.active = 1;
            this.status.bindID = '';
        },
        render: function () {

            this.$el.html(_.template(html, this.model));

            if (this.mode == MODE.CREDIT_CARD_SETTING) {
                this.$active = this.$el.find(".J_Active");
                this.$inactive = this.$el.find(".J_Inactive");
            }
        },
        _getCreditCardList: function () {
            this.loading.show();

            bankCardModel.param = {};
            var _scenparam = fastPayStore.getAttr('scenparam');
            bankCardModel.param.reqtype = 4;
            bankCardModel.param.paymchid = this.paymchid;
            bankCardModel.param.scenparam = _scenparam;
            bankCardModel.param.authstatus = 0;
            bankCardModel.exec({
                scope: this,
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data);
                    if (data.rc == 0) {
                        this.isLoadFinish = true;
                        if (this.mode == MODE.CREDIT_CARD_SETTING) {
                            data = this._setDefaultCard(data);
                            this._initPageData(data);
                        }
                        this.model = Util.mix(this.model, data);
                        this.render();
                    }
                },
                fail: function (data) {
                    this.onModelExecFail(data);
                }
            })

        },
        _setDefaultCard: function (data) {
            var _defaultCardBindID = fastPayStore.getAttr('defaultcardbindid');
            if (!Util.isEmpty(_defaultCardBindID)) {//有绑过卡后回来将新卡置为默认的.

                var _defaultItem;
                for (var item in data.fastPayCard) {
                    data.fastPayCard[item].bindstatus = 42; //42：快捷支付卡
                    if (data.fastPayCard[item].bindid == _defaultCardBindID) {
                        data.fastPayCard[item].bindstatus = 43;
                        _defaultItem = item;
                    }
                }
                if (!Util.isEmpty(_defaultItem)) {
                    var _temp = data.fastPayCard[0];
                    data.fastPayCard[0] = data.fastPayCard[_defaultItem];
                    data.fastPayCard[_defaultItem] = _temp;
                }
            }
            return data;
        },
        _initPageData: function (data) {
            if (data.first == 0 || data.first == 1) {
                this.status.active = 1;
            } else {
                this.status.active = 2; //未优先使用.
            }

            for (var item in data.fastPayCard) {
                if (data.fastPayCard[item].bindstatus == 43) {//默认快捷支付卡.
                    this.status.bindID = data.fastPayCard[item].bindid;
                    break;
                }
            }

            var _orginal = fastPayStore.getAttr('orginal');
            if (!_orginal) {
                fastPayStore.setAttr('orginal', 1);
                fastPayStore.setAttr('statusactive', this.status.active);
                fastPayStore.setAttr('statusbindID', this.status.bindID);
            }

        },
        _onActiveClick: function (active) {
            if (this.status.active == active) {
                return;
            }

            this.status.active = active;
            if (this.status.active == 1) {
                this.$active.addClass('yes');
                this.$inactive.removeClass('yes');
            } else if (this.status.active == 2) {
                this.$active.removeClass('yes');
                this.$inactive.addClass('yes');
            }
        },
        _checkPaypsdAndAddCard:function() {
            var that = this;
            var haspwd = CacheData.getIsHasPwd();
            if (!haspwd && haspwd === undefined) {
                var userInfoModel = WalletModel.WalletUserInfoSearch.getInstance();
                userInfoModel.param.reqbmp = 2;
                this.loading.show();
                userInfoModel.exec({
                    suc: function (info) {
                        that.loading.hide();
                        if (info.rc == 0 && info.haspwd == 1) {
                            CacheData.setIsHasPwd(true);
                            that._addCard.call(that);
                        }else{
                            this.showDlg({
                                message: Message.get(121),
                                buttons: [{
                                    text: STRING.CANCEL,
                                    click: function () {
                                        this.hide();
                                    }
                                }, {
                                    text: STRING.GO_SETTING,
                                    click: function () {
                                        this.hide();
                                        that.forwardWithRetView('setpaypsd2', 'fastpaysetting');
                                    }
                                }]
                            });
                        }
                    },
                    fail: this.onModelExecFail,
                    scope: this
                });
            }else{
                this._addCard();
            }
        },
        _addCard: function () {
            var _requestID = fastPayStore.getAttr('requestid');

            if (this.mode == MODE.CREDIT_CARD_SELECT) {
                fastPayStore.setAttr('isnew', 1); //新增卡

                this.forward('addcard?path=fastpay');
            } else if (this.mode == MODE.CREDIT_CARD_SETTING) {
                PayVerify.exec(this, {
                    success: function (data) {

                        // fastPayStore.setAttr('verifytype', data.verifytype);
                        // if (data.verifytype == 1) {
                        //     ///fastPayStore.setAttr('pwd', data.pwd);
                        //     Scmg.setP(data.pwd);
                        // } else {
                        //     fastPayStore.setAttr('requestid', data.requestid);
                        //     ///fastPayStore.setAttr('paytoken', data.paytoken);
                        //     Scmg.setT(data.paytoken);
                        //     fastPayStore.setAttr('keyguid', data.keyguid);
                        //     fastPayStore.setAttr('devguid', data.devguid);
                        // }

                        fastPayStore.setAttr('requestid', data.requestid);
                        fastPayStore.setAttr('isnew', 1); //新增卡

                        this.forward('addcard?path=fastpay');
                    },
                    failure: function () {

                    },
                    cancel: function () {

                    }
                }, _requestID ? _requestID : '');
            }

        },
        _onCardClick: function (e) {
            var $item = $(e.currentTarget);

            var _id = $item.attr('data-cardid');
            var _item = _.findWhere(this.model.fastPayCard, { bindid: _id });

            if (this.mode == MODE.CREDIT_CARD_SELECT) {

                fastPayStore.removeAttr('isnew');
                fastPayStore.setAttr('cardinfo', _item);
                this.forward('fastpayconfirm');
            } else if (this.mode == MODE.CREDIT_CARD_SETTING) {

                this.$el.find('.J_Card').removeClass('cardselect');
                $item.addClass('cardselect');

                this.status.bindID = _item.bindid;
            }
        },
        _onDefectCardClick: function (e) {
            var _id = $(e.currentTarget).attr('data-cardid');


            var _item = _.findWhere(this.model.fastPayDefectCard, { cardid: _id });

            if (this.mode == MODE.CREDIT_CARD_SELECT) {
                this._checkBinDefectCard(_item);
            } else if (this.mode == MODE.CREDIT_CARD_SETTING) {
                var _requestID = fastPayStore.getAttr('requestid');

                PayVerify.exec(this, {
                    success: function (data) {

                        // fastPayStore.setAttr('verifytype', data.verifytype);
                        // if (data.verifytype == 1) {
                        //     ///fastPayStore.setAttr('pwd', data.pwd);
                        //     Scmg.setP(data.pwd);
                        // } else {
                        //     fastPayStore.setAttr('requestid', data.requestid);
                        //     ///fastPayStore.setAttr('paytoken', data.paytoken);
                        //     Scmg.setT(data.paytoken);
                        //     fastPayStore.setAttr('keyguid', data.keyguid);
                        //     fastPayStore.setAttr('devguid', data.devguid);
                        // }

                        fastPayStore.setAttr('requestid', data.requestid);
                        this._checkBinDefectCard(_item);
                    },
                    failure: function () {

                    },
                    cancel: function () {

                    }
                }, _requestID ? _requestID : '');
            }

        },
        _checkBinDefectCard: function (item) {
            this.loading.show();
            checkBinModel.param = {};
            checkBinModel.param.chktype = 4; //快捷支付卡
            checkBinModel.param.paymchid = this.paymchid;//TODO
            checkBinModel.param.cardid = item.cardid; // 卡信息数据库主键
            var _scenparam = fastPayStore.getAttr('scenparam');
            checkBinModel.param.scenparam = _scenparam;

            checkBinModel.param.sesid = Util.createGuid(); // create sessionid to service.

            checkBinModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {
                        if (data.creditCard.length == 0 && data.unionCreditCard.length == 0) {
                            this.showToast(Message.get(370)); //仅支持信用卡
                            return;
                        }

                        fastPayStore.setAttr('isnew', 2); //补充卡
                        fastPayStore.setAttr('infoid', item.infoid);
                        cardBinStore.setAttr('cardno', item.cardno);


                        this.forward('fastpaycard');
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            })
        },
        _complete: function () {
            if (!this.isLoadFinish) {
                return;
            }

            this.tryHideMaskLayers();

            this.loading.show();
            setDefaultModel.param = {};

            setDefaultModel.param.first = this.status.active;
            setDefaultModel.param.bindid = this.status.bindID == '' ? '0' : this.status.bindID; //协议绑定卡ID
            setDefaultModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {

                        this._success();
                    } else {
                        this.showToast(Message.get(365));
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            });

        },
        _success: function () {
            var _that = this;
            switch (this.source) {
                case SOURCE.WALLET:
                    this.showToast(Message.get(364), function () {
                        _that.back('index');
                    });
                    break;
                case SOURCE.PAY_NATIVE:

                    if (Config.IS_INAPP) {//
                        this._backToNative();
                        this.showToast(Message.get(364), function () {
                            cGuiderService.backToLastPage();
                        });
                    } else {
                        _that.jump(Config.H5_MAIN_HOME_URL); //test.
                    }
                    break;
                case SOURCE.PAY_HYBRID:
                    break;
                case SOURCE.PAY_H5:
                    break;
            }
        },
        _priorityChanged: function () {
            var _orginal = fastPayStore.getAttr('orginal');

            var _active = fastPayStore.getAttr('statusactive');
            var _bindID = fastPayStore.getAttr('statusbindID');

            if (this.status.active != _active) {
                return true;
            }

            if (this.status.bindID != _bindID) {
                return true;
            }

            return false;
        },
        _settingChanged: function () {
            if (!this.isLoadFinish) {
                return false;
            }

            var _priorityChanged = this._priorityChanged();
            if (_priorityChanged) {
                return true;
            }

            var _bindCard = fastPayStore.getAttr('statusbindcard');

            if (_bindCard && _bindCard == 1) {
                return true;
            }

            return false;
        },
        returnHandler: function () {
            var _that = this;
            if (this.mode == MODE.CREDIT_CARD_SELECT) {
                this.showDlg({
                    message: STRING.FAST_PAY_SETTING_EXIT_TIP,
                    buttons: [{
                        text: STRING.CANCEL,
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: STRING.EXIT,
                        click: function () {
                            this.hide();
                            switch (_that.source) {
                                case SOURCE.WALLET:
                                    break;
                                case SOURCE.PAY_NATIVE:
                                    //if (Config.IS_INAPP) {//
                                    //    cGuiderService.backToLastPage();
                                    //} else {
                                    //    _that.jump(Config.H5_MAIN_HOME_URL); //test.
                                    //}
                                    //break;
                                    _that.exitWalletModule();
                                case SOURCE.PAY_HYBRID:
                                    break;
                                case SOURCE.PAY_H5:
                                    break;
                            }
                        }
                    }]
                });
            } else {
                var _settingChanged = this._settingChanged();
                if (_settingChanged) {
                    this._showSaveAlert();
                } else {
                    switch (this.source) {
                        case SOURCE.WALLET:
                            _that.back('index');
                            break;
                        case SOURCE.PAY_NATIVE:
                            if (Config.IS_INAPP) {//
                                this._backToNative();
                                cGuiderService.backToLastPage();
                            } else {
                                _that.jump(Config.H5_MAIN_HOME_URL); //test.
                            }
                            break;
                        case SOURCE.PAY_HYBRID:
                            break;
                        case SOURCE.PAY_H5:
                            break;
                    }
                }
            }

        },
        _showSaveAlert: function () {
            var _that = this;
            this.showDlg({
                message: STRING.FAST_PAY_SETTING_SAVE_TIP,
                buttons: [{
                    text: STRING.SAVE_NO,
                    click: function () {
                        this.hide();
                        switch (_that.source) {
                            case SOURCE.WALLET:
                                _that.back('index');
                                break;
                            case SOURCE.PAY_NATIVE:
                                if (Config.IS_INAPP) {//
                                    _that._backToNative();
                                    cGuiderService.backToLastPage();
                                } else {
                                    _that.jump(Config.H5_MAIN_HOME_URL); //test.
                                }
                                break;
                            case SOURCE.PAY_HYBRID:
                                break;
                            case SOURCE.PAY_H5:
                                break;
                        }
                    }
                }, {
                    text: STRING.SAVE_YES,
                    click: function () {
                        this.hide();
                        _that._complete();
                    }
                }]
            });
        },
        _backToNative: function () {
            var _change = this._settingChanged() ? 0 : 1;
            //回调native.
            FingerHelper.callPayMethod(
                    function (rc) { },
                        { scene: 1, //0：绑卡操作 1: 设置操作
                            verifytype: 0, //0: 无验证 1：支付密码验证 2：指纹验证
                            status: _change //0：进行了设置有更新；1：没有进行设置
                        });
        }



    });

    return View;

});

