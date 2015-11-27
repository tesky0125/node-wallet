/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!setsecuritymobile_html', 'Message', 'Util', 'cUtilCryptBase64', 'Config', 'cGuiderService', 'Scmg'],
function (IdCodePageView, WalletModel, WalletStore, html, Message, Util, cUtilCryptBase64, Config, cGuiderService, Scmg) {

    var STRING = {
        SECURITY_CENTER_TITLE: '绑定手机',
        SECURITY_CENTER_TIP: '为了您的账户安全，请绑定安全验证手机',
        SECURITY_CENTER_PHONE_LABEL: '手机号码',
        SECURITY_CENTER_PHONE_HINT: '用于安全验证',
        SECURITY_CENTER_CODE_LABEL: '验证码',
        SECURITY_CENTER_CODE_HINE: '输入手机短信获得的验证码',
        SECURITY_CENTER_ACTION: '提交',

        FAST_PAY_TITLE: '设置安全验证手机',
        FAST_PAY_TIP: '设置安全验证手机，保护账户安全',
        FAST_PAY_PHONE_LABEL: '手机',
        FAST_PAY_PHONE_HINT: '请输入手机号码',
        FAST_PAY_CODE_LABEL: '验证码',
        FAST_PAY_CODE_HINE: '请输入短信验证码',
        FAST_PAY_EXIT_TIP: '确认退出快捷支付设置？',
        FAST_PAY_ACTION: '确认',

        CANCEL: '取消',
        EXIT: '退出',

        AUTHVERIFIED_SET_PSD_TITLE:'退出设置支付密码？',
        GO_ON:'继续设置'
    };
    var setPsdStore = WalletStore.SetPsdStore.getInstance();
    var verificationStore = WalletStore.Verification.getInstance();
    var SecurityCenter = {
        title: STRING.SECURITY_CENTER_TITLE,
        tel: true,
        success: function () {
            var _that = this;
            this.showToast(Message.get(108), function () {
                ///verificationStore.setAttr('paypsd', '');
                Scmg.setP('');
                _that.back('securitycenter');
            });
        },
        setDefaultMobile: function () {
            var $mobile = this.$el.find('.J_Mobile');

            $mobile.unbind().bind('keydown input propertychange', _.bind(function () {
                var _mobile = $mobile.val();
                if (!this.bVerifyMobile && _mobile.indexOf("*") != -1) {
                    $mobile.val('');
                    this.bVerifyMobile = true;
                    this.preMobile = '';
                }
            }, this));


            this.loading.show();
            var _userInfoModel = WalletModel.WalletUserInfoSearch.getInstance();
            _userInfoModel.param = {};
            _userInfoModel.param.reqbmp = 1; //用户信息；
            _userInfoModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {
                        var _aliasMobile = data.aliasmobile || '';
                        if (!Util.isEmpty(_aliasMobile)) {
                            this.preMobile = _aliasMobile;
                            this.bVerifyMobile = false;

                            $mobile.val(_aliasMobile);
                        }
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            });
        },
        model: {
            tip: STRING.SECURITY_CENTER_TIP,
            phoneLabel: STRING.SECURITY_CENTER_PHONE_LABEL,
            phoneHint: STRING.SECURITY_CENTER_PHONE_HINT,
            codeLabel: STRING.SECURITY_CENTER_CODE_LABEL,
            codeHint: STRING.SECURITY_CENTER_CODE_HINE,
            action: STRING.SECURITY_CENTER_ACTION
        }
    };

    var SecurityMobileBase = {
        model: {
            tip: STRING.FAST_PAY_TIP,
            phoneLabel: STRING.FAST_PAY_PHONE_LABEL,
            phoneHint: STRING.FAST_PAY_PHONE_HINT,
            codeLabel: STRING.FAST_PAY_CODE_LABEL,
            codeHint: STRING.FAST_PAY_CODE_HINE,
            action: STRING.FAST_PAY_ACTION
        },
        setDefaultMobile: function () {
            var _that = this;
            var $mobile = this.$el.find('.J_Mobile');
            $mobile.on('input', function () {
                if (_that.bVerifyMobile) {
                    return;
                }
                _that.bVerifyMobile = true;
                _that.preMobile = '';
                $(this).attr('placeholder', STRING.FAST_PAY_PHONE_HINT);
            });

            this.loading.show();
            var _userInfoModel = WalletModel.WalletUserInfoSearch.getInstance();
            _userInfoModel.param = {};
            _userInfoModel.param.reqbmp = 1; //用户信息；
            _userInfoModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data, true);
                    if (data.rc == 0) {
                        var _aliasMobile = data.aliasmobile || '';
                        if (!Util.isEmpty(_aliasMobile)) {
                            this.preMobile = _aliasMobile;
                            this.bVerifyMobile = false;

                            $mobile.val(_aliasMobile);
                        }
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            })
        }
    };

    var fastPayStore = WalletStore.FastPayStore.getInstance();
    var FastPay = _.extend({},SecurityMobileBase,{
        title: STRING.FAST_PAY_TITLE,
        tel: false,
        requestCode: 25, //设置支付密码(提供手机验证码) 不要登录密码
        rsvtype: 1, //1：手机
        success: function () {
            var _that = this;

            this.showToast(Message.get(374), function () {
                Scmg.setV(1);
                ///fastPayStore.setAttr('verifytype', 1); //1 = 密码验证
                ///var _psd = verificationStore.getAttr('paypsd');
                ///var _psd = Scmg.getP();
                ///console.log('pwd:'+_psd)
                ///fastPayStore.setAttr('pwd', _psd);
                ///Scmg.setP(_psd);

                ///verificationStore.setAttr('paypsd', '');
                //Scmg.setP('');
                _that.forward('fastpaysetting?path=defaultcredit');
            });
        },
        returnHandler: function () {
            var that = this;
            this.showDlg({
                message: STRING.FAST_PAY_EXIT_TIP,
                buttons: [{
                    text: STRING.CANCEL,
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: STRING.EXIT,
                    click: function () {
                        that.clearIntervalStore();
                        this.hide();
                        var _source = fastPayStore.getAttr('source');

                        if (Util.isEmpty(_source)) {
                            //if (Config.IS_INAPP) {//
                            //    cGuiderService.backToLastPage();
                            //} else {
                            //    that.jump(Config.H5_MAIN_HOME_URL);
                            //}
                            that.exitWalletModule();
                            return;
                        }

                        if (_source == '11') {//11：支付Native
                            //if (Config.IS_INAPP) {//
                            //    cGuiderService.backToLastPage();
                            //} else {
                            //    that.jump(Config.H5_MAIN_HOME_URL); //test.
                            //}
                            that.exitWalletModule();
                        }
                    }
                }]
            });
        }
    });

    var realNameStore = WalletStore.RealNameStore.getInstance();
    var AuthCheck = _.extend({},SecurityMobileBase,{
        title: STRING.FAST_PAY_TITLE,
        tel: false,
        requestCode: 25, //设置支付密码(提供手机验证码) 不要登录密码
        rsvtype: 1, //1：手机
        success: function () {
            var _that = this;

            this.showToast(Message.get(374), function () {
                Scmg.setV(1);
                ///realNameStore.setAttr('verifytype', 1); //1 = 密码验证
                ///var _psd = verificationStore.getAttr('paypsd');
                ///var _psd = Scmg.getP();
                ///console.log('pwd:'+_psd)
                ///realNameStore.setAttr('pwd', _psd);
                ///Scmg.setP(_psd);
                ///verificationStore.setAttr('paypsd', '');
                ///Scmg.setP('');
                var rnType = realNameStore.getAttr('rnType');
                if(rnType === 'idcard') {
                    _that.forwardWithRetView('addaccountinfo', 'accountverified');
                }else if(rnType === 'bank'){
                    _that.forwardWithRetView('addcard?path=realname', 'accountverified');
                }
                setPsdStore.remove()
            });
        },
        returnHandler: function () {
            var that = this;
            this.showDlg({
                message: STRING.AUTHVERIFIED_SET_PSD_TITLE,
                buttons: [{
                    text: STRING.EXIT,
                    click: function () {
                        this.hide();
                        that.forward('accountverified');
                        setPsdStore.remove();
                    }
                }, {
                    text: STRING.GO_ON,
                    click: function () {
                        this.hide();
                    }
                }]
            });
        }
    });
    var InsrcAtv = _.extend({},SecurityMobileBase,{
        title: STRING.FAST_PAY_TITLE,
        tel: false,
        requestCode: 25, //设置支付密码(提供手机验证码) 不要登录密码
        rsvtype: 1, //1：手机
        success: function () {
            var _that = this;
            this.showToast(Message.get(374), function () {
                Scmg.setV(1);
                ///realNameStore.setAttr('verifytype', 1); //1 = 密码验证
                ///var _psd = verificationStore.getAttr('paypsd');
                ///var paypsd = Scmg.getP();
                ///console.log('pwd:'+_psd)
                ///realNameStore.setAttr('pwd', _psd);
                ///Scmg.setP(_psd);
                ///verificationStore.setAttr('paypsd', '');
                ///Scmg.setP('');
                 _that.forwardWithRetView('addaccountinfo', 'insrcactivity');
                 setPsdStore.remove();
            });
        },
        returnHandler: function () {
            var that = this;
            this.showDlg({
                message: STRING.AUTHVERIFIED_SET_PSD_TITLE,
                buttons: [{
                    text: STRING.EXIT,
                    click: function () {
                        this.hide();
                        that.forward('insrcactivity');
                        setPsdStore.remove();
                    }
                }, {
                    text: STRING.GO_ON,
                    click: function () {
                        this.hide();
                    }
                }]
            });
        }
    });
    var View = IdCodePageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        tel: true,
        backBtn: true,
        requestCode: 30,
        events: {
            'click .J_Get-indentify-code': 'getIdentifyCode',
            'click .J_Submit': 'setMobile'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            var _path = this.getQuery('path');
            var _page = null;
            switch (_path) {
                case 'fastpay':
                    _page = FastPay;
                    break;
                case 'authverify':
                    _page = AuthCheck;
                    break;
                case "insrcactivity":
                    _page=InsrcAtv;
                    break;
                default:
                    _page = SecurityCenter; //默认来自安全中心.
                    break;
            }

            Util.mix(this, _page);

            this.inherited(arguments);

            this.render();
            this.bindIDCodeEvent();

            this.setDefaultMobile();

            this.turning();
        },
        setDefaultMobile: function () {
        },
        render: function () {
            var that=this;
            this.$el.html(_.template(this.tpl, this.model));
            setTimeout(function () {
                that.existIntervalStore();
            }, 100);
        },
        setMobile: function () {
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
        goNext:function(){
            var newPsd = this.$el.find('.J_NewPsd').val();
            var mobile = this.$el.find('.J_Mobile').val();
            var idCode = this.$el.find('.J_Indentify').val();

            //存支付密码统一使用Verification.

            ///var paypsd = verificationStore.getAttr('paypsd');
            var paypsd = Scmg.getP();

            if (!Util.isEmpty(this.preMobile)) {
                mobile = this.preMobile;
            }
            this.loading.show();
            var accModify = WalletModel.WalletAccountModify.getInstance();
            accModify.param = {};
            accModify.param.reqtype = this.requestCode;
            accModify.param.newinfo = cUtilCryptBase64.Base64.encode(mobile);
            accModify.param.newvcode = idCode;
            accModify.param.paypwd = paypsd;
            accModify.exec({
                suc: function (info) {
                    this.procRcCode(info, true);
                    this.loading.hide();
                    if (info.rc == 0) {
                        var store = WalletStore.UserInfoStore.getInstance();
                        if (!Util.isEmpty(this.preMobile)) {
                            store.setAttr('secmobile', mobile);
                        } else {
                            mobile = Util.getMobile(mobile);
                            store.setAttr('secmobile', mobile);
                        }

                        this.success();
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 328);
                },
                scope: this
            });
        },
        success: function () {

        }
    });

    return View;
});

