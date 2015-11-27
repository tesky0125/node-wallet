/**
* @module veriedpsdfloat
* @author luzx
* @description its a global widgit. you can inherited walletpageview and call it 'this.psd.show'
* If your brower not UC, it will show system keyboard. Otherwise a self paint key board written by html will be show.
* @version since Wallet V5.8
*/

define(['WalletModel', 'Util', 'Message', 'Config', 'cUtilCryptBase64', 'CustomMessage', 'VirtualKeyBoard'],
function (WalletModel, Util, Message, Config, cUtilCryptBase64, CustomMessage, VirtualKeyBoard) {

    var STRING = {
        CONFIRM: '确定',
        CANCEL: '取消',
        PSD_ALERT_TITLE: '无法设置支付密码，请联系携程客服以完成相关操作。',
        CONTACT_SERVICE: '联系客服',
        FORGOTN_PSD: '忘记密码',
        REINPUT: '重新输入',
        FIND_PSD: '找回密码',
        CLOSED: '关闭'
    };

    var target = '' +
    '<div class="cui-pop-box J_Widget_VirtualTarget" style="background:#f6f6f6;position:absolute; top:25px; left:50%;margin-left:-150px;z-index:1000000">' +
    '<div class="cui-hd" style="background:#f6f6f6; color:#000; text-align: center; border-bottom:1px solid #bcbcbc;">{1}<span class="J_Widget_V_Forget blue fr font14" style="position:absolute; right:10px; top:2px;">忘记密码</span></div>' +
    '<div class="cui-bd">' +
    '<div class="cui-error-tips lh1" style="padding:10px; text-align:left;">{2}' +
    '<ul class="flexW mima mt10">' +
    '<li></li><li></li><li></li><li></li><li></li><li></li></ul>' +
    '</div>' +
        '<div class="cui-roller-btns" style="background:#f6f6f6;">' +
            '<div style="width:50%" class="cui-flexbd cui-btns-cancel J_Widget_V_Cancel">{3}</div><div style="width:50%" class="disable cui-flexbd cui-btns-sure J_Widget_V_Confirm">{4}</div>' +
        '</div>' +
    '</div>' +
    '</div>';

    var INPUT_MAX_LENGTH = 6;

    var psdInit = false;
    var $psdInput;
    var psdInputHtml = '<input type="tel" maxlength="6" class="J_Widget_VerfiedpsdInputFloat" style="margin-left:-2000px;position:absolute;top:0">'; //
    var $confirm;
    var $target;
    var inited = false;
    var baseContext;
    var exports = function () { };

    exports.prototype = {
        /**
        * @description init function .It shoule be init once when app create.
        */
        init: function (context) {
            if (!inited) {
                this.supportSysKeyboard = this.checkSupportSysKeyboard();
                if (this.supportSysKeyboard) {
                    var $t = $('.J_Widget_VerfiedpsdInputFloat');
                    if ($t[0]) {
                        $psdInput = $t;
                    } else {
                        $('body').append(psdInputHtml);
                        $psdInput = $('.J_Widget_VerfiedpsdInputFloat');
                    }
                }

                this.bindEvent();
                inited = true;
                baseContext = context;
            }
        },
        checkSupportSysKeyboard: function () {
            return !Util.isUCBrowser();
        },
        /**
        * @description abstract function. It will be called when input finished.
        */
        onKeyBoardFinish: function () {

        },
        onKeyBoardChange: function (input) {
            this.refreshkTarget(input);
        },
        bindEvent: function () {
            var that = this;
            if (this.supportSysKeyboard) {
                $psdInput.unbind().on('input', function () {
                    var val = $(this).val();
                    var s = val.split('');
                    that.refreshkTarget(s);
                })
            }
        },
        refreshkTarget: function (input) {
            for (var i = 0; i < INPUT_MAX_LENGTH; i++) {
                if (i < input.length) {
                    $($target.find('li')[i]).addClass('iconmima');
                } else {
                    $($target.find('li')[i]).removeClass("iconmima");
                }
            }

            if (input.length == INPUT_MAX_LENGTH) {
                $confirm.removeClass('disable');
            } else {
                $confirm.addClass('disable');
            }
        },
        /**
        @param obj
        @description  obj = {
        title: '',
        content: '',
        confirmText: '',
        cancelText: ''
        }
        */
        show: function (obj) {
            var that = this;
            if (!this.supportSysKeyboard) {
                this.virtualKeyBoard = new VirtualKeyBoard({
                    onFinish: _.bind(this.onKeyBoardFinish, this),
                    onChange: _.bind(this.onKeyBoardChange, this),
                    maxLength: INPUT_MAX_LENGTH
                });

            }
            if(!Config.IS_INAPP){
                window.scrollTo(0,0);
            }

            if (!obj) {
                obj = this.obj;
            }

            obj.title = obj.title || '';
            obj.content = obj.content || '';
            obj.confirmText = obj.confirmText || STRING.CONFIRM;
            obj.cancelText = obj.cancelText || STRING.CANCEL;
            obj.context = obj.context || baseContext;
            this.obj = obj;

            this.mask = obj.context.cstMsg = new CustomMessage();
            this.mask.showMessage(Util.formatStr(target, obj.title, obj.content, obj.cancelText, obj.confirmText), true, _.bind(function () {
                if (that.supportSysKeyboard) {
                    $psdInput.focus();
                }
            }, this));

            $target = $('.J_Widget_VirtualTarget');
            $confirm = $('.J_Widget_V_Confirm');
            $cancel = $('.J_Widget_V_Cancel');
            $reset = $('.J_Widget_V_Forget');

            $psdInput && $psdInput.val(''); //wxm: clear old input

            if (this.supportSysKeyboard) {
                $psdInput.focus();
            } else {
                this.virtualKeyBoard.show();
            }


            $confirm.on('click', function (evt) {

                var psd;

                if (that.supportSysKeyboard) {
                    psd = $psdInput.val();
                } else {
                    psd = that.virtualKeyBoard.getValue();
                }

                if (psd.length != INPUT_MAX_LENGTH) {
                    return;
                }
                that.verfiedPsd(function (psd) {
                    obj.success && obj.success(psd);
                }, psd, obj.context, obj.cancel);

                that.hide();

                return false;
            });

            $cancel.one('click', function (evt) {
                obj.cancel && obj.cancel();
                that.hide();

                return false;
            });

            $reset.one('click', function () {
                that.goResetPsd(obj.context);

                return false;
            });

        },
        /**
        * @description go reset page.
        */
        goResetPsd: function (baseContext) {
            var that = this;
            var userModel = WalletModel.WalletUserInfoSearch.getInstance();
            this.hide();
            baseContext.loading.show();
            userModel.param = {};
            userModel.param.reqbmp = 0; //all；
            userModel.exec({
                suc: function (info) {
                    baseContext.loading.hide();
                    baseContext.procRcCode(info, true);
                    if (info.mobile != '' || info.email != '') {
                        baseContext.forward('resetpaypsd');
                        //baseContext.forward('resetpaypsd');
                    } else {
                        baseContext.showDlg({
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
                scope: this
            });
        },
        /**
        * @description  verfied psd and will call callback
        */
        verfiedPsd: function (callback, psd, baseContext, cancel) {
            var that = this;
            this.hide(); //wxm: clear old input
            var base64psd = cUtilCryptBase64.Base64.encode(psd);
            baseContext.loading.show();
            var checkModel = WalletModel.WalletAccountCheck.getInstance();
            checkModel.param.optype = 3;
            checkModel.param.accinfo = base64psd;

            checkModel.exec({
                suc: function (info) {
                    baseContext.loading.hide();
                    baseContext.procRcCode(info, true, true);
                    if (info.rc == 0) {
                        callback && callback(base64psd);
                    } else {
                        //desc
                        if (info.desc != 0) {
                            baseContext.showDlg({
                                message: info.rmsg,
                                buttons: [{
                                    text: STRING.REINPUT,
                                    click: function () {
                                        this.hide();
                                        that.show();
                                    }
                                }, {
                                    text: STRING.FORGOTN_PSD,
                                    click: function () {
                                        this.hide();
                                        that.goResetPsd(baseContext);
                                    }
                                }]
                            });
                        } else {
                            baseContext.showDlg({
                                message: info.rmsg,
                                buttons: [{
                                    text: STRING.CLOSED,
                                    click: function () {
                                        this.hide();
                                        cancel && cancel();
                                    }
                                }, {
                                    text: STRING.FIND_PSD,
                                    click: function () {
                                        this.hide();
                                        that.goResetPsd(baseContext);
                                    }
                                }]
                            });
                        }
                    }
                },
                fail: function (data) {
                    baseContext.onModelExecFailAsync(data, 330);
                },
                scope: this
            })
        },
        hide: function () {
            this.mask.close();
            $psdInput && $psdInput.val('').blur();
            this.virtualKeyBoard && this.virtualKeyBoard.hide() && this.virtualKeyBoard.clean();
        }
    };

    return new exports();
});

