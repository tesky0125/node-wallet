/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Log', 'Util', 'WalletPageView', 'WalletModel', 'WalletStore', 'text!transactdetail_html'],
function (Log, Util, WalletPageView, WalletModel, WalletStore, html) {

    var STRING = {
        PAGE_TITLE: "收支详情"
    };

    var tradeDetailModel = WalletModel.WalletTradeDetailSearch.getInstance();

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        homeBtn: false,
        //backToPage: 'tranxlist',
        onCreate: function () {
            this.inherited(arguments);
            this.$el.html('');
        },
        onShow: function () {
            this.inherited(arguments);

            this.loading.show();

            tradeDetailModel.param.rfno = this.getQuery('rfno');
            tradeDetailModel.exec({
                suc: this._gettrandetail_suc,
                scope: this
            });
        },
        render: function () {
            this.$el.html(_.template(this.tpl, this.model));
        },
        _gettrandetail_suc: function (data) {
            this.loading.hide();
            
            try {
                if (data.rc != 0) {
                    this.procRcCode(data);
                } else {
                    this.model = data;

                    this.render();
                }                
            } catch (err) {
                Log.Error('Error: Transact detail data parsing fail, pls check response format');
                Log.Error(err);
            }
            this.turning();
        }
    });

    return View;
});
