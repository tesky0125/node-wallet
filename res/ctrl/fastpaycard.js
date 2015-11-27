/**
* @author wwg
* @desc add by Wallet V6.2
*/
define(['WalletModel', 'WalletStore', 'Util', 'WalletBindCardService', 'Message', 'cUtilCryptBase64', 'Config'],
function (WalletModel, WalletStore, Util, WalletBindCardService, Message, cUtilCryptBase64, Config) {
    var STRING = {
        FAST_PAY_CARD_TITLE: '验证银行卡信息',
        CARD_ERR_CHANGE: '该银行卡状态异常，请联系银行或更换支付方式',
        CANCEL: '取消',
        CHANGE_CARD: '更换银行卡'
    };

    var fastPayStore = WalletStore.FastPayStore.getInstance();
    var cardBinStore = WalletStore.CardBinStore.getInstance();

    var View = WalletBindCardService.extend({
        bindcardtype:'fastpay',
        paymchid:Config.PAYMCHIDS.FASTPAY,
        dataStore:fastPayStore,
        title: STRING.FAST_PAY_CARD_TITLE,
        backBtn: true,
        elements: {
            cardTitle: true,
            cardInfo: {
            },
            validity: true, //卡有效期
            cardIdentify: true, //卡验证码
            cardHolder: '', //持卡人
            cardType: true, //证件类型
            cardNo: true, //证件号码,
            preTel: true, // 银行预留手机'18988887777',
            checkBox: true
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);

            var _path = this.getQuery('path');

            var _cardInfo = cardBinStore.get();
            var _creditCard = _.union(_cardInfo.creditCard, _cardInfo.unionCreditCard);
            var _cardInfo = _creditCard[0];

            //bind data to elements
            this.elements.cardInfo = _cardInfo;
            this.elements.fieldlist = _cardInfo.fieldlist;
            this.elements.authoptstatus= _cardInfo.AuthOptStatus;//0

            var _cardNo;
            if (_path && _path == 'newadd') {
                _cardNo = cardBinStore.getBase64('cardno');
            } else {
                _cardNo = cardBinStore.getAttr('cardno');
            }

            this.elements.cardInfo.cardno = Util.formatCardCode(_cardNo);

             this.loadCerList(this.render);
        },
        render: function () {
            this.inherited(arguments);
            this.addInputCardInfoTip();
            this.bindEvent();
            this.turning();
        },
        bindEvent: function () {
            var that = this;
            this.$el.find('.J_Next').on('click', function () {
                that.submit();
            })
        },
        getPaymchid:function(){
            var _fastPayStore = WalletStore.FastPayStore.getInstance();
            var _paymchid = _fastPayStore.getAttr('bustype');
            console.log('fastpaycard-paymchid:'+_paymchid);
            return _paymchid || this.paymchid;
        },
        submitSuccess:function(data){
            this.forward('validatepremobile?path=fastpay');
        },
        changeCardHandler: function () {
            var _from = fastPayStore.getAttr('from');
            if (_from == 'independentset') {
                _that.forward('fastpaysetting');
            } else if (_from == 'payingset') {
                _that.forward('fastpaysetting?path=defaultcredit');
            }
        },
        returnHandler: function () {
            this.inherited(arguments);
            var _from = fastPayStore.getAttr('from');
            var _isNew = fastPayStore.getAttr('isnew');
            if (_isNew && _isNew == 1) {
                this.back('addcard?path=fastpay');
            } else {
                if (_from == 'independentset') {
                    this.forward('fastpaysetting');
                } else if (_from == 'payingset') {
                    this.forward('fastpaysetting?path=defaultcredit');
                }
            }
        }
    });

    return View;
});