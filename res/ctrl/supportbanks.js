/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletModel', 'WalletStore', 'WalletPageView', 'text!supportbanks_html', 'Message', 'Util', 'Config'],
function (WalletModel, WalletStore, WalletPageView, html, Message, Util, Config) {

    var STRING = {
        PAGE_TITLE: '支持的银行'
    };

    var CardType = {
        Deposit: 1,
        Credit: 2,
        Both: 3
    };
    var SUPPORT_CARD_SCENE = {
        BINDCARD: 'bindcard',
        FASTPAY: 'fastpay',
        REALNAME: 'realname'
    };
    var SUPPORT_CARD_VARS = {
        'bindcard': {reqtype: 2},
        'fastpay': {reqtype: 4},
        'realname': {reqtype: 8}
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);

            var _mode = this.getQuery('path');

            switch (_mode) {
                case 'bindcard':
                    this.supportcardscene = SUPPORT_CARD_SCENE.BINDCARD;
                    break;
                case 'fastpay':
                    this.supportcardscene = SUPPORT_CARD_SCENE.FASTPAY;
                    break;
                case 'realname':
                    this.supportcardscene = SUPPORT_CARD_SCENE.REALNAME;
                    break;
            };

            var that = this;
            this._checkCardType(function(cardtype){
                that.cardtype = cardtype;
                that._queryCardList(function(){
                    that.render();
                });
            });

        },
        getPaymchid:function(){
            if(this.supportcardscene === SUPPORT_CARD_SCENE.BINDCARD){
                return Config.PAYMCHIDS.BINDCARD;
            }else if(this.supportcardscene === SUPPORT_CARD_SCENE.REALNAME){
                return Config.PAYMCHIDS.REALNAME;
            }else if(this.supportcardscene === SUPPORT_CARD_SCENE.FASTPAY){
                var _fastPayStore = WalletStore.FastPayStore.getInstance();
                var _paymchid = _fastPayStore.getAttr('bustype');
                console.log('supportbanks-paymchid:'+_paymchid);
                return _paymchid || Config.PAYMCHIDS.FASTPAY;
            }
        },
        _checkCardType:function(cbCheck){
            var checkStore = WalletStore.PublicCheckStore.getInstance();
            var cardtype = checkStore.getAttr('cardtype');
            if(cardtype){
                cbCheck && cbCheck(cardtype);
            }else{
                this.loading.show();
                var _checkCardTypeModel = WalletModel.PublicCheck.getInstance();
                _checkCardTypeModel.param = {};
                _checkCardTypeModel.param.paymchid = this.getPaymchid();
                _checkCardTypeModel.param.reqtype = 3;
                _checkCardTypeModel.param.reqparam = SUPPORT_CARD_VARS[this.supportcardscene].reqtype;
                _checkCardTypeModel.exec({
                    suc: function (data) {
                        this.loading.hide();
                        if (data.rc == 0) {
                            var cardtype = parseInt(data.desc, 10);
                            cbCheck && cbCheck(cardtype);
                        }
                    },
                    fail: this.onModelExecFailAsync,
                    scope: this
                });
            }
        },
        _queryCardList:function(cbQuery){
            this.loading.show();
            var _queryTextModel = WalletModel.PublicQueryListInfo.getInstance();
            _queryTextModel.param = {};
            _queryTextModel.param.paymchid = this.getPaymchid();
            _queryTextModel.param.reqtype = this._getQueryListReqType();
            _queryTextModel.param.reqparam = this.cardtype;
            _queryTextModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    if (data.rc == 0) {
                        if(this.cardtype === CardType.Credit || this.cardtype === CardType.Both) {
                            this.ccbanklist = this.forMatBank(data.ccbanklist);
                        }
                        if(this.cardtype === CardType.Deposit || this.cardtype === CardType.Both){
                            this.dcbanklist = this.forMatBank(data.dcbanklist);
                        }
                        cbQuery && cbQuery();
                    }
                },
                fail: this.onModelExecFailAsync,
                scope: this
            });
        },
        initEvent: function () {
            var that = this;
            this.$el.find('.J_Tabs').bind('click', function () {
                that.$el.find('.J_Tabs').removeClass('cui-tab-current');
                $(this).addClass('cui-tab-current');
                if ($(this).hasClass('J_CC')) {
                    that.showCCBankList();
                } else {
                    that.showSCBankList();
                }

                //copy from framework: c.ui.tab.js
                //三星手机渲染有问题，这里动态引起一次回流
                if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
                    var width = that.$el.find('.cui-tab-scrollbar').css('width');
                    setTimeout($.proxy(function () {
                        that.$el.find('.cui-tab-scrollbar').css('width', width);
                    }, that), 0);
                }
            });
        },
        render: function () {
            var _model = {};
            _model.cardtype = this.cardtype;

            this.$el.html(_.template(this.tpl, _model));

            if (this.cardtype === CardType.Both) {
                this.initEvent();
            }

            if(this.cardtype === CardType.Credit || this.cardtype === CardType.Both){
                this.showCCBankList();
            }else{
                this.showSCBankList();
            }

            this.turning();
        },
        _getQueryListReqType:function(){
            var reqType;
            switch (this.supportcardscene){
                case SUPPORT_CARD_SCENE.BINDCARD:
                    reqType = 2;
                    break;
                case SUPPORT_CARD_SCENE.FASTPAY:
                    reqType = 3;
                    break;
                case SUPPORT_CARD_SCENE.REALNAME:
                    reqType = 4;
                    break;
            }
            return reqType;
        },
        showCCBankList: function () {
            var ul = '';
            for (var i in this.ccbanklist) {
                ul += this.getUl(i, this.ccbanklist[i]);
            }
            this.$el.find('.J_Container').html(ul);
        },
        showSCBankList: function () {
            var ul = '';
            for (var i in this.dcbanklist) {
                ul += this.getUl(i, this.dcbanklist[i]);
            }
            this.$el.find('.J_Container').html(ul);
        },
        forMatBank: function (list) {
            var obj = {};
            list.sort(function (i, j) {
                return i.fchar < j.fchar ? -1 : 1;
            });
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (!obj[item.fchar]) {
                    obj[item.fchar] = [];
                }
                obj[item.fchar].push(item.bname);
            }

            return obj;
        },
        getUl: function (title, list) {
            var ul = ''+
                '<div class="mb5 grey2 p0_15 mt10">' + title + '</div>' +
                '<ul class="border2 p10li mb10 font14">';
            for (var i = 0; i < list.length; i++) {
                ul += '<li>' + list[i] + '</li>';
            }

            ul += '</ul>';
            return ul;
        }
    });

    return View;
});

