/**
* @module resetpaypsd
* @author luzx
* @description reset pay pass word
* @version since Wallet V5.7
*/

define(['IdCodePageView', 'WalletModel', 'WalletStore', 'text!resetpaypsd_html', 'Util', 'Message', 'Config', 'cUtilCryptBase64'],
function (IdCodePageView, WalletModel, WalletStore, html, Util, Message, Config, cUtilCryptBase64) {
    var STRING = {
        PAGE_TITLE: '找回支付密码',
        NEED_HELP: '联系客服',
        CONFIRM: '  确定',
        DIALOG_TITLE: '无法找回支付密码，请联系携程客服以完成相关操作。',
        EXPLAIN: '说明',
        CANCEL: '取消'
    };

    var View = IdCodePageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        requestCode: null,
        headerBtn: { title: STRING.EXPLAIN, id: 'J_Explain', classname: 'explain' },
        commitHandler: {
            id: 'J_Explain', callback: function () {
                this.getCstMsg().showMessage(Message.get(112));
            }
        },
        events: {
            'click .J_Get-indentify-code': 'getIdentifyCode',
            'click .J_Submit': 'checkMobileAndPwd'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        /**
        * @description onload function
        */
        onShow: function (referer) {
            this.inherited(arguments);
            var that = this;

            this.loading.show();
            this.bIgnoreBackKey = false; //reset
            var checkModel = WalletModel.WalletAccountCheck.getInstance();
            checkModel.param.optype = 8;
            checkModel.exec({
                suc: function (info) {
                    that.procRcCode(info, true, true);
                    if (info.rc == 0) {
                        that.render();
                    } else {
                        that.loading.hide();
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
        render: function () {
            var that = this;
            this.loading.show();
            var userModel = WalletModel.WalletUserInfoSearch.getInstance();
            userModel.param = {};
            userModel.param.reqbmp = 0; //all;
            userModel.exec({
                suc: function (userData) {
                    if (userData.mobile != '') {
                        this.requestCode = 22;
                    } else {
                        this.requestCode = 23;
                    }
                    var t = _.template(that.tpl, userData);
                    that.$el.html(t);
                    that.bindIDCodeEvent();
                    that.turning();
                    setTimeout(function () {
                        that.getIdentifyCode();
                    }, 100);
                },
                fail: this.onModelExecFail,
                scope: this
            });
        },
        /**
        * @description reset pass word and go next
        */
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
            var idCode = this.$el.find('.J_Indentify').val();
            var newPsd = this.$el.find('.J_NewPsd').val();
            this.loading.show();
            var accModify = WalletModel.WalletAccountModify.getInstance();
            accModify.param.newinfo = cUtilCryptBase64.Base64.encode(newPsd);
            accModify.param.newvcode = idCode;
            accModify.param.reqtype = this.requestCode;
            accModify.exec({
                suc: function (info) {
                    that.procRcCode(info, true);
                    that.loading.hide();
                    if (info.rc == 0) {
                        that.showToast(Message.get(104), function () {
                            that.returnHandler();
                        });
                    }
                },
                fail: function (data) {
                    that.onModelExecFailAsync(data, 320);
                },
                scope: this
            })
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