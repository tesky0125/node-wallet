/**
* @author wxm
* @desc:  Wallet V6.5
*/

define(['WalletModel', 'WalletStore', 'Config', 'Util', 'Message', 'CacheData'],
function (WalletModel, WalletStore, Config, Util, Message, CacheData) {
    var STRING = {
        PSD_ALERT_TITLE: '您尚未设置支付密码，请先进行设置，才能使用携程钱包相关功能。',
        FINGER_PSD_ALERT_TITLE: '您尚未设置支付密码，设置后才能开通指纹支付',
        FINGER_PHONE_ALERT_TITLE: '您尚未设置安全验证手机，设置后才能开通指纹支付',
        CANCEL: '取消',
        GO_SETTING: '去设置',
        FINGER_ALERT: '您尚未在本设备设置指纹，请先前往设置',
        CLOSE: '关闭',
        HELP: '查看帮助',
        CONFIRM: '确定',
        FREEZE_ALERT: '您的账户处于冻结状态，目前无法操作，如需帮助请联系携程客服。'
    };

    var cHybridShell;
    Config.IS_INAPP && (cHybridShell = require('cHybridShell'));//

    return {
        /**
        * @description this function will call local api about finger mark.
        *
        */
        callFingerMethod: function (id, cback, para) {
            if (!Config.IS_INAPP) {//
                cback({ resultCode: 0 });
                return;
            }
            var shell = new cHybridShell.Fn("do_business_job", function (jsonobj) {
                var rc;
                if (typeof jsonobj.resultCode != 'undefined') {
                    rc = jsonobj;
                } else {
                    rc = null;
                }

                return cback(rc);
            });

            para = para || {};

            shell.run(4, "11000", {
                businessType: id,
                token: para.token || '',
                fallbacktitle: para.fallbacktitle || '',
                reason: para.reason || '',
                privateKey: para.privateKey || '',
                secretKeyGUID: para.secretKeyGUID || '',
                deviceGUID: para.deviceGUID || ''
            })
        },
        callPayMethod: function (cback, param) {
            if (!Config.IS_INAPP) {//
                cback({ resultCode: 0 });
                return;
            }
            var shell = new cHybridShell.Fn("do_business_job", function (jsonobj) {
                var rc;
                if (typeof jsonobj.resultCode != 'undefined') {
                    rc = jsonobj;
                } else {
                    rc = null;
                }

                return cback(rc);
            });

            param = param || {};

            shell.run(4, "13001", {
                scene: param.scene, //0：绑卡操作 1: 设置操作
                verifytype: param.verifytype, //0: 无验证 1：支付密码验证 2：指纹验证
                pwd: param.pwd || '', //支付密码
                token: param.token || '', //RSA加密后的Token
                status: param.status //0：进行了设置有更新；1：没有进行设置
            });

        },
         /*new  Quick payment verification
        businessCode:服务号
        businessType:当前操作类型
        param:传入参数
        */
        appCheckPwd: function (businessCode, cback,  param) {
             if (!Config.IS_INAPP) {//
                cback(0)
            }
            //调用bridge.js中指纹验证函数
            var _params = {
                businessType:param.businessType||'',//
                scene: param.scene,//0：使用密码验证1：使用指纹验证
                reason: param.reason||'',//指纹验证Alert给用户看的提示语
                pwdreason:param.pwdreason||'',//密码验证时的提示文案
                fallbacktitle:param.fallbacktitle||'',//scene为1有效，businessType=1001,指纹验证Alert，取消按钮左边的按钮标题
                privateKey:param.privateKey||'',//businessType=1002秘钥
                secretKeyGUID:param.secretKeyGUID||'',//businessType=1002秘钥GUID
                deviceGUID:param.deviceGUID||'',//businessType=1002设备标识
                token:param.token//businessType=1003安全码
            }, stype = businessCode;
            var fn = new cHybridShell.Fn('do_business_job', function (jsonobj) {
                var rc;
                 if (typeof jsonobj.resultCode != 'undefined') {
                    rc = jsonobj;
                } else {
                    rc = null;
                }
                return cback(rc);
            });
            //params@1: businessType: 4 支付用通道
            //params@2: businessCode: 11000 指纹支付通道
            //params@3: _params: 指纹支付参数
            fn.run(4, stype, _params);
        },
        toastFingerOperationResult: function (view) {
            var fingerStore = WalletStore.FingerMark.getInstance();
            var fingermarkSuccess = fingerStore.getAttr('fingerMarkFlag');
            if (fingermarkSuccess != null) {
                switch (fingermarkSuccess) {
                    //open success
                    case 0: view.showToast(Message.get(117)); break;
                        //open fail
                    case 1: view.showToast(Message.get(347)); break;
                        //close success
                    case 2: view.showToast(Message.get(119)); break;
                        //close fail
                    case 3: view.showToast(Message.get(348)); break;
                }
                fingerStore.setAttr('fingerMarkFlag', null);
            }
        },
        goFingerSetting: function (view, accountInfo) {
            var that = this;
            if (Config.IS_INAPP) {//
                this.callFingerMethod(1000, function (rc) {
                    //supportFinger=0 支持指纹验证并且设置过指纹
                    //supportFinger=1 支持指纹验证但是未设置过指纹
                    //supportFinger=2 不支持指纹验证
                    that._shellCallback(view, accountInfo, rc);
                });
            } else {
                if (Config.MOCK_FINGER_SUPPORT) {
                    that._shellCallback(view, accountInfo, {});
                }
            }
        },
        _shellCallback: function (view, accountInfo, rc) {
            this.supportFinger = rc.resultCode;
            this.tpstatus = accountInfo.tpstatus;

            if (Config.MOCK_FINGER_SUPPORT) {
                //支持指纹 + 设置过指纹 + 未开通
                this.supportFinger = 0;
                this.tpstatus = 0;

                //支持指纹 + 未设置过指纹 + 未开通
                //this.supportFinger = 1;
                //this.tpstatus = 0;

                //支持指纹 + 设置过指纹 + 已开通
                //this.supportFinger = 0;
                //this.tpstatus = 1;
            }

            //tpstatus: 指纹开通状态
            //0：未开通；
            //1：已开通；
            if (this.tpstatus == 0) {
                this._setFingerMark(view, accountInfo);
            } else if (this.tpstatus == 1) {
                this._cancelFingerMark(view);
            }
        },
        _cancelFingerMark: function (view) {
            var that = view;
            that.forward('cancelfinger');
        },
        _setFingerMark: function (view, accountInfo) {
            var that = view;

            if (this.supportFinger == 1) {
                that.showDlg({
                    message: STRING.FINGER_ALERT,
                    buttons: [{
                        text: STRING.CLOSE,
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: STRING.HELP,
                        click: function () {
                            this.hide();
                            that.forward('howtosetfinger');
                        }
                    }]
                });
                return;
            }

            if (accountInfo.userstatus == 2) {
                that.showDlg({
                    message: STRING.FREEZE_ALERT,
                    buttons: [{
                        text: STRING.CONFIRM,
                        click: function () {
                            this.hide();
                        }
                    }]
                });
                return;
            }

            if (!accountInfo.haspwd) {
                that.showDlg({
                    message: STRING.FINGER_PSD_ALERT_TITLE,
                    buttons: [{
                        text: STRING.CANCEL,
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: STRING.GO_SETTING,
                        click: function () {
                            this.hide();
                            that.forward('setpaypsd2');
                        }
                    }]
                });
                return;
            }

            if (!(accountInfo.email || accountInfo.mobile)) {
                that.showDlg({
                    message: STRING.FINGER_PHONE_ALERT_TITLE,
                    buttons: [{
                        text: STRING.CANCEL,
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: STRING.GO_SETTING,
                        click: function () {
                            this.hide();
                            that.forward('verfiedpsd?path=setsecuritymobile');
                        }
                    }]
                });
                return;
            }

            CacheData.setFsBkPage(that.viewname);
            that.forward('enablefinger');
        }
    }
});

