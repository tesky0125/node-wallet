/**
 * @author zh.xu
 * @desc:  转账到现金余额
 */

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'Message', 'Config', 'text!switchcash_html', 'PayVerify'],
    function(Log, Util, WalletPageView, WalletModel, WalletStore, Message, Config, html, PayVerify) {

        var STRING = {
            PAGE_TITLE: "转到现金余额",
            EXPLAIN: "说明",
            PAYPSD_VERIFY: '请输入携程支付密码，以完成提现',
            FINGER_VERIFY: '请验证您的指纹，以完成提现',
            AUTH_TXT: '转至现金余额需要要进行实名认证',
            CENCLE: '取消',
            GO_AUTHENTICATE: '去认证'
        };
        var transferWalletModel = WalletModel.ExgOrGainModel.getInstance();
        var transferWalletStore = WalletStore.TransWalletStore.getInstance();
        var cashAcctModel = WalletModel.WalletAccountSearch.getInstance();
        var walletUserInfo = WalletModel.WalletUserInfoSearch.getInstance(); //钱包用户信息， 是否实名
        var userInfoStore = WalletStore.UserInfoStore.getInstance();
        var formPageStore = WalletStore.SetPageStore.getInstance();
        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            headerBtn: {
                title: STRING.EXPLAIN,
                id: 'J_Explain',
                classname: 'explain'
            },
            commitHandler: {
                id: 'J_Explain',
                callback: function() {
                    this.getCstMsg().showMessage(Message.get(343));
                }
            },
            //backToPage: 'useraccount',
            events: {
                'click #J_SwitchBtn': 'submitFn',
                'input #J_SwitchCash': 'inputSwitchAmt'
            },
            onCreate: function() {
                this.inherited(arguments);
                this.render();
            },
            render: function() {
                this.$el.html(_.template(this.tpl));
                this.els = {
                    "ReCashAmt": this.$el.find("#J_ReCashAmt"),
                    "SwitchCashAmt": this.$el.find("#J_SwitchCash"),
                    "ClearInputIcon": this.$el.find(".J_ClearInput"),
                    "SwitchBtn": this.$el.find("#J_SwitchBtn")
                };
            },
            onShow: function() {
                var self = this;
                this.inherited(arguments);
                this.authstatus = this.getAuthStu();
                if (this.authstatus == 1 || this.authstatus == 100 || this.authstatus == 3) {
                    this.getReCashFn();
                    this.initCommonEvent(this.resetInput);
                    this.turning();
                } else {
                    this.showDlg({
                        message: STRING.AUTH_TXT,
                        buttons: [{
                            text: STRING.CENCLE,
                            type: "cancel",
                            click: function() {
                                self.forward('useraccount');
                            }
                        }, {
                            text: STRING.GO_AUTHENTICATE,
                            click: function() {
                                this.hide();
                                formPageStore.setAttr('rmFromPage', 'switchcash')
                                self.forward('accountverified');
                            }
                        }]
                    });
                }
            },
            getAuthStu: function() {
                var _data = userInfoStore.get();
                if (_data) {
                    var authstatus = _data.authstatus;
                    return authstatus;
                } else {
                    walletUserInfo.param = {
                        reqbmp: 1
                    };
                    walletUserInfo.exec({
                        suc: function(data) {
                            this.authstatus = data.authstatus;
                            return authstatus;
                        },
                        scope: this,
                        fail: function() {
                            this.showToast(Message.get(123));
                        }
                    });
                }
            },
            getReCashFn: function() {
                var self = this;
                this.showLoading();
                cashAcctModel.param = {
                    reqbmp: 2
                };
                cashAcctModel.exec({
                    suc: this._getReCashSuc,
                    scope: this,
                    fail: function() {
                        self.show404Err();
                    },
                    abort: function() {
                        self.show404Err();
                    }
                });
            },
            _getReCashSuc: function(data) {
                var self = this;
                this.hideLoading();
                if (!cashAcctModel.hasCtripUserData()) {
                    this.show404Err();
                }
                self.els.ReCashAmt.html(data.rtcash || "");
                if (Util.compareZero(data.rtcash)) {
                    self.els.SwitchCashAmt.attr({
                        'type': 'text'
                    })
                } else {
                    self.els.SwitchCashAmt.attr({
                        'type': 'tel'
                    })
                }
            },
            show404Err: function() {
                var self = this;
                this.show404(function() {
                    self.hideLoading();
                    self.hide404();
                    self.onShow();
                });
            },
            resetDataFn: function() {
                this.els.SwitchCashAmt.val("");
            },
            inputSwitchAmt: function(e) {
                var val = $(e.target).val();
                if (val != '') {
                    this.els.SwitchBtn.removeClass('gray');
                    this.els.ClearInputIcon.show();
                    var newVal = Util.parseInputMoney(val);
                    $(e.target).val(newVal);
                } else {
                    this.els.SwitchBtn.addClass('gray');
                    this.els.ClearInputIcon.hide();
                }
            },
            isClickBtn: function() {
                var result = false; //false:不可点
                if (!this.els.SwitchBtn.hasClass("gray")) {
                    result = true;
                }
                return result;
            },
            blurSwitchAmt: function(e) {
                var value = $(e.target).val();
                value = value.replace(/^0*([^0].*)/g, "$1");
                $(e.target).val(value);
            },
            submitFn: function() {
                var self = this;
                var inputAmt = this.els.SwitchCashAmt.val();
                if (this.valiRes(inputAmt)) {
                    console.log("success");
                    PayVerify.exec(this, {
                        success: function(data) {
                            var param = {};
                            if (data.verifytype == 1) { //validate password
                                param.paypwd = data.pwd;
                            } else { //validate fingerprint
                                var _touchInfo = {
                                    requestid: data.requestid,
                                    keytoken: data.paytoken,
                                    keyguid: data.keyguid,
                                    devguid: data.devguid
                                };

                                param.touchinfo = _touchInfo;

                            }
                            self.paySwitchCash(param, inputAmt);
                        },
                        failure: function() {

                        },
                        cancel: function() {}
                    }, '', {
                        payPsdPrompt: STRING.PAYPSD_VERIFY,
                        fingerPrompt: STRING.FINGER_VERIFY
                    });
                }
            },
            paySwitchCash: function(params, inputAmt) {
                var self = this;
                this.showLoading();
                // transferWalletModel.param = {
                //     bankid: 0,
                //     bankname:'',
                //     cardno:'',
                //     idtype:'',
                //     idno:'',
                //     holder:'',
                //     prvid:0,
                //     prvname:'',
                //     cityid:0,
                //     cityname:'',
                //     tktype:0,
                //     vercode:'',
                //     riskid:'',
                //     waytype:4,
                //     amount: inputAmt
                // };
                transferWalletModel.setParam("bankid", 0);
                transferWalletModel.setParam("bankname", "");
                transferWalletModel.setParam("cardno", "");
                transferWalletModel.setParam("idtype", 0);
                transferWalletModel.setParam("idno", "");
                transferWalletModel.setParam("holder", "");
                transferWalletModel.setParam("prvid", 0);
                transferWalletModel.setParam("prvname", "");
                transferWalletModel.setParam("cityid", 0);
                transferWalletModel.setParam("cityname", "");
                transferWalletModel.setParam("tktype", 0);
                transferWalletModel.setParam("vercode", "");
                transferWalletModel.setParam("riskid", "");
                transferWalletModel.setParam("waytype", 4);
                transferWalletModel.setParam("amount", inputAmt);
                //transferWalletModel.setParam("paypwd", pwd);
                for (var per in params) {
                    //transferWalletModel.param[per] = params[per];
                    transferWalletModel.setParam(per, params[per]);
                }
                transferWalletModel.exec({
                    suc: self._transWalletSuc,
                    scope: self,
                    fail: function(info) {
                        self.hideLoading();
                        self.showToast((info && info.rmsg) || "网络超时，请稍后重试");
                    },
                    abort: function(info) {
                        self.hideLoading();
                        self.showToast((info && info.rmsg) || "网络超时，请稍后重试");
                    }
                });
            },
            _transWalletSuc: function(data) {
                var self = this;
                this.hideLoading();
                var param = {
                    issuc: 1, //1:失败；0：成功
                    amt: 0
                };
                if (data) {
                    param.amt = self.els.SwitchCashAmt.val();
                    if (data.rc == 0) {
                        transferWalletStore.setAttr("amount", this.els.SwitchCashAmt.val());
                        param.issuc = 0;
                        this.resetDataFn();
                        this.forward("result?path=cashback&issuc=" + param.issuc + "&amt=" + param.amt);
                    } else if (data.rc == 1321311) {
                        this.showToast(data.rmsg || "您尚未设置支付密码，请先进行设置。");
                    } else if (data.rc == 1402051) {
                        this.showToast(data.rmsg || "您的账户处于冻结状态，目前无法操作，如需帮助请联系携程客服。");
                    } else if (data.rc == 1302050) {
                        this.showToast(data.rmsg || "返现余额不足");
                    } else if (data.rc == 1302051) {
                        this.showToast(data.rmsg || "返现金额必须大于0元");
                    } else if(data.rc==1404015){
                        param.issuc = 3;
                        this.forward("result?path=cashback&issuc=" + param.issuc + "&amt=" + param.amt);
                    }else {
                        param.issuc = 1;
                        this.forward("result?path=cashback&issuc=" + param.issuc + "&amt=" + param.amt);
                    }
                }
            },
            valiRes: function(value) {
                var self = this;
                var result = false; //true：验证通过；
                var _value = value.trim();
                console.log();
                var reCashValue = this.els.ReCashAmt.text();
                if (!_value) { //为空
                    this.hilightInput();
                    this.els.ClearInputIcon.hide();
                    this.showToast("请填写转出金额");
                } else if (_value == 0) {
                    this.hilightInput();
                    this.els.ClearInputIcon.hide();
                    this.showToast("请填写转出金额", function() {
                        self.resetInput();
                    });
                } else if (_value.indexOf('0') == 0 && _value.charAt(1) != '.' || isNaN(_value)) {
                    this.hilightInput();
                    this.showToast("请填写正确的转出金额", function() {
                        self.resetInput();
                    });
                } else if (parseFloat(_value) > parseFloat(reCashValue)) {
                    this.hilightInput();
                    this.showToast("请勿超过可转出金额", function() {
                        self.resetInput();
                    });
                } else {
                    this.clearHilight();
                    result = true;
                }
                return result;
            },
            resetInput: function() { //重置输入框到最初形态
                this.els.SwitchCashAmt.val('');
                //this.els.SwitchCashAmt.parents('li').removeClass('bgc1');
                this.els.SwitchBtn.addClass('gray');
                this.els.ClearInputIcon.hide();
            },
            hilightInput: function() { //显示高亮
                this.els.SwitchCashAmt.parents('li').addClass('bgc1');
            },
            clearHilight: function() {
                this.els.SwitchCashAmt.parents('li').removeClass('bgc1');
            },
            onHide: function() {
                this.inherited(arguments);
                this.resetInput();
                this.clearHilight();
            }
        });

        return View;
    });