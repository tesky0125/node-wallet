/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['Log', 'Util', 'WalletPageView', 'Tradelist', 'WalletModel', 'WalletStore', 'text!withdrawdetail_html'],
function (Log, Util, WalletPageView, Tradelist, WalletModel, WalletStore, html) {

    var STRING = {
        PAGE_TITLE: "提现记录详情"
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        homeBtn: false,
        //backToPage: 'withdrawlist',
        onCreate: function () {
            this.inherited(arguments);
            this.$el.html('');
        },
        onShow: function () {
            this.inherited(arguments);

            var detailStore = WalletStore.WithdrawDetailStore.getInstance();
            this.model = detailStore.get();
            
            if (this.model.wdtype == 1) {//1：普通提现； 2：定向提现；
                this.render();
                this.turning();
                return;
            } else {
                this.loading.show();
                var withdrawDetailModel = WalletModel.WalletWithdrawDetailSearch.getInstance();
                withdrawDetailModel.param.rfno = this.model.rfno;

                withdrawDetailModel.exec({
                    suc: function (data) {
                        this.loading.hide();
                        this.procRcCode(data);
                        if (data.rc == 0) {
                            var wdtype = this.model.wdtype;
                            this.model = data; //update latest data
                            this.model.wdtype = wdtype;
                            if (data.detaillist && data.detaillist[0]) {

                                this.render();

                                var detailDiv = this.$el.find('.J_Detail');
                                Tradelist.setData(data.detaillist, { firseLine: '<li>提现至<span class="fr">金额(元)/状态</span></li>' });
                                var template = Tradelist.getTemplate();
                                detailDiv.html(template);

                                this.turning();
                            } else {
                                this.showToast('充值流水号不存在');
                            }
                        }
                    },
                    //fail: function (data) {
                    //    this.onModelExecFailAsync(data, 330);
                    //},
                    scope: this
                });
            }
        },
        render: function () {
            this.$el.html(_.template(this.tpl, this.model));
        }
    });

    return View;
});
