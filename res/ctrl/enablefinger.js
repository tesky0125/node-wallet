/**
* @author luzx
* @desc:  Wallet V5.7
*/

define(['WalletModel', 'WalletStore', 'text!enablefinger_html', 'Util', 'WalletPageView', 'Message'],
function (WalletModel, WalletStore, html, Util, WalletPageView, Message) {

    var STRING = {
        PAGE_TITLE: '指纹支付'
    };

    var touchModel = WalletModel.TouchPaySet.getInstance();
    var View = WalletPageView.extend({
        title: STRING.PAGE_TITLE,
        backBtn: true,
        //backToPage: 'securitycenter',
        onCreate: function () {
            this.inherited(arguments);
        },
        onShow: function () {
            this.inherited(arguments);
            var that = this;
            this.render();
            this.bindEvent();
        },
        render: function () {
            var that = this;
            this.$el.html(html);

            var $pic = this.$el.find('.J_Pic');
            if (Util.isIphone()) {
                $pic.addClass('openpayment2').removeClass('openpayment');
            } else {
                $pic.addClass('openpayment').removeClass('openpayment2');
            }

            this.turning();
        },
        bindEvent: function () {
            var that = this;
            var $select = this.$el.find('.J_Select');
            var $confirm = this.$el.find('.J_Confirm');
            var $obligation = this.$el.find('.J_Obligation');
            $select.on('click', function () {
                if ($select.hasClass('checked')) {
                    $select.removeClass('checked');
                    $confirm.addClass('gray');
                } else {
                    $select.addClass('checked');
                    $confirm.removeClass('gray');
                }
            });

            $confirm.on('click', function () {
                if (!$confirm.hasClass('gray')) {
                    that.forward('verfiedpsd?path=finger');
                }
            });

            $obligation.on('click', function () {
                that.forward('obligation');
            })
        }
    });

    return View;
});

