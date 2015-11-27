/**
* @author wwg
* @desc:  Wallet V6.1
*/


define(['CommonStore', 'WalletStore', 'WalletModel', 'WalletPageView', 'cUtilCryptBase64', 'Util', 'Message', 'WalletCardInfo', 'RealName'],
function (commonStore, WalletStore, WalletModel, WalletPageView, cUtilCryptBase64, Util, Message, WalletCardInfo, RealName) {


    var STRING = {
        PAGE_TITLE: '转出到储蓄卡',
        OVER_TITLE: '您的账户已超出每日提现限额。',
        CONFIRM: '确定',
        IDENTITY: '身份证',
        WITHDRAW_EXPLAIN: '从 返现账户 转￥{1}到 {2}{3}（卡号 {4}）',
        CONFIRM_TRANSFER: '确认转出',
        CANCEL: '取消',
        INPUT_PSD: '输入支付密码',
        CERTIFICATE_SELECT: '选择证件',
        AMOUNT_LIMIT_MAX: '单次转出金额请勿超过{1}元',
        AMOUNT_LIMIT_MIN: '单次转出金额请勿低于{1}元',
        LABEL_RECASH: '返现余额',
        LABEL_TRANSFER: '转出余额',
        AUTH_MESSAGE: '确认该卡是本人持有，卡信息用于账户实名认证，实名信息无法修改。',
        REALNAME_TIP: '为了账户安全，后续提现只能转出此信息开户的银行卡',
        INPUT_HINT: '输入金额，单次限{1}元',
        ACTION: '转出'
    };

    var reCashAcctModel = WalletModel.ReCashListModel.getInstance();
    var transDepositCardModel = WalletModel.ExgOrGainModel.getInstance();
    var reCashWayModel = WalletModel.ExchangeTicketMethodModel.getInstance();

    var reCashWayListStore = WalletStore.ReCashWayListStore.getInstance();
    var checkBinStore = WalletStore.CheckBin.getInstance();
    var transfer2Store = WalletStore.Transfer2Store.getInstance();
    var reCashStore = WalletStore.ReCashListStore.getInstance();

    var userInfoStore = WalletStore.UserInfoStore.getInstance();

    var View = WalletCardInfo.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        model: {},
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
            this.path = this.getQuery('path');
            this._getReCash();
        },
        _getReCash: function () {
            this.loading.show();
            reCashAcctModel.setParam("reqbmp", 4);
            reCashAcctModel.exec({
                scope: this,
                suc: function (data) {
                    if (data && data.rc == 0) {

                        this.reCashAmount = data.cashamt;
                        var _exist = this._getTransferToCardWay();
                        if (_exist) {
                            this.loading.hide();
                            this._initData();
                        } else {
                            // 获取返现方式列表.
                            this._getReCashWayList();
                        }

                    } else {
                        this.loading.hide();
                        this.procRcCode(data);
                    }
                },
                fail: function () {
                    this.onModelExecFail();
                }
            });
        },
        _getReCashWayList: function () {
            reCashWayModel.exec({
                scope: this,
                suc: function (data) {
                    if (data && data.rc == 0) {
                        this.loading.hide();
                        this._getTransferToCardWay(data);
                        this._initData();
                    } else {
                        this.loading.hide();
                        this.procRcCode(data);
                    }
                },
                fail: function () {
                    this.onModelExecFail();
                }
            });
        },
        _getTransferToCardWay: function (data) {
            var _result = data || reCashWayListStore.get();
            var _array = _result && _result.waylist || [];
            var _exist = false;
            var _that = this;
            _.each(_array, function (item) {
                if (item.waytype == 5) {
                    //转出到储蓄卡.
                    _that.minValue = item.minval;
                    _that.maxValue = item.maxval;
                    _exist = true;
                }
            });
            return _exist;
        },
        _initData: function () {

            this.elements.action = STRING.ACTION;

            var _cardInfo = {}, _fields = [];

            var _path = this.path;
            if (_path == 'history') {
                this.elements.authoptstatus = 0; // 历史卡无需实名
                this.elements.cardHolderHelp = Message.get(109);

                _cardInfo = transfer2Store.getAttr('item');
                var _cardNo = _cardInfo.cardno;
                _cardInfo.cardno = Util.formatCardCode(_cardNo);
                _cardInfo.correctcardno = cUtilCryptBase64.Base64.encode(_cardNo);

                _fields.push(this._createField('CardHolder', 1, _cardInfo.cardholder));
            } else {
                if (!userInfoStore.hasUserData()) {
                    this.showToast(Message.get(123), _.bind(function () {
                        this.back('useraccount');
                    }, this));
                    return;
                }

                this.elements.authTip = STRING.AUTH_MESSAGE;

                _cardInfo = checkBinStore.get();
                var _cardNo = checkBinStore.getBase64('cardno');
                _cardInfo.cardno = Util.formatCardCode(_cardNo);
                _cardInfo.correctcardno = cUtilCryptBase64.Base64.encode(_cardNo);

                this.elements.authoptstatus = (_cardInfo.AuthOptStatus !== undefined)?_cardInfo.AuthOptStatus:2;

                var _status = userInfoStore.getAttr('authstatus');
                if (_status == 1) {//实名后
                    this.elements.cardHolderHelp = Message.get(109);

                    _fields.push(this._createField('CardHolder', 1, userInfoStore.getBase64('username')));
                    var _idType = userInfoStore.getAttr('idtype');
                    var _idNo = userInfoStore.getAttr('idno');

                    _fields.push(this._createField('IdCardType', _idType == 1 ? 1 : 0, _idType));
                    _fields.push(this._createField('IdNumber', _idType == 1 ? 1 : 0, _idNo));
                } else {
                    this.elements.cardHolderHelp = Message.get(110);

                    _fields.push(this._createField('CardHolder', 0, ''));
                    _fields.push(this._createField('IdCardType', 0, ''));
                    _fields.push(this._createField('IdNumber', 0, ''));
                }
            }

            this.elements.cardInfo = _cardInfo;
            this.elements.fieldlist = _fields;

            this.elements.inputData = {
                label: STRING.LABEL_RECASH,
                inputLabel: STRING.LABEL_TRANSFER,
                inputHint: Util.formatStr(STRING.INPUT_HINT, this.maxValue),
                money: this.reCashAmount,
                valiCallBack: function (amount) {
                    return this._checkAmount(amount);
                }
            };
             this.loadCerList(this.render);

        },
        render: function () {
            this.inherited(arguments);
            this._bindClickEvent();
            this.turning();
             if(Util.compareZero(this.reCashAmount)){
                this.$el.find(".J_Money").attr({'type':'text'})
              }else{
                this.$el.find(".J_Money").attr({'type':'tel'})
              }
        },
        _createField: function (name, status, value) {
            return { fieldname: name, fieldstatus: status, fieldvalue: value };
        },
        _bindClickEvent: function () {
            var _that = this;
            this.$el.find('.J_Next').on('click', function () {
                _that._submit();
            })
        },
        confirmRealName: function (cbConfirm, cbCancel) {
            var _that = this;
            var _data = this.getAllValue();

            var params = {
                cardHolder: _data.cardHolder,
                cardType: _data.cardType,
                cardTypeString: _data.cardTypeString,
                cardNo: _data.cardNo,
                realNameTip: STRING.REALNAME_TIP,
                mask: this.getCstMsg()
            };

            var realName = new RealName(params);

            realName.show(function (flag) {
                if (flag) {
                    cbConfirm && cbConfirm.call(_that);
                } else {
                    cbCancel && cbCancel.call(_that);
                }
            });
        },
        _checkAmount: function (amount) {
            //var $amount = this.$el.find('.J_Money');

            if (this.isEmpty(amount) || amount == 0) {
                this.showToast(Message.get(358));
                this.ClearInputIcon();
                return false;
            }

            if (isNaN(amount) || (!isNaN(amount) && amount.substring(0, 1) == "0" && amount.substring(1, 2) != ".")) {
                this.showToast(Message.get(349));
                this.ClearInputIcon();
                return false;
            }

            if (parseFloat(amount) > parseFloat(this.reCashAmount)) {
                this.showToast(Message.get(350));
                this.ClearInputIcon();
                return false;
            }

            var _max =parseFloat(this.maxValue);
            var _min = parseFloat(this.minValue);

            if (_max > 0 && parseFloat(amount) > _max) {
                this.showToast(Util.formatStr(STRING.AMOUNT_LIMIT_MAX, this.maxValue));
                this.ClearInputIcon();
                return false;
            }

            if (_min > 0 && parseFloat(amount) < _min) {
                this.showToast(Util.formatStr(STRING.AMOUNT_LIMIT_MIN, this.minValue));
                this.ClearInputIcon();
                return false;
            }

            return true;
        },
        _submit: function () {
            var _valid = this.validate();

            if (!_valid) {
                return;
            }

            var _data = this.getAllValue();

            if (this._els.$check[0]) {
                if (!_data.bindname) {
                    this.showToast(Message.get(376));
                    this.highLightCheckLine();
                    return;
                }
            }

            var _cardInfo = this.elements.cardInfo;

            var _amount = _data.money;
            var _bankname = _cardInfo.banknameShort;
            var _cardtypeUI = _cardInfo.cardtypeUI;
            var _cardno = Util.parseCard(_cardInfo.cardno);
            var _content = Util.formatStr(STRING.WITHDRAW_EXPLAIN, _amount, _bankname, _cardtypeUI, _cardno);

            var _that = this;
            this.psd.show({
                title: STRING.INPUT_PSD,
                content: _content,
                confirmText: STRING.CONFIRM_TRANSFER,
                cancelText: STRING.CANCEL,
                context: this,
                success: function (pwd) {

                    transDepositCardModel.param = {};

                    transDepositCardModel.param.waytype = 5; //转出到储蓄卡
                    transDepositCardModel.param.amount = _amount;
                    transDepositCardModel.param.holder = _data.cardHolder;
                    transDepositCardModel.param.bankid = _cardInfo.cardtype;
                    transDepositCardModel.param.bankname = _cardInfo.bankname;
                    transDepositCardModel.param.idtype = _data.cardType;
                    transDepositCardModel.param.cardno = _cardInfo.correctcardno;
                    _data.cardNo && (transDepositCardModel.param.idno = cUtilCryptBase64.Base64.encode(_data.cardNo));

                    var _path = _that.path;
                    if (_path == 'history') {
                        transDepositCardModel.param.cardid = _cardInfo.cardid;
                    } else {
                        transDepositCardModel.param.bindname = _data.bindname ? 1 : 0; //实名绑定
                    }
                    transDepositCardModel.param.AuthFlag=_data.isResetCrdNo;
                    transDepositCardModel.param.paypwd = pwd;

                    var _params = transDepositCardModel.param;

                    _that.loading.show();
                    transDepositCardModel.exec({
                        scope: _that,
                        suc: function (ret) {
                            this.loading.hide();

                            if (ret.rc == 1404005) {
                                // 需要手机验证.
                                _params.riskid = ret.riskid;
                                _params.payoutid = ret.payoutid;
                                _params.message=ret.rmsg;
                                transfer2Store.setAttr("params", _params);

                                this.forward('phonevalidate');
                                return;
                            }

                            if (ret.rc == 0) {
                                //成功
                                ret.status = 3; //status for result page judge. 1:success 2:fail 3:processinog
                            } else if (ret.rc == 1404004) {
                                //处理中..
                                ret.status = 3;
                            } else {
                                //失败 其他错误
                                ret.status = 2;
                            }

                            ret.amount = _amount;
                            ret.bankname = _bankname;

                            transfer2Store.setObject(ret);
                            this.forward("result?path=transfer");
                            this.commonGoNext();
                        },
                        fail: function (data) {
                            this.onModelExecFailAsync(data);
                        }
                    });
                }
            });

        },
        detect: function () {
            var data = this.getData();

            var els = this.els;
            if (data.cert_type == 1) {
                if (!this.isCorrectIDCard(data.cert_no)) {
                    this.invalidInput(els.cert_no, false, 355);
                    return;
                }
            } else {
                if (!this.isCorrectCertNo(data.cert_no)) {
                    this.invalidInput(els.cert_no, false, 355);
                    return;
                }
            }

        },
        isEmpty: function (s) {
            return !(/.+/.test(s));
        },
        isInteger: function (s) {
            return /^\d*$/.test(s);
        },
        ClearInputIcon:function(){
            this.$el.find('.J_ClearInput').hide()
        }
    });

    return View;
});

