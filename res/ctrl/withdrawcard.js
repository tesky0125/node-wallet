/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletModel', 'WalletStore', 'WalletPageView', 'Message', 'Util', 'Config', 'WalletResk', 'WalletCardInfo', 'RealName','PayVerify', 'Scmg'],
function (WalletModel, WalletStore, WalletPageView, Message, Util, Config, WalletResk, WalletCardInfo, RealName,PayVerify, Scmg) {

    var STRING = {
        PAGE_TITLE: '提现到银行卡',
        OVER_TITLE: '您的账户已超出每日提现限额。',
        CONFIRM: '确定',
        WITHDRAW_EXPLAIN: '提现￥{1} 到 {2}{3}（卡号 {4}）',
        CONFIRM_WITHDRAW: '确认提现',
        CANCEL: '取消',
        INPUT_PSD: '输入支付密码',
        INPUT_HINT: '每日最高5万',
        ACTION: '提现'
    };

    var HISTORY = 'history';
    var WITHNAME = 'withname';
    var ADDCARD = 'addcard';

    var checkBinStore = WalletStore.CheckBin.getInstance();
    var hisStore = WalletStore.HisCardItemStore.getInstance();
    var withdrawLimitStore = WalletStore.WithdrawLimit.getInstance();
    var accountStore = WalletStore.UserAccountStore.getInstance();
    var withdrawCardStore = WalletStore.WithdrawCard.getInstance();
    var userInfoStore = WalletStore.UserInfoStore.getInstance();
    var checkModel = WalletModel.WithdrawLimit.getInstance();

    var View = WalletCardInfo.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        checked: false,
        pageModel: null,
        events: {
            'blur input': function (e) {
                if (document.activeElement.tagName.toLowerCase() != 'input') {
                    $(window).scrollTop(0);
                }
            },
	        'click .J_Next': 'goNext',
	        'click .J_SelectLine': 'selectHandler'
	    },
		onCreate: function (){
		    this.inherited(arguments);
		},
		onShow: function () {
		    this.inherited(arguments);

		    if (!accountStore.hasAccountData()) {
		        this.showToast(Message.get(123), _.bind(this.returnHandler, this));
		        return;
		    }

		    var path = this.path = this.getQuery('path');
		    if (path == HISTORY) {

		    } else {
		        if (this.path != WITHNAME) {
		            this.path = ADDCARD;
		        }
		    }

		    var info = this.info;//
		    if (path == HISTORY) {
		        info = hisStore.getBase64();
		        if (info == null) {
		            this.back('withdraw');
		            return;
		        }

		        this.loading.show();
		        checkModel.exec({
		            suc: function (ret) {
		                this.loading.hide();
		                this.procRcCode(ret);
		                if (ret.rc == 0) {
		                    this.leftAvailMoney = _.findWhere(ret.itemlist, { limtype: 1 }).remamt;
		                    info.basicbal = this.leftMoney = accountStore.getAttr("basicbal");
		                    userInfoStore.getBase64('username')&&( info.cardholder = userInfoStore.getBase64('username'));
		                    this._render(info);
		                    this.initEvent();

		                    if (ret.overflow == 1) {
		                        this.showDlg({
		                            message: STRING.OVER_TITLE,
		                            buttons: [{
		                                text: STRING.CONFIRM,
		                                click: function () {
		                                    this.hide();
		                                    that.back('index');
		                                }
		                            }]
		                        });
		                    }
		                }
		                this.loading.hide();
		            },
		            fail: this.onModelExecFail,
		            scope: this
		        })

		    } else if (path == WITHNAME) {
		        info = checkBinStore.get();
		        info.cardno = Util.formatCardCode(checkBinStore.getBase64('cardno'));
		        info.basicbal = this.leftMoney = accountStore.getAttr("basicbal");
		        info.cardholder = userInfoStore.getBase64('username');
		        info.id = userInfoStore.getAttr('idno');
		        this.leftAvailMoney = _.findWhere(withdrawLimitStore.getAttr('itemlist'), { limtype: 1 }).remamt;
		        this._render(info);
		        this.initEvent();
		    } else {
		        info = checkBinStore.get();
		        info.cardno = Util.formatCardCode(checkBinStore.getBase64('cardno'));
		        info.basicbal = this.leftMoney = accountStore.getAttr("basicbal");
		        this.leftAvailMoney = _.findWhere(withdrawLimitStore.getAttr('itemlist'), { limtype: 1 }).remamt;
		        this._render(info);
		        this.initEvent();
		    }
		},
		_render: function (info) {
		    this.elements.action = STRING.ACTION;

		    this.elements.cardInfo = {
		        cardIcon: info.cardIcon,
		        banknameShort: info.banknameShort,
		        cardtypeUI: info.cardtypeUI,
		        cardno: info.cardno
		    };

		    this.elements.subTitle = "0手续费，快速到账";
		    var _status = userInfoStore.getAttr('authstatus');
		    if (this.path == HISTORY) {
                this.elements.fieldlist = [
                    {
                        fieldname: 'CardHolder',
                        fieldstatus: 1,
                        fieldvalue: info.cardholder
                    }
                ];
				this.elements.authoptstatus = 0; // 历史卡无需实名
                this.elements.cardHolderHelp = Message.get(109);
		    } else if (this.path == WITHNAME&&_status==1) {
		        this.elements.fieldlist = [
                    {
                        fieldname: 'CardHolder',
                        fieldstatus: 1,
                        fieldvalue: userInfoStore.getBase64('username')
                    },
                    {
                        fieldname: 'IdCardType',
                        fieldstatus: userInfoStore.getAttr('idtype') == 1? 1 :0,
                        fieldvalue: userInfoStore.getAttr('idtype')
                    },
                    {
                        fieldname: 'IdNumber',
                        fieldstatus: userInfoStore.getAttr('idtype') == 1 ? 1 : 0,
                        fieldvalue: userInfoStore.getAttr('idno')
                    }
		        ];
		        this.elements.authoptstatus = (info.AuthOptStatus !== undefined)?info.AuthOptStatus:2;
		        this.elements.cardHolderHelp = Message.get(109);
		    } else {
		        this.elements.fieldlist = [
                    {
                        fieldname: 'CardHolder',
                        fieldstatus: 0,
                        fieldvalue: ""
                    },
                    {
                        fieldname: 'IdCardType',
                        fieldstatus: 0,
                        fieldvalue: ""
                    },
                    {
                        fieldname: 'IdNumber',
                        fieldstatus: 0,
                        fieldvalue: ""
                    }
		        ];
		        this.elements.authoptstatus = (info.AuthOptStatus !== undefined)?info.AuthOptStatus:2;
		        this.elements.cardHolderHelp = Message.get(110);
		    }

		    this.elements.inputData = {
		        label: '可提现金额',
		        inputLabel: '提现金额',
		        inputHint: STRING.INPUT_HINT,
		        money: info.basicbal,
		        valiCallBack: function (money) {
		            if (!Util.passCheckMoney(money)) {
		                this.showToast(Message.get(339));
		                return false;
		            }

		            var leftAvailMoney = this.leftAvailMoney;
		            var leftMoney = this.leftMoney;

		            if (parseFloat(money) > parseFloat(leftMoney)) {
		                this.showToast(Message.get(335));
		                return false;
		            }

		            if (parseFloat(money) > parseFloat(leftAvailMoney)) {
		                this.showToast(Message.get(338));
		                return false;
		            }
		            return true;
		        }
		    };
		        this.loadCerList(this.render);

		},
		render: function () {
		    this.inherited(arguments);
		    this.turning();
		},
		confirmRealName: function (cbConfirm, cbCancel) {
		    var that = this;
		    var _data = this.getAllValue();

		    var params = {
		        cardHolder: _data.cardHolder,
		        cardType: _data.cardType,
		        cardTypeString: _data.cardTypeString,
		        cardNo: _data.cardNo,
		        mask: this.getCstMsg()
		    };

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
		initEvent: function () {
		    var that = this;

		    this.$el.find('.J_Question').on('click', function () {
		        if (that.pageModel == PAGE_MODEL.ADD_CARD) {
		            that.getCstMsg().showMessage(Message.get(110));
		        } else {
		            that.getCstMsg().showMessage(Message.get(109));
		            $('.J_CtripHelp').on('click', function () {
		                Util.callPhone(Config.SERVICE_TEL_NUMBER);
		            })
		        }
		    });
		},
		goNext: function () {
		    var that = this;


		    if (!this.validate()) {
		        return;
		    }

		    var allValue = this.getAllValue();

		    var name = allValue.cardHolder;
		    var money = allValue.money;

		    if (this._els.$checkLine[0] && !allValue.bindname) {
		        this.showToast(Message.get(376));
		        this.highLightCheckLine();
		        return;
		    }

		    switch (this.path) {
		        case HISTORY:
		            withdrawCardStore.setAttr('bankname', hisStore.getBase64('bankname'));
		            withdrawCardStore.setAttr('cardno', hisStore.getAttr('cardno'));
		            withdrawCardStore.setAttr('cardtypeUI', hisStore.getBase64('cardtypeUI'));
		            withdrawCardStore.setAttr('cardtype', hisStore.getBase64('cardtype') + '');

		            withdrawCardStore.setBase64('cardholder', userInfoStore.getBase64('username')?userInfoStore.getBase64('username'):hisStore.getBase64('cardholder'));

		            withdrawCardStore.setBase64('idno', userInfoStore.getAttr('idno')); //持卡人证件号
		            withdrawCardStore.setAttr('idtype', userInfoStore.getAttr('idtype') + '');//持卡人证件类型

		            withdrawCardStore.setAttr('cardid', hisStore.getBase64('cardid'));//历史卡 卡号
		            break;
		        case ADDCARD:
		            withdrawCardStore.setAttr('bankname', checkBinStore.getAttr('bankname'));
		            withdrawCardStore.setAttr('cardno', checkBinStore.getAttr('cardno'));
		            withdrawCardStore.setAttr('cardtypeUI', checkBinStore.getAttr('cardtypeUI'));
		            withdrawCardStore.setAttr('cardtype', checkBinStore.getAttr('cardtype') + '');

		            withdrawCardStore.setBase64('cardholder', name);

		            withdrawCardStore.setBase64('idno', allValue.cardNo);
		            withdrawCardStore.setAttr('idtype', allValue.cardType);

		            withdrawCardStore.removeAttr('cardid');

		            break;
		        case WITHNAME:
		            withdrawCardStore.setAttr('bankname', checkBinStore.getAttr('bankname'));
		            withdrawCardStore.setAttr('cardno', checkBinStore.getAttr('cardno'));
		            withdrawCardStore.setAttr('cardtypeUI', checkBinStore.getAttr('cardtypeUI'));
		            withdrawCardStore.setAttr('cardtype', checkBinStore.getAttr('cardtype') + '');

		            withdrawCardStore.setBase64('cardholder', name);

		            withdrawCardStore.setBase64('idno', allValue.cardNo);
		            withdrawCardStore.setAttr('idtype', allValue.cardType);

		            withdrawCardStore.removeAttr('cardid');
		            break;
		    }

		    withdrawCardStore.setAttr('amount', money);
		    withdrawCardStore.setAttr('AuthFlag', allValue.isResetCrdNo);
		    var amount = Util.parseMoney(withdrawCardStore.getAttr('amount'));
		    var bankname = withdrawCardStore.getAttr('bankname');
		    var cardtypeUI = withdrawCardStore.getAttr('cardtypeUI');
		    var cardno = Util.parseCard(withdrawCardStore.getBase64('cardno'));
		    var content = Util.formatStr(STRING.WITHDRAW_EXPLAIN, amount, bankname, cardtypeUI, cardno);
		    PayVerify.exec(this, {
		                success: function (data) {
		                    // var param = {};
		                    // if (data.verifytype == 1) {//validate password
		                    //     param.paypwd = data.pwd;
		                    //     ///withdrawCardStore.setAttr('paypwd', data.pwd);
                      //           Scmg.setP(data.pwd);
		                    // } else {//validate fingerprint
		                    //     var _touchInfo = {
		                    //         requestid: data.requestid,
		                    //         keytoken: data.paytoken,
		                    //         keyguid: data.keyguid,
		                    //         devguid: data.devguid
		                    //     };
		                    //     withdrawCardStore.setAttr('touchinfo', _touchInfo);
		                    // }
		                    var ret = WalletResk.exec(that,
			            function(ret) {
			                ret();
			            });
		                },
		                failure: function () {

		                },
		                cancel: function () {
		                }
		            }, '', { payPsdPrompt: STRING.PAYPSD_VERIFY,
		                fingerPrompt:STRING.FINGER_VERIFY
		            });
		    this.commonGoNext();
		}
	});

	return View;
});

