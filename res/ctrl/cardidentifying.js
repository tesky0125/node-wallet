define(['text!cardidentifying_html', 'Util', 'WalletPageView', 'Message'],
function ( html, Util, WalletPageView, Message) {

    var STRING = {
        PAGE_TITLE: '卡验证码'
    };

    var View = WalletPageView.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        onShow: function () {
            this.inherited(arguments);
            this.render();

            var path = this.getQuery('path');

            var obj = {};
            if (path == 'ae') {
                obj.isAE = true;
            } else {
                obj.isAE = false;
            }
            this.$el.html(_.template(html, obj));
            this.turning();
        }
    });

    return View;
});

