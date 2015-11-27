/**
* @module veriedpsd
* @author luzx
* @description verfied password
* @version since Wallet V5.7
*/

define(['WalletPageView', 'WalletModel', 'WalletStore', 'VirtualKeyBoard', 'Util', 'text!verfiedpsd_html', 'Message', 'Config', 'WalletResk', 'cUtilCryptBase64', 'Scmg'],
function (WalletPageView, WalletModel, WalletStore, VirtualKeyBoard, Util, html, Message, Config, WalletResk, cUtilCryptBase64, Scmg) {
    var STRING = {
        VER_PAGE_TITLE: '验证支付密码',
        MODIFY_TEL_PAGE_TITLE: '修改安全验证手机',
        PSD_ALERT_TITLE: '无法设置支付密码，请联系携程客服以完成相关操作。',
        CANCEL: '取消',
        CONTACT_SERVICE: '联系客服',
        WITHDRAW_EXPLAIN: '提现￥{1} 到 {2}{3}（卡号 {4}）',
        SET_MOBILE_EXPLAIN: '请输入支付密码',
        MODIFY_MOBILE_EXPLAIN: '需验证支付密码，请输入',
        FINGER_EXPLAIN: '开通“指纹支付”需验证支付密码',
        REINPUT: '重新输入',
        FORGET_PSD: '忘记密码',
        CONFIRM: '确定'

    };

    var psdInputHtml = '<input type="tel" maxlength="6" class="J_Widget_VerfiedpsdInput" style="margin-left:-2000px;position:absolute;top:0">'; //

    var accountVerfiedpsd = {
        render: function () {
            var path = this.getQuery('path'); ;
            var explain;
            if (path == 'setsecuritymobile') {
                this.resetHeaderView({
                    title: STRING.VER_PAGE_TITLE
                });
                explain = STRING.SET_MOBILE_EXPLAIN;
            } else if (path == 'modifysecuritymobile') {
                this.resetHeaderView({
                    title: STRING.MODIFY_TEL_PAGE_TITLE
                });
                explain = STRING.MODIFY_MOBILE_EXPLAIN;
            }
            this.$el.html(_.template(html, { path: path, explain: explain }));
            this.renderInit();
            this.turning();
        },
        onKeyBoardChange: function (input) {
            this.refreshkTarget(input);
        },
        onKeyBoardFinish: function (input) {
            $psdInput && $psdInput.blur();
            this.verfiedPsd(_.bind(this.goNext, this));
        }
    };
    var WithdrawCardStore = WalletStore.WithdrawCard.getInstance();

    var fingerVerfiedpsd = {
        render: function () {
            var that = this;

            var data = {
                path: 'finger',
                explain: STRING.FINGER_EXPLAIN
            };

            this.resetHeaderView({
                title: STRING.VER_PAGE_TITLE
            });

            this.$el.html(_.template(html, data));
            this.renderInit();
            this.turning();
        },
        onKeyBoardChange: function (input) {
            this.refreshkTarget(input);
            if (input.length == 6) {
                this.$el.find('.J_NextBtnFinger').removeClass('gray');
            } else {
                this.$el.find('.J_NextBtnFinger').addClass('gray');
            }
        },
        onKeyBoardFinish: function () { }
    };

    var withdrawVerfiedpsd = {
        render: function () {
            var that = this;
            var amount = Util.parseMoney(WithdrawCardStore.getAttr('amount'));
            var bankname = WithdrawCardStore.getAttr('bankname');
            var cardtypeUI = WithdrawCardStore.getAttr('cardtypeUI');
            var cardno = Util.parseCard(WithdrawCardStore.getBase64('cardno'));

            var explain = Util.formatStr(STRING.WITHDRAW_EXPLAIN, amount, bankname, cardtypeUI, cardno);

            var data = {
                path: 'withdraw',
                explain: explain
            };

            this.resetHeaderView({
                title: STRING.VER_PAGE_TITLE
            });

            this.$el.html(_.template(html, data));
            this.renderInit();
            this.turning();
        },
        onKeyBoardChange: function (input) {
            this.refreshkTarget(input);
            if (input.length == 6) {
                this.$el.find('.J_NextBtn').removeClass('gray');
            } else {
                this.$el.find('.J_NextBtn').addClass('gray');
            }
        },
        onKeyBoardFinish: function () { }
    };
    var $psdInput;
    var exports = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        tel: true,
        keyBoardMaxLength: 6,
        events: {
            'click .J_MissPsd': 'goResetPsd',
            'click .J_NextBtn': 'confirmWithdraw',
            'click .J_NextBtnFinger': 'goNextFinger'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        checkSupportSysKeyboard: function () {
            return !Util.isUCBrowser();
        },
        /**
        * @description confirm with draw and go next
        */
        confirmWithdraw: function () {
            var that = this;
            var psd = this.getValue();
            if (!this.$el.find('.J_NextBtn').hasClass('gray')) {
                ///WithdrawCardStore.setBase64('paypwd', psd);
                Scmg.setP64(psd);
                Scmg.setV(1);
                var ret = WalletResk.exec(this,
                function (ret) {
                    ret();
                });
            }
        },
        onShow: function () {
            this.inherited(arguments);
            var that = this;

            var path = this.getQuery('path'); ;
            //inject defierence pageview
            if (path == 'withdraw') {

                Util.mix(this, withdrawVerfiedpsd);
            } else if (path == 'finger') {

                Util.mix(this, fingerVerfiedpsd);
            } else {

                Util.mix(this, accountVerfiedpsd);
            }

            if (path == 'finger') {
                this.resetHeaderView({
                    tel: false
                });
            } else {
                this.resetHeaderView({
                    tel: true
                });
            }

            this.supportSysKeyboard = this.checkSupportSysKeyboard();
            if (this.supportSysKeyboard) {
                var $t = $('.J_Widget_VerfiedpsdInput');
                if ($t[0]) {
                    $psdInput = $t;
                } else {
                    $('body').append(psdInputHtml);
                    $psdInput = $('.J_Widget_VerfiedpsdInput');
                }
                $psdInput.focus();
            } else {
                this.virtualKeyBoard = new VirtualKeyBoard({
                    onFinish: _.bind(this.onKeyBoardFinish, this),
                    onChange: _.bind(this.onKeyBoardChange, this),
                    maxLength: this.keyBoardMaxLength
                });
                this.virtualKeyBoard.show();
            }
            this.render();
            this.bindEvent();

            //fix bug that onhide function will be called after forwarding page calling turning, its kind of framework bug.
            $(window).on('hashchange', $.proxy(this.hasChanged, this));
        },
        /**
        * @description if haschanged, trigger onhide function.
        */
        hasChanged: function () {
            if (location.href.indexOf('#verfiedpsd') == -1) {
                this.onHide();
            }
        },
        /**
        * @description go reset psd page
        */
        goResetPsd: function () {
            var that = this;
            var userModel = WalletModel.WalletUserInfoSearch.getInstance();
            this.loading.show();
            userModel.param = {};
            userModel.param.reqbmp = 0; //all；
            userModel.exec({
                suc: function (info) {
                    that.loading.hide();
                    that.procRcCode(info);
                    if (info.mobile != '' || info.email != '') {
                        that.forward('resetpaypsd');
                    } else {
                        that.showDlg({
                            message: STRING.PSD_ALERT_TITLE,
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
                fail: this.onModelExecFail,
                scope: this
            });
        },
        getValue: function () {
            if (this.supportSysKeyboard) {
                return $psdInput.val();
            } else {
                return this.virtualKeyBoard.getValue();
            }
        },
        bindEvent: function () {
            var that = this;
            if (this.supportSysKeyboard) {
                $psdInput.unbind().on('input', function () {
                    var val = $(this).val();
                    var s = val.split('');
                    that.refreshkTarget(s);
                    that.onKeyBoardChange.call(that, val);
                    if (s.length == 6) {
                        that.onKeyBoardFinish.call(that, val);
                    }
                });

                this._kTarget.unbind().on('click', function () {
                    $psdInput.focus();
                })
            }
        },
        onHide: function () {
            this.inherited(arguments);
            if (this.supportSysKeyboard) {
                $psdInput.blur();
            } else {
               // this.virtualKeyBoard.hide();
            }
            this.clean();

            $(window).off('hashchange', $.proxy(this.hasChanged, this));
        },
        renderInit: function () {
            // this.$el.find('.J_KeyBoardContainer').replaceWith(this.virtualKeyBoard.getTemplate());
            this._kTarget = this.$el.find(".J_Vertual-target");
            this._kTargetNums = this._kTarget.find("li");
        },
        clean: function () {
            this.virtualKeyBoard && this.virtualKeyBoard.clean();
            $psdInput && $psdInput.val('');
            this.refreshkTarget([]);
            var fingerBtn = this.$el.find('.J_NextBtnFinger');
            if (fingerBtn) {
                fingerBtn.addClass('gray');
            }

            var nextBtn = this.$el.find('.J_NextBtn');
            if (nextBtn) {
                nextBtn.addClass('gray');
            }
        },
        refreshkTarget: function (input) {
            for (var i = 0; i < this.keyBoardMaxLength; i++) {
                if (i < input.length) {
                    $(this._kTargetNums[i]).addClass('iconmima');
                } else {
                    $(this._kTargetNums[i]).removeClass("iconmima");
                }
            }
        },
        /**
        * @description verfied psd.
        */
        verfiedPsd: function (callback) {
            if (this.verfiedSending) {
                return;
            }
            var that = this;
            var psd = this.getValue();
            this.loading.show();
            var verificationStore = WalletStore.Verification.getInstance();
            var checkModel = WalletModel.WalletAccountCheck.getInstance();
            checkModel.param.optype = 3;
            checkModel.param.accinfo = cUtilCryptBase64.Base64.encode(psd);

            this.verfiedSending = true;
            checkModel.exec({
                suc: function (info) {
                    that.verfiedSending = false;
                    that.loading.hide();
                    //that.procRcCode(info, true);
                    if (info.rc == 0) {
                        ///verificationStore.setBase64({ 'paypsd': psd });
                        Scmg.setV(1);
                        Scmg.setP64(psd);
                        callback();
                    } else {
                        that.clean.call(that);
                        if (info.desc == 0) {
                            that.showDlg({
                                message: info.rmsg,
                                buttons: [{
                                    text: STRING.CONFIRM,
                                    click: function () {
                                        this.hide();
                                        that.back('securitycenter');
                                    }
                                }]
                            });
                        } else {
                            that.showDlg({
                                message: info.rmsg,
                                buttons: [{
                                    text: STRING.REINPUT,
                                    click: function () {
                                        this.hide();
                                        if (that.supportSysKeyboard) {
                                            $psdInput.focus();
                                        }
                                    }
                                }, {
                                    text: STRING.FORGET_PSD,
                                    click: function () {
                                        this.hide();
                                        that.forward('resetpaypsd');
                                    }
                                }]
                            });
                        }
                    }
                },
                fail: function (data) {
                    that.verfiedSending = false;
                    that.onModelExecFailAsync(data, 330);
                },
                scope: this
            })
        },
        goNextFinger: function () {
            if (this.$el.find('.J_NextBtnFinger').hasClass('gray')) {
                return;
            }

            this.verfiedPsd(_.bind(function () {
                this.forward('fingersendcode');
            }, this));
        },
        goNext: function () {
            var path = this.getQuery('path');
            this.forward(path);
        }
    });
    return exports;
});

