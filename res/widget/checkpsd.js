/**
 * @author chen.yun
 * @desc:  Wallet V6.10
 */
/**
 * @author wwg      Wallet V6.10
 * @description checkpsd
 */


define(['WalletModel', 'WalletStore', 'Util', 'Message', 'ModelObserver', 'CacheData','PayVerify','VerfiedpsdFloat', 'Scmg'], function(WalletModel, WalletStore, Util, Message, ModelObserver, CacheData,PayVerify,VerfiedpsdFloat,Scmg) {
    var STRING = {
        CONFIRM: '知道了',
        CANCEL: '放弃',
        GO_SETTING: '去设置',
    }
    var setPsdStore = WalletStore.SetPsdStore.getInstance();
    function GoVerifyPwd(options) {
        this.psdStore=options.psdStore;
        this.sucCallBack=options.sucCallBack;
        this.page=options.page;
        this.psdStyle=options.psdStyle||1;
        this.model={};
    };

    GoVerifyPwd.prototype = {
        goVerifyPwd: function() {
            var that = this;
            if (typeof(this.model.userstatus) == 'undefined' || typeof(this.model.haspwd) == 'undefined') {
                this._userinfoSearchExec(function() {
                    that._verfiedStatusPwd(function() {
                        that._psdPayVerify();
                    });
                });
            } else {
                this._verfiedStatusPwd(function() {
                    that._psdPayVerify();
                });
            }
        },
        _psdPayVerify: function(cbPaySuccess) {
            var that=this;
            PayVerify.exec(this.page, {
                success: function(data) {
                    //  that.psdStore.setAttr('verifytype', data.verifytype);
                    // if (data.verifytype == 1) {
                    //      ///that.psdStore.setAttr('pwd', data.pwd);
                    //      Scmg.setP(data.pwd);
                    // } else {
                    //      that.psdStore.setAttr('requestid', data.requestid);
                    //      ///that.psdStore.setAttr('paytoken', data.paytoken);
                    //      Scmg.setT(data.paytoken);
                    //      that.psdStore.setAttr('keyguid', data.keyguid);
                    //      that.psdStore.setAttr('devguid', data.devguid);
                    // }
                    that.sucCallBack && that.sucCallBack.call(this)
                },
                failure: function() {},
                cancel: function() {}
            });
        },
        _verfiedStatusPwd: function(cbVerifyHasPwd) {
            var that = this;
            if (this.model.userstatus == 2) { //freezed
                this.page.showDlg({
                    message: Message.get(378),
                    buttons: [{
                        text: STRING.CONFIRM,
                        click: function() {
                            this.hide();
                        }
                    }]
                });
                return;
            } else {
                if (!this.model.haspwd) {
                    this.page.showDlg({
                        message: Message.get(380),
                        buttons: [{
                            text: STRING.CANCEL,
                            click: function() {
                                this.hide();
                            }
                        }, {
                            text: STRING.GO_SETTING,
                            click: function() {
                                this.hide();
                                setPsdStore.setAttr('psdStyle',that.psdStyle);//密码框样式文案1：老的，2：实名认证样式一样
                                setPsdStore.setAttr('retPage',Util.getViewName());
                                that.page.forwardWithRetView('setpaypassword2?source=1&type='+that.psdStyle, Util.getViewName()); //TODO check setpaypassword
                            }
                        }]
                    });
                } else {
                    cbVerifyHasPwd && cbVerifyHasPwd();
                }
            }
        },
        _userinfoSearchExec: function(cbUserinfoSearchSucc) {
            this.page.loading.show();
            ModelObserver.register({
                scope: this,
                refresh: true,
                model: 'WalletUserInfoSearch',
                param: {
                    reqbmp: 0
                },
                cbFail: function(data) {
                    this.bUserInfoReturned = true;
                    this.page.onModelExecFailAsync(data);
                },
                cbSuc: function(data) {
                    this.page.loading.hide();
                    this.bUserInfoReturned = true;
                    if (data.haspwd == 1) {
                        CacheData.setIsHasPwd(true); //save for other page use
                    }
                    //save data for later use
                    this.model.haspwd = data.haspwd;
                    this.model.userstatus = data.userstatus;

                    cbUserinfoSearchSucc && cbUserinfoSearchSucc();
                }
            });
        },
        setSucCallBack:function(callback){
            this.sucCallBack=callback;
        }
    };


    return GoVerifyPwd;
});