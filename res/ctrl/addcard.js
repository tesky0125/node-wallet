/**
* @module addcard
* @author luzx
* @description add base card page
* @version since Wallet V5.8
*/

define(['WalletModel', 'WalletStore', 'text!addcard_html', 'Util', 'WalletPageView', 'Message', 'cUtilCryptBase64','Config'],
function (WalletModel, WalletStore, html, Util, WalletPageView, Message, cUtilCryptBase64, Config) {

    var STRING = {
        PAGE_TITLE: '新增收款银行卡',
        OVER_TITLE: '您的账户已超出每日提现限额。',
        GIVEUP_TITLE: "是否放弃实名认证？",
        CONFIRM: '确定',
        CANCEL: '取消',

        WITH_DRAW_TIP: '仅支持提现至储蓄卡',
        CASH_BACK_TIP: '请绑定本人银行卡，实名认证后不可更改',
        WITH_DRAW_CASH_BACK_HINT: '银行卡卡号',

        TRANSFER_TITLE: '转出到储蓄卡',
        TRANSFER_TIP: '输入储蓄卡卡号',
        TRANSFER_HINT: '输入银行卡号',

        BINDCARD_TITLE:'验证银行卡信息',
        BINDCARD_CREDIT_TIP:'请输入信用卡卡号',
        BINDCARD_DEPOSIT_TIP:'请输入储蓄卡卡号',
        BINDCARD_BOTH_TIP:'请输入银行卡卡号',
        BINDCARD_HINT:'输入卡号',

        CLOSE: "关闭",
        SUPPORT_BANKS_TIP: '支持银行列表'

    };
    var CardType = {
        Deposit: 1,
        Credit: 2,
        Both: 3
    };
    var ADD_CARD_VARS = {
        'bindcard': {reqtype: 2},//TODO
        'fastpay': {reqtype: 4},
        'realname': {reqtype: 8}
    };

    //base for bindcard/fastpay/realname/withdraw/transfer
    var CardBase = {
        title:'',
        model: {
            tip: '',
            hint: ''
        },
        forwardpage:'',
        paymchid:Config.PAYMCHIDS.DEFAULT,
        getPaymchid: function(){
            return this.paymchid;
        }
    };

    //base for bindcard/fastpay/realname
    var BindCardBase = _.extend({},CardBase,{
        chktype:1,
        addcardtype:'',
        paymchid:'',
        supportbankspath:'',
        session: true,
        model: {
            tip: '',
            hint: '',
            supportbankstype:1//0-header 1-body
        },
        dataStore:null,//for override
        headerBtn: { title: STRING.SUPPORT_BANKS_TIP, id: 'J_Explain', classname: 'explain' },
        commitHandler: {
            id: 'J_Explain',
            callback: function () {
                this.tryHideMaskLayers();
                this.goSupportBanksList();
            }
        },
        checkCardType:function(cbCheck){
            this.loading.show();
            var _checkCardTypeModel = WalletModel.PublicCheck.getInstance();
            _checkCardTypeModel.param = {};
            _checkCardTypeModel.param.paymchid = this.getPaymchid();
            _checkCardTypeModel.param.reqtype = 3;
            _checkCardTypeModel.param.reqparam = ADD_CARD_VARS[this.addcardtype].reqtype;
            _checkCardTypeModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    if (data.rc == 0) {
                        var cardtype = parseInt(data.desc, 10);
                        var checkStore = WalletStore.PublicCheckStore.getInstance();
                        checkStore.setAttr('cardtype',cardtype);
                        cbCheck && cbCheck(cardtype);
                    }
                },
                fail: this.onModelExecFailAsync,
                scope: this
            });
        },
        goSupportBanksList: function () {
            this.forward('supportbanks?path='+this.supportbankspath);
        },
        getScenParam: function () {
            var _param = { 'PayChannel': 'PayUsedCard' };
            return JSON.stringify(_param);
        },
        success:function(info, cardno){
            var item;
            var creditCards = _.union(info.creditCard, info.unionCreditCard);
            if (creditCards.length > 0) {
                this.dataStore.setAttr('isCreditCard', true);
                item = creditCards[0];
            }else if (info.unionSavingCard.length > 0) {
                this.dataStore.setAttr('isCreditCard', false);
                item = info.unionSavingCard[0];
            }

            item.cardno = cardno;
            if (Util.isAECard(item.cardtype)) {
                item.isAECard = true;
            }
            this.dataStore.setAttr('card', item);//store for bindcard/fastpay/realname

            this.forward(this.forwardpage);
        }
    });

    var Withdraw = _.extend({}, CardBase, {
        title: STRING.PAGE_TITLE,
        backToPage: 'withdraw',
        forwardpage:'withdrawcard',
        model: {
            tip: STRING.WITH_DRAW_TIP,
            hint: STRING.WITH_DRAW_CASH_BACK_HINT,
            supportbankstype:0
        },
        success: function (info){

            if (info.unionSavingCard.length === 0) {
                this.showToast(Message.get(359));
                return;
            }

            var userInfoStore = WalletStore.UserInfoStore.getInstance();

            if (!userInfoStore.hasUserData()) {
                this.showToast(Message.get(123));
                return;
            }

            var authstatus = userInfoStore.getAttr("authstatus");
            if (authstatus === 0) {
                this.forward(this.forwardpage);
            } else {
                this.forward(this.forwardpage+'?path=withname');
            }
        }
    });

    //deprecated?
    var Cashback = _.extend({}, CardBase, {
        title: STRING.PAGE_TITLE,
        backToPage: 'withdraw',
        forwardpage:'authstatus',
        model: {
            tip: STRING.CASH_BACK_TIP,
            hint: STRING.WITH_DRAW_CASH_BACK_HINT,
            supportbankstype:0
        },
        success: function (info){
            if (info.unionSavingCard.length === 0) {
                this.showToast(Message.get(359));
                return;
            }

            this.forward(this.forwardpage);

        },
        returnHandler: function () {
            var that = this;
            if (this.els.$bankcard.val() === '') {
                this.back(this.backToPage);
            } else {
                this.showDlg({
                    message: STRING.GIVEUP_TITLE,
                    buttons: [{
                        text: STRING.CONFIRM,
                        click: function () {
                            this.hide();
                            that.back(that.backToPage);
                        }
                    }, {
                        text: STRING.CANCEL,
                        click: function () {
                            this.hide();
                        }
                    }]
                })
            }
        }

    });

    var Transfer = _.extend({}, CardBase,{
        title: STRING.TRANSFER_TITLE,
        chktype: 1,//1：提现历史卡
        forwardpage:'transfertocard',
        model: {
            tip: STRING.TRANSFER_TIP,
            hint: STRING.TRANSFER_HINT,
            supportbankstype:0
        },
        success: function (info) {
            if (info.unionSavingCard.length == 0 && (info.creditCard.length > 0 || info.unionCreditCard.length > 0)) {
                //creditCard 直连信用卡 unionCreditCard 银联信用卡 非储蓄卡.
                this.showToast(Message.get(356));
            } else {
                this.forward(this.forwardpage);
            }
        }
    });

    var FastPay = _.extend({}, BindCardBase, {
        title: STRING.BINDCARD_TITLE,
        headerBtn:{},
        commitHandler:{},
        chktype:4,
        addcardtype:'fastpay',
        paymchid:Config.PAYMCHIDS.FASTPAY,
        supportbankspath:'fastpay',
        forwardpage:'fastpaycard',
        model: {
            tip: STRING.BINDCARD_BOTH_TIP,
            hint: STRING.BINDCARD_HINT,
            supportbankstype:1,
            supportbanktip:STRING.SUPPORT_BANKS_TIP
        },
        getScenParam: function () {
            var _fastPayStore = WalletStore.FastPayStore.getInstance();
            var _scenparam = _fastPayStore.getAttr('scenparam');
            console.log('scenparam:'+_scenparam);
            return _scenparam;
        },
        getPaymchid: function(){
            var _fastPayStore = WalletStore.FastPayStore.getInstance();
            var _paymchid = _fastPayStore.getAttr('bustype');
            console.log('addcard-paymchid:'+_paymchid);
            return _paymchid || this.paymchid;
        },
        success: function (info) {
            if(info.creditCard.length === 0 &&　info.unionCreditCard.length === 0) {
                this.showToast(Message.get(370));//仅支持信用卡
                return;
            }

            this.forward(this.forwardpage+'?path=newadd');
        },
        returnHandler : function () {
            var _fastPayStore = WalletStore.FastPayStore.getInstance();
            var _from = _fastPayStore.getAttr('from');
            if (_from == 'independentset') {
                this.forward('fastpaysetting');
            } else if (_from == 'payingset') {
                this.forward('fastpaysetting?path=defaultcredit');
            }
        }
    });

    var bindCardStore = WalletStore.BindCardStore.getInstance();
    var BindCard = _.extend({}, BindCardBase, {
        title: STRING.BINDCARD_TITLE,
        headerBtn:{},
        commitHandler:{},
        chktype: 2,
        addcardtype:'bindcard',
        paymchid:Config.PAYMCHIDS.BINDCARD,
        supportbankspath:'bindcard',
        forwardpage:'bindcard',
        model: {
            tip: STRING.BINDCARD_BOTH_TIP,
            hint: STRING.BINDCARD_HINT,
            supportbankstype:1,
            supportbanktip:STRING.SUPPORT_BANKS_TIP
        },
        dataStore:bindCardStore
    });

    var realNameCardStore = WalletStore.RealNameCardStore.getInstance();
    var RealName = _.extend({}, BindCardBase,{
        title: STRING.BINDCARD_TITLE,
        headerBtn:{},
        commitHandler:{},
        chktype: 8,
        addcardtype:'realname',
        paymchid:Config.PAYMCHIDS.REALNAME,
        supportbankspath:'realname',
        forwardpage:'realnamecard',
        model: {
            tip: STRING.BINDCARD_BOTH_TIP,
            hint: STRING.BINDCARD_HINT,
            supportbankstype:1,
            supportbanktip:STRING.SUPPORT_BANKS_TIP
        },
        dataStore:realNameCardStore
    });

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        model: {},
        chktype:1,
        events: {
            'click .J_NextBtn': 'goNext'
        },
        els:{
            $bankcard: null
        },
        onCreate: function () {
            this.inherited(arguments);
            this.sessid = Util.createGuid();
        },
        onShow: function () {
            var _path = this.getQuery('path');
            var _page = null;

            var _bCheck = false;
            switch (_path) {
                case 'cashback': //外部调用.
                    _bCheck = true;
                    _page = Cashback;
                    break;
                case 'fastpay':
                    _page = FastPay;
                    break;
                case 'bindcard':
                    _page = BindCard;
                    break;
                case 'transfer':
                    _page = Transfer;
                    break;
                case 'realname':
                    _page = RealName;
                    break;
                default:
                    _bCheck = true;
                    _page = Withdraw;//默认来自提现.
                    break;
            }

            //lizad2.1 change: because lizard2.1 will share instance, delete old values manually
            for (var x in Cashback) delete this[x];
            for (var x in FastPay) delete this[x];
            for (var x in BindCard) delete this[x];
            for (var x in Transfer) delete this[x];
            for (var x in Withdraw) delete this[x];

            Util.mix(this, _page);

            this.inherited(arguments);

            var that = this;
            if(this.checkCardType){
                this.checkCardType(function(cardtype){
                    that.cardtype = cardtype;
                    that._updateAddCardTip();

                    that.render();
                    that.bindEvent();
                    that.initCommonEvent();
                    that.turning();
                    if (_bCheck){
                        that.checkinfo();
                    }
                });
            }else{
                this.render();
                this.bindEvent();
                this.initCommonEvent();
                this.turning();
                if (_bCheck){
                    this.checkinfo();
                }
            }

        },
        render: function () {
            this.$el.html(_.template(this.tpl, this.model));

            this.els.$bankcard = this.$el.find(".J_BankCard");
            this.els.$supportbanks = this.$el.find(".J_SupportBanks");
        },
        _updateAddCardTip:function(){
            if(this.cardtype === CardType.Credit){
                this.model.tip = STRING.BINDCARD_CREDIT_TIP;
            }else if(this.cardtype === CardType.Deposit){
                this.model.tip = STRING.BINDCARD_DEPOSIT_TIP;
            }else if(this.cardtype === CardType.Both){
                this.model.tip = STRING.BINDCARD_BOTH_TIP;
            }
        },
        bindEvent: function () {
            var that = this;
            this.els.$bankcard.on("keyup", function (e) {
                var val = Util.formatCardCode2($(this).val(), e);
                $(this).val(val);
                Util.setCursorTo(this, $(this).val().length);
            });

            this.els.$supportbanks.on('click',function(e){
               that.goSupportBanksList();
            });
        },
        /**
        * @description check the account status
        */
        checkinfo: function (callback){
            var that = this;
            var checkModel = WalletModel.WithdrawLimit.getInstance();

            this.loading.show();
            checkModel.exec({
                suc: function (info) {
                    that.loading.hide();
                    if (info.rc == 0) {
                        if (info.overflow == 0) {
                            callback && callback();
                        } else {
                            that.showDlg({
                                message: STRING.OVER_TITLE,
                                buttons: [{
                                    text: STRING.CONFIRM,
                                    click: function () {
                                        this.hide();
                                        that.back('index');
                                    }
                                }]
                            });
                        }
                    }
                },
                fail: this.onModelExecFail,
                scrop: this
            })
        },
        /**
        * @description check value and go next
        */
        goNext: function () {
            var that = this;
            var cardno = this.getCard().replace(/\s+/g,'');
            if (cardno == '') {
                this.showToast(Message.get(331));
                return;
            }

            if (cardno.length < 10 || !/^\d+$/.test(cardno)) {
                this.showToast(Message.get(329));
                return;
            }

            var checkModel = WalletModel.CheckBin.getInstance();

            var checkBinStore = WalletStore.CheckBin.getInstance();
            checkBinStore.remove();
            this.loading.show();

            checkBinStore.setBase64("cardno", cardno);

            //new card bin store.
            var cardBinStore = WalletStore.CardBinStore.getInstance();
            cardBinStore.setBase64("cardno", cardno);

            checkModel.param = {};

            checkModel.param.cardno = cUtilCryptBase64.Base64.encode(cardno);
            var paymchid = this.getPaymchid && this.getPaymchid();
            if(paymchid){
                checkModel.param.paymchid = paymchid;
            }
            checkModel.param.chktype = this.chktype;
            this.session && (this.sessid) &&(checkModel.param.sesid = this.sessid);

            var _scenparam = this.getScenParam();
            if(!Util.isEmpty(_scenparam)) {
                checkModel.param.scenparam = _scenparam;
            }

            checkModel.exec({
                suc: function (info) {
                    that.loading.hide();
                    if (info.rc == 0) {
                        that.success.call(that, info, that.els.$bankcard.val());
                    } else if (info.rc == 1105437) {// 不支持的银行
                        this.showDlg({
                            message: info.rmsg,
                            buttons: [{
                                text: STRING.CLOSE,
                                click: function () {
                                    this.hide();
                                }
                            }, {
                                text: STRING.SUPPORT_BANKS_TIP,
                                click: function () {
                                    this.hide();
                                    that.goSupportBanksList.call(that);
                                }
                            }]
                        });
                    }  else if (info.rc == 1105438) {// 支持的银行，但是没有页面需要的项(证件号码、等)
                        this.showToast(info.rmsg);
                        return;
                    } else {
                        that.procRcCode(info, true);
                    }
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            })
        },
        goSupportBanksList: function (){
            //empty method. for override
        },
        getScenParam: function() {
            //empty method. for override
            return '';
        },
        getCard: function () {
            return this.els.$bankcard.val().replace(/\s+/g, '');
        },
        onHide: function () {
            this.inherited(arguments);
            this.els.$bankcard.val('');
        },
        success: function (info){
            //empty method. for override
        }
    });

    return View;
});

