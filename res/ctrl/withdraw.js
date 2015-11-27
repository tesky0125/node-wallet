/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'text!withdraw_html', 'ModelObserver', 'Message','Config'],
function (Log, Util, WalletPageView, WalletModel, WalletStore, html, ModelObserver, Message, Config) {

    var STRING = {
        PAGE_TITLE: "提现",

        TRANSDER_TITLE: "转出到储蓄卡"
    };

    var bankCardModel = WalletModel.WalletBindedCreditCardListSearch.getInstance();
    var store = WalletStore.HisCardItemStore.getInstance();
    var WithdrawCardStore = WalletStore.WithdrawCard.getInstance();

    var Withdraw = {
        title: STRING.PAGE_TITLE,
        backToPage: 'transacthistory',
        _goAdd: function () {
            this.forward('addcard');
        },
        _onItemClick: function (item) {
            store.setBase64(item);
            this.forward('withdrawcard?path=history');
        }
    };

    var Transfer = {
        title: STRING.TRANSDER_TITLE,
        backToPage: 'useraccount',
        _goAdd: function () {
            this.forward('addcard?path=transfer');
        },
        _onItemClick: function (item) {
            var _transfer2Store = WalletStore.Transfer2Store.getInstance();
            _transfer2Store.setAttr('item', item);

            this.forward('transfertocard?path=history');
        }
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        events: {
            'click .J_AddNewCard': function (e) {
                this._goAdd();
            },
            'click .J_HisCard': function (e) {
                var _id = $(e.currentTarget).attr('data-cardid');
                var _item = _.findWhere(this.model.cardlist, { cardid: _id });

                this._onItemClick(_item);
            }
        },
        onCreate: function () {
            this.inherited(arguments);
            this.$el.html('');
        },
        onShow: function () {
            var _path = this.getQuery('path');

            switch (_path) {
                case 'transfer':
                    Util.mix(this, Transfer);
                    this.inherited(arguments);
                    this._showOnDataReady();
                    break;
                default:
                    Util.mix(this, Withdraw);//默认来自提现.
                    this.inherited(arguments);

                    //wxm add 2015/5/5
                    try {
                        var bhasUA = WalletStore.UserAccountStore.getInstance().hasAccountData();
                        var bhasUI = WalletStore.UserInfoStore.getInstance().hasUserData();
                        //check account store data first, because addcard->withdrawcard will check account store data in the end
                        if (!bhasUA) {
                            ModelObserver.register({
                                showLoading: true,
                                scope: this,
                                refresh: true,
                                model: 'WalletAccountSearch',
                                param: { reqbmp: 0 },
                                cbSuc: function() {
                                    if(bhasUI){
                                        this._showOnDataReady();
                                    }
                                },
                                cbFail: function() { this.showToast(Message.get(123), _.bind(this.returnHandler, this)); },
                            });
                        }

                        //check account store data first, because addcard will check userinfo store data in the end
                        if (!bhasUI) {
                            ModelObserver.register({
                                showLoading: true,
                                scope: this,
                                refresh: true,
                                model: 'WalletUserInfoSearch',
                                param: { reqbmp: 0 },
                                cbSuc: function() {
                                    this._showOnDataReady();
                                },
                                cbFail: function() { this.showToast(Message.get(123), _.bind(this.returnHandler, this)); },
                            });
                        }

                        if(bhasUA && bhasUI){
                            this._showOnDataReady();
                        }
                    } catch (err) { };
                    //wxm add end

                    break;
            }
        },
        _showOnDataReady: function() {
            this.loading.show();

            bankCardModel.param = {};
            bankCardModel.param.reqtype = 1;
            bankCardModel.param.authstatus = 12;
            bankCardModel.param.paymchid = Config.PAYMCHIDS.DEFAULT;
            bankCardModel.exec({
                suc: this._getbankcardlist_suc,
                scope: this
            });

            if (WithdrawCardStore.getAttr('dataChanged')) {
                WithdrawCardStore.setAttr('dataChanged', null);
                ModelObserver.register({
                    scope: this,
                    refresh: true,
                    model: 'WalletUserInfoSearch',
                    param: { reqbmp: 0 }
                });
            }
        },
        onHide: function () {
            this.inherited(arguments);
        },
        render: function () {
            this.$el.html(_.template(this.tpl, this.model));
        },
        _getbankcardlist_suc: function (data) {
            this.loading.hide();

            try {
                if (data.rc != 0) {
                    this.procRcCode(data);
                } else {
                    this.model = data;

                    this.render();
                }
            } catch (err) {
                Log.Error('Error: get bankcard list data parsing fail, pls check response format');
                Log.Error(err);
            }
            this.turning();
        },
        _goAdd: function () {
            //for override.
        },
        _onItemClick: function (item) {
            //for override.
        }
    });

    return View;
});
