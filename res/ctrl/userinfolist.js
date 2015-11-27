/**
 * @author chen.yun
 * @desc:  Wallet V6.9
 */
define(['WalletStore',  'WalletPageView',  'cUtilCryptBase64'],
	function(WalletStore,  WalletPageView,  cUtilCryptBase64) {
		var selectInfo = WalletStore.SelectInfo.getInstance(),
			sltInfoList = WalletStore.SltInfoList.getInstance(),
			userInfoStore = WalletStore.UserInfoStore.getInstance();
		var STRING = {
			PAGE_TITLE: "选择认证信息"
		};
		var templateContain = '<article class="wrap"><ul class="border2 p10_15li font14 grey2" id="userinfolist"></ul></article>';
		var itemTemplate = '<li data-cname="<%=cname%>" data-idno="<%=idno%>" data-idname="<%=idname%>" data-idtype="<%=idtype%>">' +
			'<span class = "valign blue right10" > 选择 </span>' +
			'<div class = "cblack font16" ><%=cname%></div>' +
			'<div class = "font13 grey" > <span class = "fl pr20" > <%=idname%></span><%=idno%></div >' +
			'</li>';
		var View = WalletPageView.extend({
			tpl: templateContain,
			title: STRING.PAGE_TITLE,
			backBtn: true,
			homeBtn: false,
			//backToPage: 'addaccountinfo',
			itemTemplate: itemTemplate,
			onCreate: function() {
				this.inherited(arguments);
				this.render();
			},
			onShow: function() {
				this.inherited(arguments);
				this.turning();
			},
			render: function() {
				this.nowUid=userInfoStore.getAttr("uid");
				this.idname = sltInfoList.getAttr("typeName");
				this.typelist = sltInfoList.getAttr('typelist');
				this.$el.html(_.template(this.tpl));
				this.itemContainter = this.$el.find('#userinfolist');
				var $frg = $(document.createDocumentFragment());
				var that = this;
				_.each(this.typelist, function(num) {
					if (num.cname) {
						num.cname = cUtilCryptBase64.Base64.decode(num.cname)
					}
					num.idname = that.idname;
					$frg.append(_.template(that.itemTemplate, num));
				})
				this.itemContainter.append($frg);

			},
			events: {
				'click #userinfolist>li': 'chooseInfo'
			},
			chooseInfo: function(e) {
				var cname = $(e.currentTarget).attr('data-cname'),
					idno = $(e.currentTarget).attr('data-idno'),
					idname = $(e.currentTarget).attr('data-idname'),
					idtype = $(e.currentTarget).attr('data-idtype');
				selectInfo.setBase64('cname', cname);
				selectInfo.setAttr('idno', idno);
				selectInfo.setAttr('idname', idname);
				selectInfo.setAttr('idtype', idtype);
				selectInfo.setAttr('oldUid', this.nowUid);
				this.back('addaccountinfo')
			}
		});
		return View;
	});