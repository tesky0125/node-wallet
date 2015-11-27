/**
* @author wxm
* @desc:  Wallet V5.7
*/

define(['WalletStore', 'WalletPageView', 'Config', 'text!debug_html'],
    function (WalletStore, WalletPageView, Config, html) {

    var STRING = {
        PAGE_TITLE: "________"
    };
    var PROTOCOL = {
        'HTTP': 0,
        'HTTPS': 1
    };

    var debugOptStore = WalletStore.DebugOptStore.getInstance();

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
        homeBtn: false,
        backToPage: 'index',
        events: {
            'click .J_Open': function () { this.updateEdit() },
            'click .J_ChkAuth': function () { this.updateEdit() },
            'click .J_Submit': function () {
                var opt = {};
                opt.open = this.els.chb_open.prop('checked');
                opt.domain = this.els.txt_domain.val();
                opt.path = this.els.txt_path.val();
                opt.protocol = this.els.sl_protocol.val();
                opt.useauth = this.els.chb_auth.prop('checked');
                opt.usemock = this.els.chb_mock.prop('checked');
                opt.auth = this.els.txt_auth.val();

                debugOptStore.set(opt);
                this.showToast("测试数据已更新");
                setTimeout(function () {
                    location.reload();
                }, 300);
            }
        },
        onCreate: function () {
            this.inherited(arguments);
            this.render();
        },
        onShow: function () {
            this.inherited(arguments);
            this.turning();
        },
        render: function () {
            if (!Config.DEBUG || Config.ENV == 'pro') {
                return;
            }
            this.$el.html(_.template(this.tpl, this.model));
            this.els = {
                chb_open: this.$el.find(".J_Open"),
                txt_domain: this.$el.find(".J_Domain"),
                txt_path: this.$el.find(".J_Path"),
                bt_submit: this.$el.find(".J_Submit"),
                sl_protocol: this.$el.find(".J_Protocol"),
                chb_auth: this.$el.find(".J_ChkAuth"),
                chb_mock: this.$el.find(".J_ChkMock"),
                txt_auth: this.$el.find(".J_Auth")
            };

            var opt = debugOptStore.get();
            if (opt && opt.domain && opt.path) {
                //has data
                this.els.chb_open.prop('checked', opt.open);
                this.els.txt_domain.val(opt.domain);
                this.els.txt_path.val(opt.path);
                this.els.sl_protocol.get(0).selectedIndex = PROTOCOL[opt.protocol];

                this.els.chb_mock.prop('checked', opt.usemock);
                this.els.chb_auth.prop('checked', opt.useauth);
                this.els.txt_auth.val(opt.auth);
            } else {
                //no data or invalid data
                this.els.chb_open.prop('checked', false);
                this.els.txt_domain.val('wpg.fat18.qa.nt.ctripcorp.com');
                this.els.txt_path.val('soa2/wallet');
                this.els.sl_protocol.get(0).selectedIndex = PROTOCOL['HTTPS'];

                this.els.chb_mock.prop('checked', false);
                this.els.chb_auth.prop('checked', false);
                this.els.txt_auth.val('705BFCE58EFB653CD67A14CF9225C9964B4223FB4668592CD32158F0BE76B4AA');

                //reset values
                opt = {};
                opt.open = false;
                opt.useauth = false;
                opt.usemock = false;
                debugOptStore.set(opt);
            }
            this.$el.find(".J_Ver").text(Config.VER);
            this.$el.find(".J_Cookie").text(document.cookie);
            this.$el.find(".J_Store").text(localStorage.getItem('WALLET_AUTH_INFO'));
            this.updateEdit();
        },
        updateEdit: function () {
            if (this.els.chb_open.prop('checked')) {
                this.els.txt_domain.prop('disabled', false);
                this.els.txt_path.prop('disabled', false);
            } else {
                this.els.txt_domain.prop('disabled', true);
                this.els.txt_path.prop('disabled', true);
            }

            if (this.els.chb_auth.prop('checked')) {
                this.els.txt_auth.prop('disabled', false);
            } else {
                this.els.txt_auth.prop('disabled', true);
            }
        }
    });

    return View;
});
