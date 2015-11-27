/**
* @author wwg
* @desc:  Wallet V6.2
*/

define(['WalletPageView', 'WalletModel', 'WalletStore', 'Util', 'text!fastpayconfirm_html', 'Config', 'cGuiderService', 'Message', 'FingerHelper', 'Scmg'],
function (WalletPageView, WalletModel, WalletStore, Util, html, Config, cGuiderService, Message, FingerHelper, Scmg) {
    var STRING = {
        PAGE_TITLE: '设置确认',
        FAST_PAY_SETTING_EXIT_TIP: '确认退出快捷支付设置？',
        CANCEL: '取消',
        EXIT: '退出',
        WALLET_EXPLAIN: '• 优先使用“携程钱包”付款时，我们将优先使用您的礼品卡和现金余额抵扣订单金额</Br>' +
                        '• 您同时拥有礼品卡和现金余额时，我们将根据以下优先顺序进行抵扣：任我住、任我游、任我行、现金余额</Br>' +
                        '• 同类型礼品卡，我们会优先使用即将到期的进行抵扣</Br>' +
                        '• 订单如不支持礼品卡或现金余额，相应的礼品卡或现金余额无法进行抵扣'
    };


    var setDefaultModel = WalletModel.CreditCardSetDefault.getInstance();
    var bankCardModel = WalletModel.WalletBindedCreditCardListSearch.getInstance();


    var fastPayStore = WalletStore.FastPayStore.getInstance();
    var cardBinStore = WalletStore.CardBinStore.getInstance();

    var SOURCE = {
        WALLET: '1',      //1：钱包
        PAY_NATIVE: '11', //11：支付Native
        PAY_HYBRID: '12', //12：支付Hybrid
        PAY_H5: '13'      //13：支付H5
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        guide: false,
        model: {},
        active: 1, //默认钱包优先级已设置
        paymchid:Config.PAYMCHIDS.FASTPAY,//TODO payingset
        events: {
            'click .J_Complete': '_complete',
            'click .J_Active': function () { this._onActiveClick(1); },
            'click .J_Inactive': function () { this._onActiveClick(2); },
            'click .J_Explain': function () { this.getCstMsg().showMessage(STRING.WALLET_EXPLAIN); }
        },
        onCreate: function () {
            this.inherited(arguments);

        },
        onShow: function () {


            this.inherited(arguments);

            var _source = fastPayStore.getAttr('source');
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

            if (Util.isEmpty(this.source)) {
                if (Config.IS_INAPP) {//
                    cGuiderService.backToLastPage();
                } else {
                    this.jump(Config.H5_MAIN_HOME_URL);
                }
                return;
            }

            var _isNew = fastPayStore.getAttr('isnew');
            if (_isNew && (_isNew == 1 || _isNew == 2)) {
                var _cardInfo = cardBinStore.get();

                var _creditCard = _.union(_cardInfo.creditCard, _cardInfo.unionCreditCard);

                this.model = _creditCard[0];

                if (_isNew == 1) {
                    var _cardNo = cardBinStore.getBase64('cardno');

                    this.model.cardno = Util.formatCardCode(_cardNo);
                } else {//补填卡
                    this.model.cardno = cardBinStore.getAttr('cardno');
                }

                this.model.bindid = fastPayStore.getAttr('bindid');
            } else {
                this.model = fastPayStore.getAttr('cardinfo');
            }

            this._getCreditCardList();
        },
        getPaymchid:function(){
            var _fastPayStore = WalletStore.FastPayStore.getInstance();
            var _paymchid = _fastPayStore.getAttr('bustype');
            console.log('fastpayconfirm-paymchid:'+_paymchid);
            return _paymchid || this.paymchid;
        },
        _getCreditCardList: function () {
            this.loading.show();

            bankCardModel.param = {};
            var _param = { 'PayChannel': 'ProtocolBind' };
            bankCardModel.param.reqtype = 4;
            bankCardModel.param.paymchid = this.getPaymchid();
            bankCardModel.param.scenparam = JSON.stringify(_param);
            bankCardModel.param.authstatus = 0;
            bankCardModel.exec({
                scope: this,
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data);
                    if (data.rc == 0) {
                        this.model.first = data.first;
                        if (data.first == 0 || data.first == 1) {
                            this.active = 1;
                        } else {
                            this.active = 2; //未优先使用.
                        }
                        this.render();
                        this.turning();
                    }
                },
                fail: function (data) {
                    this.onModelExecFail(data);
                }
            })

        },
        render: function () {
            this.$el.html(_.template(html, this.model));

            this.$active = this.$el.find(".J_Active");
            this.$inactive = this.$el.find(".J_Inactive");
        },

        _onActiveClick: function (active) {
            if (this.active == active) {
                return;
            }

            this.active = active;
            if (this.active == 1) {
                this.$active.addClass('yes');
                this.$inactive.removeClass('yes');
            } else if (this.active == 2) {
                this.$active.removeClass('yes');
                this.$inactive.addClass('yes');
            }
        },
        _complete: function () {

            setDefaultModel.param = {};

            setDefaultModel.param.first = this.active;
            setDefaultModel.param.bindid = this.model.bindid;

            this.loading.show();
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
                    this.onModelExecFailAsync(data);
                },
                scope: this
            });
        },
        _success: function () {
            var _that = this;
            switch (this.source) {
                case SOURCE.WALLET:
                    break;
                case SOURCE.PAY_NATIVE:

                    if (Config.IS_INAPP) {//
                        var _params = { scene: 0, //0：绑卡操作 1: 设置操作
                            verifytype: 0, //0: 无验证 1：支付密码验证 2：指纹验证
                            pwd: '', //支付密码
                            token: '', //RSA加密后的Token
                            status: 0 //0：进行了设置有更新；1：没有进行设置
                        };

                        ///var _method = fastPayStore.getAttr('verifytype');
                        var _method = Scmg.getV();
                        if (_method == 1) {
                            _params.verifytype = 1;
                            ///_params.pwd = fastPayStore.getBase64('pwd');
                            _params.pwd = Scmg.getP64();
                        } else if (_method == 2) {
                            _params.verifytype = 2;
                            ///_params.token = fastPayStore.getAttr('paytoken');
                            _params.token = Scmg.getT();
                        }

                        //回调native.
                        FingerHelper.callPayMethod(function (rc) { }, _params);
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
        returnHandler: function () {
            var _that = this;
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
        }
    });

    return View;

});

