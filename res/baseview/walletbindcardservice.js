/**
 * @module walletbindcardinfo
 * @author yanjj
 * @description walletbindcardinfo base page, for bindcard and realnamecard
 * @version since Wallet V6.8
 */
define(['WalletModel', 'WalletStore', 'Util', 'WalletCardInfo', 'Message', 'cUtilCryptBase64', 'RealName', 'Config', 'Scmg'],
function (WalletModel, WalletStore, Util, WalletCardInfo, Message, cUtilCryptBase64, RealName, Config, Scmg) {

    var STRING = {
        CARD_ERR_CHANGE: '该银行卡状态异常，请联系银行或更换支付方式',
        CANCEL: '取消',
        CHANGE_CARD: '更换银行卡'
    };
    var BIND_CARD_TYPE = {
        BINDCARD: 'bindcard',
        FASTPAY: 'fastpay',
        REALNAME: 'realname'
    };
    var BIND_CARD_VARS = {
        'bindcard': {reqtype: 2},
        'fastpay': {reqtype: 4},
        'realname': {reqtype: 8}
    };

    var bindCardModel = WalletModel.CreditCardBind.getInstance();
    var exports = WalletCardInfo.extend({
        bindcardtype:'',
        paymchid:'',
        dataStore:null,
        getPaymchid:function(){
            return this.paymchid;
        },
        confirmRealName: function (cbConfirm, cbCancel) {
            var _data = this.getAllValue();

            var params = {
                cardHolder: _data.cardHolder,
                cardType: _data.cardType,
                cardTypeString: _data.cardTypeString,
                cardNo: _data.cardNo,
                mask: this.getCstMsg()
            };

            if(this.bindcardtype === BIND_CARD_TYPE.REALNAME) {
                var rnOpts = {
                    realNameType: 2,
                    realNameTitle: '确认信息，一旦认证无法修改',
                    realNameTip: '认证后，携程钱包中的返现和现金只能转出至该实名信息的银行卡，有效防止他人盗取。'
                };
                Util.mix(params, rnOpts);
            }

            var realName = new RealName(params);

            var that = this;
            realName.show(function (flag) {
                if (flag) {
                    cbConfirm && cbConfirm.call(that);
                } else {
                    cbCancel && cbCancel.call(that);
                }
            });
        },
        submit:function(){
            var that = this;

            var _valid = this.validate();
            if (!_valid) {
                return;
            }

            var _data = this.getAllValue();
            var _cardInfo = this.elements.cardInfo;
            var encode = cUtilCryptBase64.Base64.encode;

            bindCardModel.param = {};
            bindCardModel.param.reqtype = BIND_CARD_VARS[this.bindcardtype].reqtype; //实名绑卡
            bindCardModel.param.paymchid = this.getPaymchid();
            bindCardModel.param.cardno = encode(_cardInfo.cardno.replace(/\s+/g,'')); // 卡号
            bindCardModel.param.cardtype = _cardInfo.cardtype; //前台卡种信息
            bindCardModel.param.bankname = _cardInfo.bankname; // 银行名称
            bindCardModel.param.cardholder = _data.cardHolder; //持卡人姓名
            bindCardModel.param.idtype = _data.cardType; //持卡人证件类型
            _data.cardNo && (bindCardModel.param.idno = encode(_data.cardNo)); //持卡人证件号码
            _data.preTel && (bindCardModel.param.mobile = encode(_data.preTel)); //预留手机号码
            _data.validity && (bindCardModel.param.validity = encode(_data.validity)); //卡有效期
            _data.cardIdentify && (bindCardModel.param.verno = encode(_data.cardIdentify)); //卡验证码

            bindCardModel.param.sesid = Util.getGuid(); // add sessionid to service.
            bindCardModel.param.bindtype = _cardInfo.bindtype;
            bindCardModel.param.paywayid = _cardInfo.paywayid; //前台支付方式

            var pwdStore = this.dataStore;//bindcard/fastpay/realname
            if(this.bindcardtype === 'realname'){
                pwdStore = WalletStore.RealNameStore.getInstance();
            }

            ///var verifytype = pwdStore.getAttr('verifytype');
            var verifytype = Scmg.getV();
            if (verifytype == 1) {
                ///bindCardModel.param.paypwd = pwdStore.getAttr('pwd'); //支付密码
                bindCardModel.param.paypwd = Scmg.getP();
            } else if (verifytype == 2) {
                // bindCardModel.param.requestid = pwdStore.getAttr('requestid'); //指纹验证请求ID
                // ///bindCardModel.param.keytoken = pwdStore.getAttr('paytoken');
                // bindCardModel.param.keytoken = Scmg.getT();
                // bindCardModel.param.keyguid = pwdStore.getAttr('keyguid');
                // bindCardModel.param.devguid = pwdStore.getAttr('devguid');
                _.extend(bindCardModel.param, Scmg.getT());
            }

            if(this.bindcardtype === BIND_CARD_TYPE.BINDCARD) {
                bindCardModel.param.bindname = _data.bindname?1:0;//实名绑定，临时存放在store供SaveCard使用
            }else if(this.bindcardtype === BIND_CARD_TYPE.FASTPAY) {
                bindCardModel.param.bindname = 0;
            }else if(this.bindcardtype === BIND_CARD_TYPE.REALNAME) {
                bindCardModel.param.bindname = 1;
            }

            //store for realname done
            if(this.bindcardtype === BIND_CARD_TYPE.REALNAME) {
                this.dataStore.setAttr('uname', _data.cardHolder);
                this.dataStore.setAttr('idtype', _data.cardType);
                this.dataStore.setAttr('cardTypeString', _data.cardTypeString);
                this.dataStore.setAttr('idno', _data.cardNo);
            }

            //for fastpay
            if(this.bindcardtype === BIND_CARD_TYPE.FASTPAY) {
                var _isNew = this.dataStore.getAttr('isnew');
                if (_isNew && _isNew == 2) {//补填卡
                    bindCardModel.param.infoid = this.dataStore.getAttr('infoid');
                }
            }

            this.loading.show();

            bindCardModel.exec({
                scope: this,
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true, true);
                    if (data.rc == 0) {
                        data.bindno && (bindCardModel.param.bindno = encode(data.bindno + ''));
                        bindCardModel.param.collectionid = data.collectionid;
                        bindCardModel.param.infoid = data.infoid;

                        that.dataStore.setAttr('bindcardparams', bindCardModel.param);
                        that.dataStore.setBase64('preMobile', _data.preTel);
                        that.commonGoNext();
                        that.submitSuccess(data);

                    } else if (data.rc === Config.RC_CODE.BIND_CARD_CHANGE) {
                        this.showDlg({
                            message: STRING.CARD_ERR_CHANGE,
                            buttons: [{
                                text: STRING.CANCEL,
                                click: function () {
                                    this.hide();
                                }
                            }, {
                                text: STRING.CHANGE_CARD,
                                click: function () {
                                    this.hide();
                                    that.commonGoNext();
                                    that.changeCardHandler();
                                }
                            }]
                        });
                    } else {
                        this.showToast(data.rmsg);
                        this.showTopError(data.rmsg);
                        if (data.rc == Config.RC_CODE.BIND_CARD_TEL) {
                            this.highLightTel();
                        }
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data);
                }
            });

        },
        submitSuccess:function(data){
            //just for override
        },
        changeCardHandler: function () {
            //just for override
        }
    });
    return exports;
});