define(['text!obligation_html', 'Util', 'WalletPageView', 'Message'],
function ( html, Util, WalletPageView, Message) {

    var STRING = {
        PAGE_TITLE: '携程指纹支付协议'
    };

    var View = WalletPageView.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        //backToPage: 'securitycenter',
        onShow: function () {
            this.inherited(arguments);
            this.render();
            this.$el.html(html);
            this.turning();
        }
    });

    return View;
});

