define(['Util', 'WalletPageView', 'Message','WalletModel'],
function (Util, WalletPageView, Message, WalletModel) {

    var STRING = {
        PAGE_TITLE: '支付服务协议'
    };

    var createP = function (textObj) {
        var p = '<article class="wrap font12 p10">';
        for (var i in textObj) {
            p += '<p class="font13 mb10">' + i + '</p>';
            p += '<p class="mb10">' + textObj [i]+ '</p>';
        }

        p += '</article>';
        return p;
    };

    var View = WalletPageView.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        onShow: function () {
            this.inherited(arguments);

            var that = this;
            this.loading.show();
            var reqparam = this.getQuery('param');
            var _queryTextModel = WalletModel.WalletPublicQueryText.getInstance();
            _queryTextModel.param = {};
            _queryTextModel.param.reqtype = 6;//获取支持信用卡银行列表
            _queryTextModel.param.reqparam = reqparam;
            
            _queryTextModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    if (data.rc == 0) {
                        var text = data.text;
                        try{
                            text = JSON.parse(text);
                            text = createP(text);
                        } catch (e) { }

                        that.$el.html(text);
                    }
                    that.turning();
                },
                fail: function (data) {
                    this.onModelExecFailAsync(data, 330);
                },
                scope: this
            });

            
        }
    });

    return View;
});

