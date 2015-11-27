define(['text!cardvalidity_html', 'Util', 'WalletPageView', 'Message'],
function ( html, Util, WalletPageView, Message) {

    var STRING = {
        PAGE_TITLE: '卡有效期说明'
    };

    var View = WalletPageView.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        onShow: function () {
            this.inherited(arguments);
            this.render();
            this.$el.html(html);
            this.turning();
        }
    });

    return View;
});

