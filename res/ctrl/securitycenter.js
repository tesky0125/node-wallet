/**
 * @author luzx
 * @desc:  Wallet V5.7
 */

define(['WalletPageView', 'WalletModel', 'WalletStore', 'text!securitycenter_html', 'Config', 'Util', 'Message', 'FingerHelper', 'CacheData', 'ModelObserver'],
    function(WalletPageView, WalletModel, WalletStore, html, Config, Util, Message, FingerHelper, CacheData, ModelObserver) {
        var udf;
        var STRING = {
            PAGE_TITLE: '安全中心',
            PSD_ALERT_TITLE: '您尚未设置支付密码，请先进行设置，才能使用携程钱包相关功能。',
            PHONE_ALERT_TITLE: '您尚未设置安全验证手机，请先进行设置，才能使用携程钱包相关功能。',
            CANCEL: '取消',
            GO_SETTING: '去设置',
            CONTACT_SERVICE: '联系客服',
            FIND_PAY_PSD: '找回支付密码',
            MODIFY_MOBILE: '修改安全验证手机',
            CONFIRM: "确定"
        };

        var flDiv = '' +
            '<div style="position:fixed;bottom:0; left:0;z-index:100000;width:100%">' +
            '<div class="p10"><button class="J_BottomDivBtn1 btn white">1</button><button class="J_BottomDivBtn2 btn back mt10">1</button></div>' +
            '</div>';

        var userInfoSearchModel = WalletModel.WalletUserInfoSearch.getInstance();
        var userInfoCheckModel = WalletModel.WalletUserInfoCheck.getInstance();
        var formPageStore=WalletStore.SetPageStore.getInstance();
        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            /*
             supportFinger=0 支持指纹验证并且设置过指纹
             supportFinger=1 支持指纹验证但是未设置过指纹
             supportFinger=2 不支持指纹验证
             */
            supportFinger: 2,
            safeMapping: {
                0: 0,
                1: 1,
                2: 2,
                3: 3
            },
            events: {
                'click .J_Unverify-auth': 'goVerifyAuth',
                'click .J_Verified-auth': 'goVerifyAuth',
                'click .J_Verifing-auth': 'goVerifyAuth',
                'click .J_Reset-pay-password': function () {
                    var that = this;
                    this.showBottomDialog({
                        btnOneText: STRING.FIND_PAY_PSD,
                        btnTwoText: STRING.CANCEL,
                        btnOneEvent: _.bind(function (mask) {
                            mask.hide();
                            that.goPsd('resetpaypsd');
                        }, this),
                        btnTwoEvent: _.bind(function (mask) {
                            mask.hide();
                        }, this)
                    });
                },
                'click .J_Set-pay-password': function () {
                    this.forward('setpaypsd2');
                },
                'click .J_Set-security-mail': 'setSecurityMail',
                'click .J_Set-security-mobile': function () {
                    this.goMobile('verfiedpsd?path=setsecuritymobile');
                },
                'click .J_Set-security-portable': 'setSecurityPortable',
                'click .J_Modify-security-mobile': function () {
                    var that = this;
                    this.showBottomDialog({
                        btnOneText: STRING.MODIFY_MOBILE,
                        btnTwoText: STRING.CANCEL,
                        btnOneEvent: _.bind(function (mask) {
                            mask.hide();
                            that.goMobile('verfiedpsd?path=modifysecuritymobile');
                        }, this),
                        btnTwoEvent: _.bind(function (mask) {
                            mask.hide();
                        }, this)
                    });
                },
                'click .J_Securitylevel': 'securityGuide',
                'click .J_HasSetFinger': function () {
                    FingerHelper.goFingerSetting(this, this.userInfo);
                },
                'click .J_SetFinger': function () {
                    FingerHelper.goFingerSetting(this, this.userInfo);
                }
            },
            onCreate: function () {
                this.inherited(arguments);
            },
            onShow: function () {
                this.inherited(arguments);

                var that = this;
                this.loading.show();

                this.userInfo = {};
                var udf, isUvsOpen = CacheData.getIsUvsOpen();
                if (isUvsOpen === udf) {
                    //loading user check
                    userInfoCheckModel.param.reqtype = '25';
                    userInfoCheckModel.exec({
                        suc: this._cbCheckAccSuc,
                        scope: this
                    });
                } else {
                    this.userInfo.isUvsOpen = isUvsOpen;
                    this._loadingMoreData();
                }


            },
            _cbCheckAccSuc: function (data) {
                if (data.rc != 0) {
                    this.procRcCode(data);
                } else {
                    var flags = data.rflag.split('|');

                    if (flags[0] == '2') {
                        this.userInfo.isUvsOpen = true;
                        CacheData.setIsUvsOpen(true);
                    } else {
                        this.userInfo.isUvsOpen = false;
                        CacheData.setIsUvsOpen(false);
                    }
                    this._loadingMoreData();
                }
            },
            showBottomDialog: function (obj) {
                var that = this;
                this.mask = this.getCstMsg();
                this.mask.showMessage(flDiv, true);
                var btn1 = $('.J_BottomDivBtn1');
                var btn2 = $('.J_BottomDivBtn2');

                btn1.html(obj.btnOneText);
                btn1.one('click', function () {
                    obj.btnOneEvent && obj.btnOneEvent(that.mask);
                });

                btn2.html(obj.btnTwoText);
                btn2.one('click', function () {
                    obj.btnTwoEvent && obj.btnTwoEvent(that.mask);
                })
            },
            _loadingMoreData: function () {
                //loading userinfo and render
                var that = this;
                ModelObserver.register({
                    showLoading: true,
                    scope: this,
                    refresh: true,
                    model: 'WalletUserInfoSearch',
                    param: {
                        reqbmp: 0
                    },
                    cbSuc: function(info) {
                        //save data for later use
                        _.extend(that.userInfo, info);
                        that.procRcCode(info);

                        if (!userInfoSearchModel.hasUserData() || !userInfoSearchModel.hasPwdData()) {
                            that.showToast(Message.get(123), _.bind(that.returnHandler, that));
                            return;
                        }
                        CacheData.setIsHasPwd(info.haspwd == 1);
                        CacheData.setIsRealNamed(info.authstatus == 1);
                        CacheData.setIsFreezed(info.userstatus == 2);

                        if (Config.IS_INAPP) {
                            if (!Util.isRootedDevice()) {
                                FingerHelper.callFingerMethod(1000, function (rc) {
                                    if (rc.resultCode != null) {
                                        that.supportFinger = rc.resultCode;
                                    }
                                    that.render();
                                });
                            } else {
                                that.render();
                            }
                        } else {
                            that.render();
                        }
                    },
                    cbFail: this.onModelExecFail,
                    cache: true
                });
            },
            render: function () {
                var that = this;
                /*
                 tpstatus = 0 未开通
                 tpstatus = 1 已经开通
                 */
                if (!Config.MOCK_SERVICE_CALL && (!Config.IS_INAPP || that.supportFinger == 2)) {
                    that.userInfo.tpstatus = 2;
                }

                var t = _.template(that.tpl, that.userInfo);
                that.$el.html(t);

                that.safeLevel = that.$el.find('.J_Securitylevel');
                that.showSafeLevel(that.userInfo.seclevel);
                that.turning();

                var verStore = WalletStore.Verification.getInstance();
                var mobileChanged = verStore.getAttr('secmobileChanged');
                if (mobileChanged == 1) {
                    that.showToast(Message.get(113).replace('{1}', that.userInfo.secmobile));
                    verStore.setAttr('secmobileChanged', 0);
                }

                FingerHelper.toastFingerOperationResult(that);
            },
            securityGuide: function () {
                var that = this;
                var info = this.userInfo;
                var attr = {
                    title: '',
                    forward: ''
                };
                if (info.mobile == udf || info.mobile == "") {
                    attr = {
                        title: STRING.PHONE_ALERT_TITLE,
                        forward: 'verfiedpsd?path=setsecuritymobile'
                    }
                }

                if (!info.haspwd) {
                    attr = {
                        title: STRING.PSD_ALERT_TITLE,
                        forward: 'setpaypsd2'
                    }
                }

                if (attr.title == '') {
                    return true;
                }

                that.showDlg({
                    message: attr.title,
                    buttons: [{
                        text: STRING.CANCEL,
                        click: function () {
                            this.hide();
                        }
                    }, {
                        text: STRING.GO_SETTING,
                        click: function () {
                            this.hide();
                            that.forward(attr.forward);
                        }
                    }]
                });
                return;
            },
            goPsd: function (forward) {
                var that = this;
                var info = this.userInfo;

                if (info.mobile != '' || info.email != '') {
                    this.forward(forward);
                } else {
                    this.showDlg({
                        message: STRING.PHONE_ALERT_TITLE,
                        buttons: [{
                            text: STRING.CANCEL,
                            click: function () {
                                this.hide();
                            }
                        }, {
                            text: STRING.CONTACT_SERVICE,
                            click: function () {
                                this.hide();
                                Util.callPhone(Config.SERVICE_TEL_NUMBER);
                            }
                        }]
                    });
                }
            },
            goMobile: function (forward) {
                var that = this;
                var info = this.userInfo;

                if (info.haspwd) {
                    that.forward(forward);
                } else {
                    that.showDlg({
                        message: STRING.PSD_ALERT_TITLE,
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
                }
            },
            //returnHandler: function () {
                //if (this.tokenInfoView && this.tokenInfoView.from) {
                //    this.jump2TokenUrl(this.tokenInfoView.from);
                //    this.tokenInfoView = undefined; //clear ret page after used
                //    return true;
                //}
                //if (this.getEntryView() == 'securitycenter') {
                //    if (Config.IS_APPH5) {
                //        this.exitWalletModule();
                //    } else {
                //        this.back('index');
                //    }
                //    return true;
                //}
                //if (this.retPage) {
                //    this.back(decodeURIComponent(this.retPage));
                //    return true;
                //}

                //var tk = Util.getTokenInfoStore();
                //if (tk && tk.from && tk.entryLast == 'securitycenter') {
                //    this.jump2TokenUrl(tk.from);
                //    return true;
                //}
                //if (tk && tk.entryLast == 'index') {
                //    this.back('index');
                //    return true;
                //}
                //this.back('index');
                //return true;
            //},
            showSafeLevel: function (level) {
                if (typeof level == 'undefined') {
                    return;
                }
                this.safeLevel.hide();
                $(this.safeLevel[this.safeMapping[level]]).show();
            },
            goVerifyAuth: function () {
                var freezed = CacheData.getIsFreezed();
                if (freezed) {
                    this.showDlg({
                        message: Message.get(114),
                        buttons: [{
                            text: STRING.CONFIRM,
                            click: function () {
                                this.hide();
                            }
                        }]
                    });
                    return;
                }
                formPageStore.setAttr('rmFromPage','securitycenter')
                this.forward('accountverified');
            }
        });

        return View;
    });
