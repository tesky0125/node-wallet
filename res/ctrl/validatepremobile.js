/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!validatepremobile_html', 'Config', 'Util', 'Message', 'cUtilCryptBase64','CacheData'],
function (IdCodePageView, WalletModel, WalletStore, html, Config, Util, Message, cUtilCryptBase64,CacheData) {

    var STRING = {
        PAGE_TITLE: '手机验证',
        CONFIRM: '确认',
        CONFIRM_EXIT:'确认退出',
        CANCEL: '取消',
        CALL: '拨打',
        ALERT_TITLE: '拨打客服电话 10106666转8',
        PREMOBILE_TIP: '验证补充信息',
        FAST_PAY_COMPLETE_EXIT_TIP: '是否放弃补全银行卡信息？',
        BINDCARD_EXIT_TIP: '确认退出，并放弃验证银行卡？'

    };

    var BindCardBase = {
        bindcardtype:'',
        paymchid:'',
        title: STRING.PAGE_TITLE,
        preMobileTip :STRING.PREMOBILE_TIP,
        getIdCodeFailGoto:'',
        reqtype:0,
        dataStore:null,
        exittip:'',
        info: function () {//for verify code
            var card = this.dataStore.getAttr('card');
            var preMobile = this.dataStore.getBase64('preMobile');

            var _cardNoStr = card.cardno.replace(/\s+/g, '');
            var _cardNo2 = _cardNoStr.substring(_cardNoStr.length - 2);
            var _msgParam = {
                bankname: card.bankname,
                cardtype: card.cardtypeUI,
                cardno: _cardNo2
            };
            this.rsvtype = 1;
            this.msgparam = cUtilCryptBase64.Base64.encode(JSON.stringify(_msgParam));
            this.reqparam = card.bindtype;

            return {
                cardInfo: card,
                preMobile: preMobile,
                preMobileTip: this.preMobileTip
            }
        },
        getPaymchid:function(){
            return this.paymchid;
        },
        goNext: function () {
            var _that = this;
            var _saveCardModel = WalletModel.CreditCardSave.getInstance();
            var _vercode = this.$el.find('.J_Indentify').val();
            var _params = this.dataStore.getAttr('bindcardparams');
            _saveCardModel.param = {};
            _saveCardModel.param.reqtype = this.reqtype;
            _saveCardModel.param.paymchid = this.getPaymchid();
            _saveCardModel.param.bindname = _params.bindname; //实名绑定
            _saveCardModel.param.cardno = _params.cardno; // 卡号
            _saveCardModel.param.cardtype = _params.cardtype; // 前台卡种信息
            _saveCardModel.param.cardholder = _params.cardholder; // 持卡人实名
            _saveCardModel.param.idtype = _params.idtype; // 持卡人证件类型
            _saveCardModel.param.idno = _params.idno; // 持卡人证件号码
            _saveCardModel.param.mobile = _params.mobile; //预留手机号码
            _saveCardModel.param.validity = _params.validity; // 卡有效期
            _saveCardModel.param.verno = _params.verno; // 卡验证码
            _saveCardModel.param.bindtype = _params.bindtype; // 绑定类别
            _saveCardModel.param.collectionid = _params.collectionid; // 支付通道ID
            _saveCardModel.param.bindno = _params.bindno; // 绑定协议号
            _saveCardModel.param.vercode = _vercode; // 短信验证码
            _saveCardModel.param.sesid = Util.getGuid(); // add sessionid to service.

            if(this.bindcardtype === 'fastpay'){
                var _isNew = this.dataStore.getAttr('isnew');
                if (_isNew && _isNew == 2) { //补填卡
                    _saveCardModel.param.infoid = _params.infoid;
                }
            }

            this.loading.show();
            _saveCardModel.exec({
                scope: this,
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {
                        _that.saveSuccess(data);
                    }else if(data.rc==1105437){
                        _that.showDlg({
                            message: data.rmsg,
                            buttons: [{
                                text: STRING.CONFIRM,
                                click: function () {
                                    _that.back();
                                    this.hide();
                                }
                            }]
                        });
                    } else {
                        this.clearInvalidCode();
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data);
                }
            });
        },
        saveSuccess:function(data){
            //placeholder, for override
        },
        returnHandler: function () {
            var _that = this;
            if(this.bindcardtype === 'fastpay') {
                var _isNew = this.dataStore.getAttr('isnew');
                _that.exittip = (_isNew && _isNew == 1) ? STRING.BINDCARD_EXIT_TIP : STRING.FAST_PAY_COMPLETE_EXIT_TIP;
            }
            if(this.bindcardtype === 'realname'){
                _that.confirmtext = STRING.CONFIRM_EXIT;
            }else{
                _that.confirmtext = STRING.CONFIRM;
            }
            this.showDlg({
                message: _that.exittip,
                buttons: [{
                    text: STRING.CANCEL,
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: _that.confirmtext,
                    click: function () {
                        this.hide();
                        _that.clearIntervalStoreAndExit();
                    }
                }]
            });
        },
        clearIntervalStoreAndExit:function(){
            this.clearIntervalStore();
            this.exitHandler();
        },
        exitHandler:function(){
            //placeholder, for override
        }
    };

    var bindCardStore = WalletStore.BindCardStore.getInstance();
    var BindCard = _.extend({},BindCardBase,{
        bindcardtype:'bindcard',
        paymchid:Config.PAYMCHIDS.BINDCARD,
        title: STRING.PAGE_TITLE,
        preMobileTip :STRING.PREMOBILE_TIP,
        getIdCodeFailGoto: 'mybankcard',
        dataStore:bindCardStore,
        exittip:STRING.BINDCARD_EXIT_TIP,
        reqtype:2,
        saveSuccess:function(data){
            var _that = this;
            this.showToast(Message.get(366), function () {
                _that.dataStore.remove();
                _that.dataStore.setAttr('dataChanged', true);
                _that.back('mybankcard');
            });
        },
        exitHandler: function () {
            this.back('mybankcard');
        }
    });

    var fastPayStore = WalletStore.FastPayStore.getInstance();
    var FastPay = _.extend({},BindCardBase,{
        bindcardtype:'fastpay',
        paymchid:Config.PAYMCHIDS.FASTPAY,
        title: STRING.PAGE_TITLE,
        preMobileTip :STRING.PREMOBILE_TIP,
        getIdCodeFailGoto: 'fastpaysetting',
        dataStore:fastPayStore,
        exittip:STRING.BINDCARD_EXIT_TIP,
        reqtype:4,
        info: function () {
            var _cardBinStore = WalletStore.CardBinStore.getInstance();
            var _card = _cardBinStore.get();

            var _creditCard = _.union(_card.creditCard, _card.unionCreditCard);
            _cardInfo = _creditCard[0];

            var _isNew = fastPayStore.getAttr('isnew');

            var _cardNoOrginal;
            if (_isNew && _isNew == 1) {
                _cardNoOrginal = _cardBinStore.getBase64('cardno');
                _cardInfo.cardno = Util.formatCardCode(_cardNoOrginal);
            } else {//补填卡
                _cardNoOrginal = _cardBinStore.getAttr('cardno');
                _cardInfo.cardno = _cardBinStore.getAttr('cardno');
            }

            var _preMobile = fastPayStore.getBase64('preMobile');
            var _cardNo2 = _cardInfo.cardno.substring(_cardInfo.cardno.length - 2);
            var _msgParam = {
                bankname: _cardInfo.bankname,
                cardtype: _cardInfo.cardtypeUI,
                cardno: _cardNo2
            };

            var _params = fastPayStore.getAttr('bindcardparams');

            this.rsvtype = 1; //1：手机
            this.msgparam = cUtilCryptBase64.Base64.encode(JSON.stringify(_msgParam));
            this.reqparam = _params.bindtype;

            var _from = fastPayStore.getAttr('from');
            if (_from == 'independentset') {
                this.getIdCodeFailGoto = 'fastpaysetting';
            } else if (_from == 'payingset') {
                this.getIdCodeFailGoto = 'fastpaysetting?path=defaultcredit';
            }

            var _params = fastPayStore.getAttr('bindcardparams');
            this.rsvparam = _params.infoid;

            if (_preMobile.indexOf("*") != -1) {
                this.bVerifyMobile = false;
            }

            return {
                cardInfo: _cardInfo,
                preMobile: _preMobile,
                preMobileTip: this.preMobileTip
            };
        },
        getPaymchid:function(){
            var _fastPayStore = WalletStore.FastPayStore.getInstance();
            var _paymchid = _fastPayStore.getAttr('bustype');
            console.log('savecard-fastpay-paymchid:'+_paymchid);
            return _paymchid || this.paymchid;
        },
        saveSuccess:function(data){
            var _that = this;
            var _from = this.dataStore.getAttr('from');
            var _isNew = this.dataStore.getAttr('isnew');
            this.showToast(Message.get((_isNew && _isNew == 1) ? 366 : 367), function () {
                if (_from == 'independentset') {
                    _that.dataStore.setAttr('statusbindcard', 1);
                    _that.dataStore.setAttr('defaultcardbindid', data.bindid);
                    _that.forward('fastpaysetting');
                } else if (_from == 'payingset') {
                    _that.dataStore.setAttr('bindid', data.bindid);
                    _that.forward('fastpayconfirm');
                }
            });
        },
        exitHandler:function(){
            var _from = this.dataStore.getAttr('from');
            if (_from == 'independentset') {
                this.forward('fastpaysetting');
            } else if (_from == 'payingset') {
                this.forward('fastpaysetting?path=defaultcredit');
            }
        }
    });

    var realNameCardStore = WalletStore.RealNameCardStore.getInstance();
    var RealName = _.extend({},BindCardBase,{
        bindcardtype:'realname',
        paymchid:Config.PAYMCHIDS.REALNAME,
        title: STRING.PAGE_TITLE,
        preMobileTip :STRING.PREMOBILE_TIP,
        getIdCodeFailGoto: 'index',
        dataStore:realNameCardStore,
        exittip:STRING.BINDCARD_EXIT_TIP,
        reqtype:8,
        saveSuccess:function(data){
            CacheData.setIsAuthStateChanged(true); //notify index page to reload

            var userInfoStore = WalletStore.UserInfoStore.getInstance();
            userInfoStore.setBase64('username', this.dataStore.getAttr('uname'));
            userInfoStore.setAttr('idtype', this.dataStore.getAttr('idtype'));
            userInfoStore.setAttr('idno', Util.getIDcard(this.dataStore.getAttr('idno')));
            userInfoStore.setAttr('cardTypeString', this.dataStore.getAttr('cardTypeString'));
            userInfoStore.setAttr('authstatus', 1);

            this.dataStore.remove();

            this.forward('accountverified');
        },
        exitHandler: function () {
            this.back('accountverified');
        }
    });

    var View = IdCodePageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        requestCode: 66,
        reqflag: 0,
        reqparam: null,
        events: {
            'click .J_NextBtn': '_checkMobile',
            'click .J_Get-indentify-code': 'getIdentifyCode',
            'click .J_CallServices': '_callServices',
            'click .J_Obligation': '_goObligation'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            var that = this;
            var path = this.getQuery('path'); ;
            var page = null;
            switch (path) {
                case 'bindcard':
                    page = BindCard;
                    break;
                case 'fastpay':
                    page = FastPay;
                    break;
                case 'realname':
                    page = RealName;
            }
            Util.mix(this, page);

            this.inherited(arguments);

            this.render();

            setTimeout(function () {
                that.getIdentifyCode();
            }, 100)
        },
        render: function () {
            var that = this;

            var info = this.info();
            var t = _.template(that.tpl, info);
            that.$el.html(t);
            that.bindIDCodeEvent();
            that.turning();

            setTimeout(function () {
                that.existIntervalStore();
            }, 100);
        },
        _callServices: function () {
            this.showDlg({
                message: STRING.ALERT_TITLE,
                buttons: [{
                    text: STRING.CANCEL,
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: STRING.CALL,
                    click: function () {
                        Util.callPhone(Config.SERVICE_TEL_NUMBER);
                    }
                }]
            });
        },
        _checkMobile: function () {
            var that = this;
            var f = this.checkInfo();
            if (!f) {
                return;
            }
            if(!Config.VERIFY_ID_CODE) {
                this.loading.show();
                this.manualVerfiedIdentifyCode(this.$el.find('.J_Indentify'), function(ret){
                    that.loading.hide();
                    if(ret) {
                        that.goNext();
                    }
                });
            }else{
                this.goNext();
            }
        },
        _goObligation: function () {

            var url = 'payobligation?param=' + this.reqparam;
            this.forward(url);
        },
        getMobile: function () {
            return this.$el.find('.J_Mobile').val();
        }
    });

    return View;
});

