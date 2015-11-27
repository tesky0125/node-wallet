/**
* @author wwg
* @desc:  Wallet V6.2
*/

define(['WalletPageView', 'WalletModel', 'WalletStore', 'VirtualKeyBoard', 'Util', 'text!setpaypassword_html', 'Message', 'Config', 'cGuiderService', 'cUtilCryptBase64', 'Scmg'],
function (WalletPageView, WalletModel, WalletStore, VirtualKeyBoard, Util, html, Message, Config, cGuiderService, cUtilCryptBase64, Scmg) {
    var STRING = {
        PAGE_TITLE: '设置支付密码',
        PAGE_TITLE_2: '确认支付密码',
        ACTION_NEXT: '下一步',
        ACTION_CONFIRM: '确定',
        EXPLAIN_ORGINAL: '为了您的账户安全，需先设置携程支付密码（6位数字）',
        AUTH_EXPLAIN_ORGINAL: '请输入6位数字支付密码。',
        EXPLAIN_CONFIRM: '再次确认支付密码（6位数字）'
    };

    var MODE = {
        ORGINAL: 1,
        CONFIRM: 2
    };

    var verificationStore = WalletStore.Verification.getInstance();
    var setPsdStore = WalletStore.SetPsdStore.getInstance();
    var fastPayStore = WalletStore.FastPayStore.getInstance();

    var psdInputHtml = '<input type="tel" maxlength="6" class="J_Widget_VerfiedpsdInput" style="margin-left:-2000px;position:absolute;top:0">';

    var SOURCE = {
        WALLET: '1',      //1：钱包
        PAY_NATIVE: '11', //11：支付Native
        PAY_HYBRID: '12', //12：支付Hybrid
        PAY_H5: '13'      //13：支付H5
    };


    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        mode: MODE.ORGINAL,
        beforePage: '',
        inputMaxLength: 6,
        events: {
            'click .J_Button': '_click'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            var _path = this.getQuery('path');
            this.psdStyle=setPsdStore.getAttr("psdStyle");
            this.beforePage=setPsdStore.getAttr('retPage');
            if (!_path) {
                    this.mode = MODE.ORGINAL;
                }
                if (_path == 'confirm') {

                    this.mode = MODE.CONFIRM;
                    this.title = STRING.PAGE_TITLE_2;
                }

            this.inherited(arguments);
            this.supportSysKeyboard = !Util.isUCBrowser();
            if (this.supportSysKeyboard) {
                var $t = $('.J_Widget_VerfiedpsdInput');
                if ($t[0]) {
                    this.$psdInput = $t;
                } else {
                    $('body').append(psdInputHtml);
                    this.$psdInput = $('.J_Widget_VerfiedpsdInput');
                }
            } else {
                this.virtualKeyBoard = new VirtualKeyBoard({
                    onFinish: _.bind(this._onKeyBoardFinish, this),
                    onChange: _.bind(this._onKeyBoardChange, this),
                    maxLength: this.inputMaxLength
                });
            }

            if (this.mode == MODE.ORGINAL) {
                var _source = this.getQuery('source');
                if (!Util.isEmpty(_source)) {
                    var _requestID = this.getQuery('requestid');
                    var _bustype = this.getQuery('bustype');
                    console.log('setpaypassword-paymchid:'+_bustype);

                    fastPayStore.remove();
                    //存储 外部url参数,后续使用.
                    fastPayStore.setAttr('source', _source);
                    fastPayStore.setAttr('requestid', _requestID);
                    fastPayStore.setAttr('bustype', _bustype);

                    this.source = _source;

                    if (this.source == SOURCE.PAY_NATIVE) {
                        var _param = { 'GatheringType': 'D',
                            'PayChannel': 'ProtocolPay'
                        }; //支付

                        fastPayStore.setAttr('scenparam', JSON.stringify(_param));
                    }
                } else {
                    //非入口来源
                    this.source = fastPayStore.getAttr('source');
                }

                if (Util.isEmpty(this.source)) {
                    if (Config.IS_INAPP) {//
                        cGuiderService.backToLastPage();
                    } else {
                        this.jump(Config.H5_MAIN_HOME_URL);
                    }
                    return;
                }
            }

            this.render();
            this.turning();
            this._bindEvent();

            if (this.supportSysKeyboard) {
                this.$psdInput.focus();
            } else {
                this.virtualKeyBoard.show();
            }
        },
        onHide: function () {
            this.inherited(arguments);
            if (this.supportSysKeyboard) {
                this.$psdInput.blur();
            } else {
                this.virtualKeyBoard.hide();
            }
            this._clean();

            //$(window).off('hashchange', $.proxy(this.hasChanged, this));
        },
        render: function () {
            var _model = {};
            if (this.mode == MODE.ORGINAL) {
                    if (this.psdStyle==2) {
                        _model.explain = STRING.AUTH_EXPLAIN_ORGINAL;
                        _model.action = STRING.ACTION_NEXT;
                    } else {
                        _model.explain = STRING.EXPLAIN_ORGINAL;
                        _model.action = STRING.ACTION_NEXT;
                    }
                } else {
                    _model.explain = STRING.EXPLAIN_CONFIRM;
                    if (this.psdStyle==2) {
                        _model.action = STRING.ACTION_NEXT;
                    } else {
                        _model.action = STRING.ACTION_CONFIRM;
                    }

                }

            this.$el.html(_.template(html, _model));


            this._kTarget = this.$el.find(".J_Vertual-target");
            this._kTargetNums = this._kTarget.find("li");
            this.$button = this.$el.find('.J_Button');
        },
        _bindEvent: function () {
            var that = this;
            if (this.supportSysKeyboard) {
                this.$psdInput.unbind().on('input', function () {
                    var val = $(this).val();
                    var s = val.split('');
                    that._onKeyBoardChange.call(that, val);
                    if (s.length == that.inputMaxLength) {
                        that._onKeyBoardFinish.call(that, val);
                    }
                });

                this._kTarget.unbind().on('click', function () {
                    that.$psdInput.focus();
                })
            }
        },
        _clean: function () {
            this.virtualKeyBoard && this.virtualKeyBoard.clean();
            this.$psdInput && this.$psdInput.val('');
            this._refreshkTarget([]);

            this.$button.addClass('gray');
        },
        _click: function () {
            var _psd;
            if(this.supportSysKeyboard){
                _psd = this.$psdInput.val();
            }else{
                _psd = this.virtualKeyBoard.getValue()
            }
            if (_psd.length != this.inputMaxLength) {
                return;
            }

            if (this.mode == MODE.ORGINAL) {

                var _res = Util.verfiedPassWord(_psd);
                if (_res == true) {
                    ///verificationStore.setBase64({ 'paypsd': _psd });
                    Scmg.setV(1);
                    Scmg.setP64(_psd);
                    this.forward('setpaypassword2?path=confirm');
                } else {
                    if (_res == 1) {
                        this.showToast(Message.get(368));
                        this._clearInput();
                    } else if (_res == 2) {
                        this.showToast(Message.get(369));
                        this._clearInput();
                    }
                }
            } else {
                ///var _prePsd = verificationStore.getBase64('paypsd');
                var _prePsd = Scmg.getP64();

                if (_psd != _prePsd) {
                    this.showToast(Message.get(310));
                    this._clearInput();
                    return;
                }


                var _accountCheck = WalletModel.WalletAccountCheck.getInstance();
                _accountCheck.param = {};
                _accountCheck.param.optype = 2; //用验证登录密码服务验证支付密码是否与登录密码一致.
                _accountCheck.param.accinfo = cUtilCryptBase64.Base64.encode(_psd);

                this.loading.show();
                _accountCheck.exec({
                    suc: function (info) {
                        this.loading.hide();
                        if (info.rc == 0) {//匹配登录密码
                            this.showToast(Message.get(307));
                            this._clearInput();
                        } else if(info.rc == 1403002){
                            switch (this.beforePage){
                                case "accountverified":
                                 this.forward('setsecuritymobile?path=authverify');
                                 break;
                                 case "insrcactivity":
                                 this.forward('setsecuritymobile?path=insrcactivity');
                                 break;
                                 default:
                                 this.forward('setsecuritymobile?path=fastpay');
                                 break;
                            }
                        }else{
                            this.showToast(Message.get(123));
                        }
                    },
                    fail: function (data) {
                        this.onModelExecFailAsync(data, 330);
                    },
                    scope: this
                })
            }
        },
        _refreshkTarget: function (input) {
            for (var i = 0; i < this.inputMaxLength; i++) {
                if (i < input.length) {
                    $(this._kTargetNums[i]).addClass('iconmima');
                } else {
                    $(this._kTargetNums[i]).removeClass("iconmima");
                }
            }
        },
        _clearInput:function () {
            for(var i=0;i<this.inputMaxLength;i++){
                $(this._kTargetNums[i]).removeClass("iconmima");
            }
            if(this.supportSysKeyboard){
                $('.J_Widget_VerfiedpsdInput').val('')
            }else{
                this.virtualKeyBoard && this.virtualKeyBoard.clean();
            }

        },
        //virtualKeyBoard callback.
        _onKeyBoardChange: function (input) {
            this._refreshkTarget(input);
            if (input.length == this.inputMaxLength) {
                this.$button.removeClass('gray');
            } else {
                this.$button.addClass('gray');
            }
        },
        _onKeyBoardFinish: function () { },
        returnHandler: function () {
            if (this.mode == MODE.ORGINAL) {
                switch (this.source) {
                    case SOURCE.PAY_NATIVE:
                        //if (Config.IS_INAPP) {//
                        //    cGuiderService.backToLastPage();
                        //} else {
                        //    this.inherited(arguments);
                        //}
                        //break;
                        this.exitWalletModule();
                    case SOURCE.WALLET:
                            if (this.psdStyle==2) {
                                this.retPage =  this.beforePage;
                            }
                            this.inherited(arguments);
                            break;
                    case SOURCE.PAY_HYBRID:
                    case SOURCE.PAY_H5:
                    default:
                        this.inherited(arguments);
                }
            } else {
                this.title = STRING.PAGE_TITLE;//
                this.mode = MODE.ORGINAL;//back to step1 page
                this.inherited(arguments);
            }

        }

    });

    return View;

});

