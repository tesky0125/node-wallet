/**
* @author luzx
* @desc:  Wallet V5.7
*/
	
define(['WalletModel', 'WalletStore', 'WalletPageView', 'text!authstatus_html', 'Message', 'Util', 'Config'],
function (WalletModel, WalletStore, WalletPageView, html, Message, Util, Config) {

    var STRING = {
        PAGE_TITLE: '填写卡信息'
    };

    var View = WalletPageView.extend({
        tpl: html,
        title: STRING.PAGE_TITLE,
        backBtn: true,
	    events: {
	        'click .J_NextBtn': 'goNext',
	        'click .J_SelectLine': 'selectHandler'
	    },
		onCreate: function (){
		    this.inherited(arguments);
		},
		onShow: function () {
		    this.inherited(arguments);
		
		    this.render();
		},
		render: function () {
		    var that = this;
		    this.$el.html(_.template(this.tpl));
		    this.turning();
		}
	});
	
	return View;
});

