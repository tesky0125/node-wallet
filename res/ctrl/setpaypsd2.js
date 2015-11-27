/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!setpaypsd2_html', 'Util', 'Message', 'Config', 'cUtilCryptBase64'],
function (IdCodePageView, WalletModel, WalletStore, html, Util, Message, Config, cUtilCryptBase64) {

    var STRING = {
        PAGE_TITLE: '设置支付密码',
        NEED_HELP: '联系客服',
        CANCEL: '取消',
        DIALOG_TITLE: '无法设置支付密码，请联系携程客服以完成相关操作。'
    };
    var verStore = WalletStore.GetLoginSession.getInstance();
    var View = IdCodePageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        requestCode: 25,
        backBtn: true,
        //backToPage: 'securitycenter',
        events: {
            'click .J_Get-indentify-code': 'getIdentifyCode',
            'click .J_Submit': 'checkMobileAndPwd'
        },
        onCreate: function () {
            this.inherited(arguments);
            this.render();
            this.bindIDCodeEvent();
        },
        onShow: function (referer) {
            this.inherited(arguments);
            //6.4: remove bellow line because PwdHelper is not needed
            //this.loading.hide(); //to fix flashing issue, pwdhelper will not hide loading and leave loading layer to this page to hide


            var that = this;

            this.loading.show();
            this.bIgnoreBackKey = false; //reset 
            var checkModel = WalletModel.WalletAccountCheck.getInstance();
            checkModel.param.optype = 7;
            checkModel.exec({
                suc: function (info) {
                    that.loading.hide();
                    that.procRcCode(info, true, true);
                    if (info.rc == 0) {
                        that.turning();
                        that._getBindMobile();
                        
                    } else {
                        that.showDlg({
                            message: STRING.DIALOG_TITLE,
                            buttons: [{
                                text: STRING.CANCEL,
                                click: function () {
                                    this.hide();
                                    that.returnHandler();
                                }
                            }, {
                                text: STRING.NEED_HELP,
                                click: function () {
                                    Util.callPhone(Config.SERVICE_TEL_NUMBER);
                                }
                            }]
                        });
                        that.bIgnoreBackKey = true; //disable back key
                    }
                },
                fail: this.onModelExecFail,
                scope: this
            })
            
        },
        _getBindMobile: function () {
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
        render: function () {
            var that=this;
            this.title = STRING.PAGE_TITLE;
            this.$el.html(this.tpl);

            setTimeout(function () {
                that.existIntervalStore();
            }, 100);
        },
        checkMobileAndPwd: function () {
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
            var that = this;
            var newPsd = this.$el.find('.J_NewPsd').val();
            var moble = this.$el.find('.J_Mobile').val();
            var idCode = this.$el.find('.J_Indentify').val();

            //var verificationStore = WalletStore.Verification.getInstance();
            //var loginpwd = verificationStore.getAttr('loginpsd');

            var accModify = WalletModel.WalletAccountModify.getInstance();
            var paypwd=cUtilCryptBase64.Base64.encode(newPsd);
            accModify.param.reqtype = 25;
            accModify.param.newinfo = cUtilCryptBase64.Base64.encode(moble);
            accModify.param.paypwd = paypwd;
            accModify.param.newvcode = idCode;
            //accModify.param.loginpwd = loginpwd;

            that.loading.show();
            accModify.exec({
                suc: function (info) {
                    that.procRcCode(info, true);
                    that.loading.hide();
                    if (info.rc == 0) {
                        var store = WalletStore.UserInfoStore.getInstance();
                        store.setAttr('haspwd', 1);
                        //verificationStore.setAttr({ 'loginpsd': "" });
                        that.showToast(Message.get(101), function () {
                                that.returnHandler();
                        });
                    }
                },
                fail: function (data) {
                    that.onModelExecFailAsync(data, 302);
                },
                scope: this
            });
        },
        returnHandler: function () {
        //    if (this.getEntryView() == 'chgpwd') {
                this.clearIntervalStore();
        //        this.returnHandlerChgPwd();
        //    } else {
                this.inherited(arguments);
        //    }
        //    return true;
        }
    });

    return View;
});

