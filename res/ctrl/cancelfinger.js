/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletModel', 'WalletStore', 'text!cancelfinger_html', 'Util', 'WalletPageView', 'Message', 'CacheData'],
function (WalletModel, WalletStore, html, Util, WalletPageView, Message, CacheData) {

    var STRING = {
        PAGE_TITLE: '指纹支付',
        CLOSE: '立即关闭',
        CANCEL: '取消'
    };

    var touchModel = WalletModel.TouchPaySet.getInstance();
    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        //backToPage: 'securitycenter',
        events: {
            'click .J_CancelBtn': 'cancelFn'
        },
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
            var that = this;

            this.render();
        },
        render: function () {
            var that = this;

            this.$el.html(_.template(this.tpl));
            this.turning();
        },
        cancelFn: function () {
            var that = this;
            this.showDlg({
                message: Message.get(116),
                buttons: [{
                    text: STRING.CANCEL,
                    click: function () {
                        this.hide();
                    }
                }, {
                    text: STRING.CLOSE,
                    click: function () {
                        this.hide();
                        that.submitCancel.call(that);
                    }
                }]
            });
        },
        submitCancel: function () {
            var that = this;
            var fingetStore = WalletStore.FingerMark.getInstance();

            this.loading.show();
            touchModel.param = {};
            touchModel.param.reqtype = 0;
            CacheData.setIsFpSettingChanged(true);

            touchModel.exec({
                suc: function (info) {
                    that.loading.hide();
                    that.procRcCode(info);
                    if (info.rc == 0) {
                        fingetStore.setAttr('fingerMarkFlag', 2);
                    } else {
                        fingetStore.setAttr('fingerMarkFlag', 3);
                    }
                    //that.back('securitycenter');
                    that.returnHandler();
                },
                fail: function (data) {
                    that.onModelExecFailAsync(data);
                },
                scope: this
            });
        }
    });

    return View;
});

