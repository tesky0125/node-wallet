/**
* @author wwg
* @desc:  Wallet V6.2
*/

define(['WalletPageView', 'WalletModel', 'WalletStore', 'Util', 'text!fastpay_html', 'Config', 'cGuiderService', 'PayVerify', 'Scmg'],
function (WalletPageView, WalletModel, WalletStore, Util, html, Config, cGuiderService, PayVerify, Scmg) {
    var STRING = {
        FAST_PAY_TITLE: '快捷支付',
        PAST_PAY_SETTING_TITLE: '快捷支付设置'
    };

    var fastPayStore = WalletStore.FastPayStore.getInstance();

    var SOURCE = {
        WALLET: '1',      //1：钱包
        PAY_NATIVE: '11', //11：支付Native
        PAY_HYBRID: '12', //12：支付Hybrid
        PAY_H5: '13'      //13：支付H5
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.FAST_PAY_TITLE,
        backBtn: true,
        guide: false,
        events: {
            'click .J_GoSet': '_goFastPaySetting'
        },
        onCreate: function () {
            this.inherited(arguments);

        },
        onShow: function () {
            var _path = this.getQuery('path');
            if (_path && _path == 'guide') {

                this.guide = true;
                this.title = STRING.PAST_PAY_SETTING_TITLE;
            }


            this.inherited(arguments);

            if (!this.guide) {
                var _source = this.getQuery('source');

                if (!Util.isEmpty(_source)) {
                    fastPayStore.remove();

                    var _requestID = this.getQuery('requestid');
                    var _bustype = this.getQuery('bustype');
                    console.log('fastpay-paymchid:'+_bustype);

                    //存储 外部url参数,后续使用.
                    fastPayStore.setAttr('source', _source);
                    fastPayStore.setAttr('requestid', _requestID);
                    fastPayStore.setAttr('bustype', _bustype);

                    this.source = _source;
                } else {
                    this.source = fastPayStore.getAttr('source');
                }

                if (this.source == SOURCE.PAY_NATIVE) {
                    var _param = { 'GatheringType': 'D',
                        'PayChannel': 'ProtocolPay'
                    }; //支付

                    fastPayStore.setAttr('scenparam', JSON.stringify(_param));
                }

                if (Util.isEmpty(this.source)) {
                    if (Config.IS_INAPP) {//
                        cGuiderService.backToLastPage();
                    } else {
                        this.jump(Config.H5_MAIN_HOME_URL);
                    }
                    return;
                }
            }

            this.render();
            this._setBackground();
            this.turning();

            if (!this.guide) {
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
                        //     //Scmg.setT(data.paytoken);
                        //     fastPayStore.setAttr('keyguid', data.keyguid);
                        //     fastPayStore.setAttr('devguid', data.devguid);
                        // }

                        fastPayStore.setAttr('requestid', data.requestid);
                        this.forward('fastpaysetting?path=defaultcredit');
                    },
                    failure: function () {

                    },
                    cancel: function () {
                        switch (this.source) {
                            case SOURCE.WALLET:
                                break;
                            case SOURCE.PAY_NATIVE:
                                //if (Config.IS_INAPP) {//
                                //    cGuiderService.backToLastPage();
                                //} else {
                                //    this.jump(Config.H5_MAIN_HOME_URL); //test.
                                //}
                                //break;
                                this.exitWalletModule();
                            case SOURCE.PAY_HYBRID:
                                break;
                            case SOURCE.PAY_H5:
                                break;
                        }
                    },
                    showAlert: function (type) {
                        this.bIgnoreBackKey = true;
                    }
                }, _requestID ? _requestID : '');
            }
        },
        _setBackground: function () {
            $('body').addClass('bgc3');
        },
        onHide: function () {
            this.inherited(arguments);
            $('body').removeClass('bgc3');
        },
        render: function () {
            var _model = {};
            _model.guide = this.guide;
            this.$el.html(_.template(html, _model));
        },
        _goFastPaySetting: function () {
            this.forward('fastpaysetting?source=1'); //1：钱包
        },
        returnHandler: function () {
            if (!this.guide) {
                switch (this.source) {
                    case SOURCE.WALLET:
                        break;
                    case SOURCE.PAY_NATIVE:
                        if (Config.IS_INAPP) {//
                            cGuiderService.backToLastPage();
                        } else {
                            this.jump(Config.H5_MAIN_HOME_URL); //test.
                        }
                        break;
                    case SOURCE.PAY_HYBRID:
                        break;
                    case SOURCE.PAY_H5:
                        break;
                }
            } else {
                this.inherited(arguments);
            }

        }
    });

    return View;

});

