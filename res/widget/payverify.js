/**
 * @author wwg
 * @desc:  Wallet V6.2
 */

define(['WalletModel', 'Util', 'Config', 'VerifySelect', 'FingerHelper', 'Scmg'],
    function(WalletModel, Util, Config, VerifySelect, FingerHelper, Scmg) {

        var STRING = {
            CANCEL: '取消',
            CONFIRM: '确认',
            CTRIP_PAYPSD: '输入支付密码',
            PROMPT_PAYPSD: '请输入携程支付密码，以完成身份验证',
            PROMPT_FINGER: '请验证您的指纹，以完成身份验证',
            FINGER_FAIL_TIP: '无法验证指纹，请使用携程支付密码完成支付',
            PSD_ALERT_TITLE: '无法设置支付密码，请联系携程客服以完成相关操作。',
            CONTACT_SERVICE: '联系客服',
            FIND_PSD: '忘记密码',
            RE_ENTER: '重新输入',
            FALL_BACK_TITLE: '输入密码'
        };

        var touchPayQueryModel = WalletModel.TouchPayQuery.getInstance();
        var touchPayVerifyModel = WalletModel.TouchPayVerify.getInstance();

        var verify = {
            /**
             * page 继承walletpageview 当前页面.
             * callback { success, failure, cancel, showAlert} 回调对象.
             * requesetid 可以为空
             */
            exec: function(page, callback, requesetid, letter) {

                this.payPsdPrompt = (letter && letter.payPsdPrompt) || STRING.PROMPT_PAYPSD;
                this.fingerPrompt = (letter && letter.fingerPrompt) || STRING.PROMPT_FINGER;
                this.fallbackTitle = (letter && letter.fallbackTitle) || STRING.FALL_BACK_TITLE;

                if (Config.IS_INAPP) { //
                    var _that = this;
                    if (!Util.isRootedDevice()) {
                        this.getDeviceData(function(rc) {
                            if (rc) {
                                touchPayQueryModel.param = {};
                                touchPayQueryModel.param.requestid = requesetid ? requesetid : '';
                                touchPayQueryModel.param.keyguid = rc.secretKeyGUID;
                                touchPayQueryModel.param.devguid = rc.deviceGUID;

                                _that.queryParams = touchPayQueryModel.param;

                                page.showLoading();
                                touchPayQueryModel.exec({
                                    scope: page,
                                    suc: function(data) {
                                        if (data && data.rc == 0) {
                                            if (data.tpstatus == 1) {
                                                _that.query = data; // 记录查询数据.

                                                var _token = _that.query.paytoken;
                                                //获取RSA加密后的toke
                                                FingerHelper.appCheckPwd(11000, function(rc) {
                                                    if (rc.resultCode == 0) {
                                                        _that.query.paytoken = rc.RSAToken;
                                                        _that._fingerValidate(page, callback);
                                                    } else if (rc.resultCode == 1) {
                                                        _that.query.paytoken = -1;
                                                        _that.resetKeyToken(page);
                                                    }
                                                }, {
                                                    token: _token,
                                                    businessType: 1003
                                                });
                                            } else {
                                                _that._psdValidata(page, callback);
                                            }

                                        } else {
                                            page.procRcCode(data, true);
                                        }
                                        page.hideLoading();
                                    },
                                    fail: function(data) {
                                        page.onModelExecFailAsync(data);
                                    }
                                });
                            } else {
                                _that._psdValidata(page, callback);
                            }
                        });
                    } else {
                        _that._psdValidata(page, callback);
                    }
                } else {
                    this._showPsdFloat(page, callback);
                    //this._goResetPsd(page);
                }
            },
            /*reset*/
            resetKeyToken: function(page) {
                var _that = this;
                touchPayVerifyModel.param = {};
                touchPayVerifyModel.param.requestid = _that.query.requestid;
                touchPayVerifyModel.param.keytoken = _that.query.paytoken;
                touchPayVerifyModel.param.keyguid = _that.queryParams.keyguid || -1;
                page.showLoading();
                touchPayVerifyModel.exec({
                    scope: page,
                    suc: function(data) {
                        page.hideLoading();
                        if (data && data.rc == 0) {} else {
                            page.procRcCode(data, true);
                        }
                    },
                    fail: function(data) {
                        page.onModelExecFailAsync(data);
                    }
                });
            },
            /*
             *Get device information
             */
            getDeviceData: function(callback) {
                FingerHelper.appCheckPwd(11000, function(rc) {
                    if (rc.resultCode == 0) {
                        callback(rc)
                    } else {
                        callback(0)
                    }
                }, {
                    businessType: 1004
                });
            },
            _psdValidata: function(page, callback) {
                var _that = this;
                FingerHelper.appCheckPwd(12000, function(rc) {
                    if (rc.verifyType == 0 && rc.resultCode == 0) {
                        var _data = {
                            verifytype: 1,
                            pwd: rc.pwd
                        };
                        Scmg.setV(_data.verifytype);
                        Scmg.setP(_data.pwd);
                        callback.success && callback.success.call(page, _data);
                    } else if (rc.resultCode == 1) {
                        //失败
                    } else if (rc.resultCode == 2) {
                        //取消
                        callback.cancel && callback.cancel.call(page);
                    } else if (rc.resultCode == 3) {
                        //用户点击忘记密码
                        _that._goResetPsd(page);
                    }
                }, {
                    scene: 0, //0：使用密码验证1：使用指纹验证
                    pwdreason: _that.payPsdPrompt
                })
            },
            /*
                重新设置密码
            */
            _goResetPsd: function(page) {
                var _that = this;
                var userModel = WalletModel.WalletUserInfoSearch.getInstance();
                page.loading.show();
                userModel.param = {};
                userModel.param.reqbmp = 0;
                userModel.exec({
                    suc: function(info) {
                        page.loading.hide();
                        page.procRcCode(info, true);
                        if (info.mobile != '' || info.email != '') {
                            page.forward('resetpaypsd');
                        } else {
                            page.showDlg({
                                message: STRING.PSD_ALERT_TITLE,
                                buttons: [{
                                    text: STRING.CANCEL,
                                    click: function() {
                                        this.hide();
                                    }
                                }, {
                                    text: STRING.CONTACT_SERVICE,
                                    click: function() {
                                        this.hide();
                                        Util.callPhone(Config.SERVICE_TEL_NUMBER);
                                    }
                                }]
                            });
                        }
                    },
                    scope: page
                })
            },

            _fingerValidate: function(page, callback) {
                callback.showAlert && callback.showAlert.call(page, 2); // 指纹验证弹框.

                var _that = this;

                FingerHelper.appCheckPwd(12000, function(rc) {
                    if (rc.resultCode == 0) {
                        //success
                        //验证指纹成功.
                    if(rc.verifyType==0){
                                var psdtype=1
                            }else{
                                var psdtype=2
                        }
                        var pwd=rc.pwd;
                        touchPayVerifyModel.param = {};
                        touchPayVerifyModel.param.requestid = _that.query.requestid;
                        touchPayVerifyModel.param.keytoken = _that.query.paytoken;

                        touchPayVerifyModel.param.keyguid = _that.queryParams.keyguid;
                        touchPayVerifyModel.param.devguid = _that.queryParams.devguid;
                        var verifytype=rc.verifyType;
                        page.showLoading();
                        touchPayVerifyModel.exec({
                            scope: page,
                            suc: function(data) {
                                page.hideLoading();
                                if (data && data.rc == 0) {
                                    // 成功后 返回数据 verifytype 1=密码验证， 2=指纹验证.
                                    // 可根据此标识(verifytype)区分后 分别获取所需字段.
                                    var _data = {
                                        verifytype: psdtype,
                                        paytoken: _that.query.paytoken,
                                        requestid: _that.query.requestid,
                                        keyguid: _that.queryParams.keyguid,
                                        devguid: _that.queryParams.devguid,
                                        pwd:pwd
                                    };
                                    Scmg.setV(_data.verifytype);
                                    if(_data.verifytype==1){
                                        Scmg.setP(pwd)
                                    }else{
                                        Scmg.setT({
                                        requestid: _that.query.requestid,
                                        keytoken: _that.query.paytoken,
                                        keyguid: _that.queryParams.keyguid,
                                        devguid: _that.queryParams.devguid
                                    });
                                    }
                                    callback.success && callback.success.call(page, _data);
                                } else {
                                    page.procRcCode(data, true);
                                }
                            },
                            fail: function(data) {
                                page.onModelExecFailAsync(data);
                            }
                        });
                    } else if (rc.resultCode == 1) {
                        //app fail验证失败
                        _that._fingerFailAlert.call(_that, page, callback);

                        //callback.failure && callback.failure.call(page);
                    } else if (rc.resultCode == 2) {
                        //app cancel用户取消指纹验证
                        callback.cancel && callback.cancel.call(page);
                    } else if (rc.resultCode == 3) {
                        //用户点击输入密码
                        _that._goResetPsd(page);
                    }
                }, {
                    scene: 1, //0：使用密码验证1：使用指纹验证
                    reason: _that.fingerPrompt,
                    //reason: this.fingerPrompt,
                    pwdreason: _that.payPsdPrompt,
                    fallbacktitle: _that.fallbackTitle
                });
            },
            _showPsdFloat: function(page, callback) {

                callback.showAlert && callback.showAlert.call(page, 1); // 密码验证弹框.

                page.psd.show({
                    title: STRING.CTRIP_PAYPSD,
                    content: this.payPsdPrompt,
                    confirmText: STRING.CONFIRM,
                    cancelText: STRING.CANCEL,
                    context: page,
                    success: function(pwd) {
                        var _data = {
                            verifytype: 1,
                            pwd: pwd
                        };
                        Scmg.setV(_data.verifytype);
                        Scmg.setP(_data.pwd);
                        callback.success && callback.success.call(page, _data);
                    },
                    cancel: function() {
                        callback.cancel && callback.cancel.call(page);
                    }
                });
            },
            _fingerFailAlert: function(page, callback) {
                var _that = this;
                page.showDlg({
                    message: STRING.FINGER_FAIL_TIP,
                    buttons: [{
                        text: STRING.CONFIRM,
                        click: function() {
                            this.hide();
                            _that._psdValidata(page, callback);
                        }
                    }]
                });
            }
        };

        return verify;
    });