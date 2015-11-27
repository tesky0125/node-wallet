/**
 * @module todebitcard
 */
define(['CommonStore', 'WalletStore', 'WalletModel', 'WalletPageView', 'text!todebitcard_html', 'Util', 'cUtilCryptBase64', 'cGuiderService', 'CacheData'],
		function (commonStore, WalletStore, WalletModel, WalletPageView, html, Util, cUtilCryptBase64, cGuiderService, CacheData) {
		    var STRING = {
				IDENTITY: '身份证'
			};

			var userStore = commonStore.UserStore.getInstance(),
                userInfo = userStore.getUser(),
                addrStore = WalletStore.SelectAddrStore.getInstance(),
                transferStore = WalletStore.TransferStore.getInstance(),
                customerTradingInfoModel = WalletModel.WalletUserInfoSearch.getInstance(), //账户相关信息
                transDepositCardModel = WalletModel.ExgOrGainModel.getInstance(),
                reCashAcctModel = WalletModel.ReCashListModel.getInstance();

		    var reCashWayModel = WalletModel.ExchangeTicketMethodModel.getInstance();
		    var reCashWayListStore = WalletStore.ReCashWayListStore.getInstance();

		    var View = WalletPageView.extend({
		        tpl: html,
		        backBtn: true,
		        title: "转账到储蓄卡",
		        headerBtn: { title: "转账说明", id: 'J_Explain', classname: 'explain' },
		        commitHandler: {
		            id: 'J_Explain', callback: function () {
		                var tpl = '<div class="paytips">'
                            + '<h2 class="t_c">储蓄卡转账说明</h2>'
                            + '<div class="mb10">目前支持中国、工商、农业、招商、建设、交通、兴业、广发、中信、民生、光大、浦发、上海、平安银行的储蓄卡转账。</div>'
                            + '<div class="mb10">储蓄卡转账的到账期约为10个工作日。</div>'
                            + '<div class="mb10">储蓄卡转账每次最大额度为{1}元。</div>'
                            + '</div>';
		                this.getCstMsg().showMessage(Util.formatStr(tpl, this.maxValue));
		            }
		        },
		        returnHandler: function () {
		           var self = this;
		           self.resetData();
		           self.resetInfo();
		           cGuiderService.apply({
		               hybridCallback: function () {
		                   self.$el.find(".cui-input-error").removeClass("cui-input-error");
		                   self.forward("useraccount");
		               },
		               callback: function () {
		                   //去掉之前加的高亮状态
		                   self.$el.find(".cui-input-error").removeClass("cui-input-error");
		                   self.forward("useraccount")
		               }
		           });
		        },
		        onCreate: function () {
		            this.inherited(arguments);
		            this.render();
		            var self = this;
		            //self.resetData();

		            this.maxValue = "", minValue = "";
		            console.log("creat");
		        },
		        render: function () {
		            this.$el.html(this.tpl);
		            this.els = {
		                container: this.$el.find("#card_cont"),
		                reCashAmt: this.$el.find("#js_balance"),
		                cardAmt: this.$el.find("#js_amount"),
		                cityName: this.$el.find("#js_bank_city>i"),
		                bankName: this.$el.find("#js_bank i"),
		                cardType: this.$el.find("#js_id_type i"),
		                bankInfo: this.$el.find("#js_bank"),
		                openBankName: this.$el.find("#js_bank_name"),
		                name: this.$el.find("#js_name"),
		                cardNo: this.$el.find("#js_card_no"),
		                idType: this.$el.find("#js_id_type"),
		                idNo: this.$el.find("#js_id_no")
		            };
		            console.log("render");

					this.els.idNo.unbind().bind('input', _.bind(this._cardNoInput, this));
		        },
				_cardNoInput: function () {
					var val = this.els.idNo.val();
					var type = this.els.cardType.text();
					var totalLen = val.length;
					var validLen = val.replace(/\s/g,'').length;
					if(type === STRING.IDENTITY && validLen >= 18){
						this.els.idNo.attr('maxlength',totalLen);
					}else{
						this.els.idNo.removeAttr('maxlength');
					}
				},
		        getCashAcctInfo: function () {
		            var self = this;
		            if (!transferStore.getAttr('availableAmount', self.uid) || !transferStore.getAttr('hasPassword', this.uid)) {
		                this.showLoading();
		                reCashAcctModel.setParam("reqbmp", 4);
		                reCashAcctModel.exec({
		                    suc: this._getReCashAcct,
		                    scope: this,
		                    fail: function () {
		                        self.showErrMsgOnLoad();
		                    },
		                    abort: function () {
		                        self.showErrMsgOnLoad();
		                    }
		                });
		            } else {
		                var exist = this.getTransferToCardWay();
		                if (exist) {
		                    //展示页面
		                    this.updatePage();
		                } else {
		                    this.showLoading();
		                    // 获取返现方式列表.
		                    this.getReCashWayList();
		                }
		            }


		        },
		        getReCashWayList: function () {
		            reCashWayModel.exec({
		                scope: this,
		                suc: function (data) {
		                    if (data && data.rc == 0) {
		                        this.loading.hide();
		                        var exist = this.getTransferToCardWay(data);
		                        if (exist) {
		                            this.updatePage();
		                        } else {
		                            //服务端不支持 waytype：2 转账到储蓄卡
		                            this.back("useraccount");
		                        }
		                    } else {
		                        this.loading.hide();
		                        this.procRcCode(data);
		                    }
		                },
		                fail: function () {
		                    this.showErrMsgOnLoad();
		                }
		            });
		        },
		        getTransferToCardWay: function (data) {
		            var result = data || reCashWayListStore.get();
		            var array = result && result.waylist || [];
		            var exist = false;
		            var that = this;
		            _.each(array, function (item) {
		                if (item.waytype == 2) {
		                    //转账到储蓄卡.
		                    that.minValue = item.minval;
		                    that.maxValue = item.maxval;
		                    exist = true;
		                }
		            });
		            return exist;
		        },
		        _getReCashAcct: function (data) {
		            var self = this;
		            if (data && data.rc == 0) {
		                self.els.reCashAmt.text(data.cashamt);
		                transferStore.setAttr('availableAmount', data.cashamt, self.uid);
		                customerTradingInfoModel.param = {reqbmp: 2};
		                customerTradingInfoModel.exec({
		                    suc: this._CashListSuc,
		                    scope: this,
		                    fail: function () {
		                        self.showErrMsgOnLoad();
		                    },
		                    abort: function () {
		                        self.showErrMsgOnLoad();
		                    }
		                });
		            } else {
		                self.showErrMsgOnLoad();
		            }
		        },
		        _CashListSuc: function (data) {
		            var self = this;
		            if (!customerTradingInfoModel.hasPwdData()) {
		                self.showErrMsgOnLoad();
		                return;
		            }
		            var balInfo = data.balanceinfo;
		            transferStore.setAttr('hasPassword', data.haspwd, self.uid);

		            var exist = self.getTransferToCardWay();
		            if (exist) {
		                self.hideLoading();
		                //展示页面
		                self.updatePage();
		            } else {
		                // 获取返现方式列表.
		                self.getReCashWayList();
		            }
		        },
		        setInfo: function () {
		            window._walletInfo = {
		                amount: this.els.cardAmt.val(),
		                bankname: this.els.openBankName.val(),
		                name: this.els.name.val(),
		                card_no: this.els.cardNo.val().replace(/\s/g, ''),
		                id_no: this.els.idNo.val()
		            };
		        },
		        showInfo: function () {
		            var obj = window._walletInfo;
		            for (var p in obj) {
		                switch (p) {
		                    case "amount":
		                        this.els.cardAmt.val(obj[p]);
		                        break;
		                    case "bankname":
		                        this.els.openBankName.val(obj[p]);
		                        break;
		                    case "name":
		                        this.els.name.val(obj[p]);
		                        break;
		                    case "card_no":
		                        this.els.cardNo.val(obj[p].replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1 "));
		                        break;
		                    case "id_no":
		                        this.els.idNo.val(obj[p]);
		                        break;
		                    default:
		                        break;
		                }
		            }
		        },
		        resetInfo: function () {
		            if (window._walletInfo) {
		                window._walletInfo = null;
		            }
		        },
		        onShow: function () {
		            this.inherited(arguments);
		            var self = this;
		            this.getCashAcctInfo(); //获取用户信息
		            this.showInfo();
		            this.turning();
		            window.commonRule = this.commonRule();

		            console.log("load");
		            if (this.$el.find("#js_bank_name").length > 0) {
		                this.focus();
		            }
		        },
		        getDatas: function () {
		            var data = {};
		            var _els = this.els;
		            //转账金额
		            data.amount = _els.cardAmt.val().trim() == "" ? "" : (+_els.cardAmt.val().trim());
		            //余额
		            data.balance = parseInt(_els.reCashAmt.text());

		            //开户行所在城市
		            data.bankCity = _els.cityName.text().trim();
		            //开户行
		            data.bank = _els.bankName.text();
		            //开户行ID
		            data.bankId = _els.bankInfo.data("id");
		            //开户行名称
		            data.bankname = _els.openBankName.val();
		            //姓名
		            data.name = _els.name.val();
		            //卡号
		            data.card_no = _els.cardNo.val().replace(/\s/g, '');
		            //证件类型
		            data.id_type = _els.idType.data("value");
		            //证件名称
		            data.id_name = _els.cardType.text();
		            //证件号
		            data.id_no = _els.idNo.val().replace(/\s/g, '');
		            return data;
		        },
		        focus: function () {
		            if (location.href.indexOf("frombank") > 0) {
		                //如果从选择银行页回来的，则光标聚在开户行名称上
		                setTimeout("document.getElementById(\"js_bank_name\").focus();", 500);
		            };
		        },
		        onHide: function () {
		            this.inherited(arguments); //wxm: close custommessage when hide
		            this.hideLoading();
		        },
		        saveData: function () {
		            //保存当前表单信息
		            var d = this.getDatas();

		            transferStore.setAttr('amount', d.amount);
		            transferStore.setAttr('bankid', d.bankId);
		            transferStore.setAttr('bankname', d.bank);
		            transferStore.setAttr('openbkname', d.bankname); //开户行名称
		            transferStore.setAttr('idname', d.id_name); //证件类型名称
		            transferStore.setAttr('idtype', d.id_type); //证件类型id
		            transferStore.setAttr('holder', d.name);


		            transferStore.setAttr('tktype', "");
		            transferStore.setAttr('vercode', "");

		            //设置银行地址信息
		            var addr = addrStore.get();
		            transferStore.setAttr('prvid', (addr && parseInt(addr.prvnId)) || "");
		            transferStore.setAttr('prvname', (addr && addr.prvnName) || "");
		            transferStore.setAttr('cityid', (addr && parseInt(addr.dstrId)) || "");
		            transferStore.setAttr('cityname', (addr && addr.dstrName) || "");
		            console.log(transferStore.get());
		        },

		        events: {
		            'click #js_submit': 'submit',
		            'click #js_bank_city': 'chooseBankCity',
		            'click #js_bank': 'gotoBank',
		            'click #js_id_type': function () {
		                this.setInfo();
		                this.forward('transferid');
		            },
		            'click #js_exchange': function () {
		                this.forward("manualtogift?source=" + encodeURIComponent('todebitcard') + "&entry=card");
		            },
		            'blur #js_card_no': function (e) { e.target.value = e.target.value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1 ") },
		            'focus #js_card_no': function (e) { e.target.value = e.target.value.replace(/\s/g, '') },
		            'click #js_bankname_wrap': function () { $("#js_bank_name")[0].focus(); },
		            'blur input': function (e) {
		                if (document.activeElement.tagName.toLowerCase() != 'input') {
		                    $(window).scrollTop(0);
		                }
		            }
		        },
		        getSelData: function () {//获得选择的信息内容
		            var data = null;
		            var self = this;
		            //设置银行地址信息
		            var addr = addrStore.get();
		            if (addr) {
		                transferStore.setAttr('prvid', addr.prvnId);
		                transferStore.setAttr('prvname', addr.prvnName);
		                transferStore.setAttr('cityid', addr.dstrId);
		                transferStore.setAttr('cityname', addr.dstrName);
		            }
		            data = transferStore.get();
		            return data;
		        },
		        updatePage: function () {
		            var recashAmt = transferStore.getAttr('availableAmount', self.uid);
		            this.els.reCashAmt.text(recashAmt);
		            var data = this.getSelData();
		            if (data) {
		                this.els.cityName.text(data.prvname + " " + data.cityname);
		                this.$el.find("#js_bank").attr("data-id", data.bankid);
		                this.els.bankName.text(data.bankname);
		                this.els.cardType.text(data.idname || "身份证");
		                this.$el.find("#js_id_type").attr("data-value", data.idtype || 1);
		                if (data.bankname) {
		                    this.$el.find("#js_bankname_wrap").show();
		                } else {
		                    this.$el.find("#js_bankname_wrap").hide();
		                }
		            }
		        },
		        gotoBank: function () {
		            this.setInfo();
		            this.forward('selbankcard');
		        },
		        gotoID: function () {
		            this.forward('transferid');
		        },
		        chooseBankCity: function () {
		            this.setInfo(); //存储信息
		            addrStore.setAttr('from', 'transfer');
		            this.forward('addpostprovince');
		        },
		        resetData: function () {
		            var self = this;
		            this.els.cityName.text("");
		            this.$el.find("#js_bank").attr("data-id", "");
		            this.els.bankName.text("");
		            this.els.cardType.text("身份证");
		            this.$el.find("#js_id_type").attr("data-value", 1);
		            this.els.cardAmt.val("");
		            this.$el.find("#js_name").val("");
		            this.$el.find("#js_bank_name").val("");
		            this.$el.find("#js_card_no").val("");
		            this.$el.find("#js_id_no").val("");
		            addrStore.remove();
		            transferStore.remove();
		        },
				formatIDCard:function(){
            		if(this.els.idNo[0]){
            			var type = this.els.cardType.text().replace(/\s/g, '');
						var idcode = this.els.idNo.val();
            			if(type === STRING.IDENTITY){
							this.els.idNo.val(Util.formatChinaIDCard(idcode));
						}else{
							this.els.idNo.val(Util.formatIDCard(idcode));
						}
					}
				},
		        submit: function () {
		            //所有的input去前后空格
		            _.each(this.$el.find("input"), function (e) { $(e).val($(e).val().trim()) });
		            //去掉金额开始的0
		            this.els.cardAmt.val(this.els.cardAmt.val().replace(/^0+/g, ''));
		            //去掉之前加的高亮状态
		            this.$el.find(".cui-input-error").removeClass("cui-input-error");
		            //存储当前值
		            this.saveData();
		            //检测
		            this.detect();
					this.formatIDCard();
		        },
		        commonRule: function () {
		            //常规规则
		            var valideRule = {
		                "isEmpty": function (s) { return !(/.+/.test(s)); },
		                "isNum": function (s) { return /^\d*$/.test(s); },
		                "lessThan": function (s, n) { return s < n; },
		                "moreThan": function (s, n) { return s > n; },
		                "lengthEqual": function (s, l) { return s.length == l; },
		                "lengthLess": function (s, l) { return s.length < l; },
		                "lengthMore": function (s, l) { return s.length > l; },
		                "isName": function (s) { return (/^[A-Za-z\u4e00-\u9fa5\s\/]*$/.test(s)); },
		                "isCorrectId": function (s) { return (/^[A-Za-z\d]+$/.test(s)); },
		                "isCertificate": function (s) { return s == "身份证"; }, //是否身份证
						"testIDCard":function(s){
							return Util.isValidChinaIDCard(s);
						}
		                /*"testIDCard": function (idcard) {
		                    var Errors = new Array("ok", "请输入正确的身份证号码!", "请输入正确的身份证号码!", "请输入正确的身份证号码!", "请输入正确的身份证号码!"); //请输入正确的身份证号码2012-9-19
		                    var area = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "xinjiang", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" }
		                    var idcard, Y, JYM;
		                    var S, M;
		                    var idcard_array = new Array();
		                    idcard_array = idcard.split("");
		                    if (area[parseInt(idcard.substr(0, 2))] == null) return Errors[4];
		                    switch (idcard.length) {
		                        case 18:
		                            if (parseInt(idcard.substr(6, 4)) % 4 == 0 || (parseInt(idcard.substr(6, 4)) % 100 == 0 && parseInt(idcard.substr(6, 4)) % 4 == 0)) {
		                                ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; //闰年出生日期的合法性正则表达式
		                            }
		                            else {
		                                ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; //平年出生日期的合法性正则表达式
		                            }
		                            if (ereg.test(idcard)) {
		                                S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 + (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9 + (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10 + (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5 + (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8 + (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4 + (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2 + parseInt(idcard_array[7]) * 1 + parseInt(idcard_array[8]) * 6 + parseInt(idcard_array[9]) * 3;
		                                Y = S % 11;
		                                M = "F";
		                                JYM = "10X98765432";
		                                M = JYM.substr(Y, 1);
		                                if (M.toUpperCase() == idcard_array[17].toUpperCase())
		                                    return Errors[0];
		                                else
		                                    return Errors[3];
		                            }
		                            else
		                                return Errors[2];
		                            break;
		                        default: return Errors[1]; break;
		                    }
		                }*/

		            };

		            return valideRule;
		        },
		        validater: function (rule) {
		            var isPass = true;
		            //规则检验器
		            var that = this;
		            for (var i = 0; i < rule.length; i++) {
		                var item = rule[i];
		                if (item.tester) {
		                    if (isPass == true) {
		                        //高亮和聚集第一项
		                        window.errorEle = item.el;
		                        that.showToast(item.msg, 1.2, function () {
		                            $(window.errorEle)[0].focus();
		                        });
		                    };
		                    isPass = false;
		                    var $ele = this.els.container.find("li" + item.el).length > 0 ? this.els.container.find("li" + item.el) : this.els.container.find(item.el).parents("li");
		                    $ele.addClass("cui-input-error");
		                    //return;
		                };
		            }
		            return isPass;
		        },

		        detect: function () {

		            var params = transferStore.get();

		            var els = this.getDatas();
					var disable = this.els.idNo.prop('readonly');
		            var v = window.commonRule;
		            var rule = [{ tester: v.isEmpty(els.amount), msg: "请填写转账金额", el: "#js_amount" },
								{ tester:!v.isNum(els.amount),msg:"转账金额请填写整数",el:"#js_amount"},
		       					{ tester: v.moreThan(els.amount, els.balance), msg: "返现账户余额不足", el: "#js_amount" },
                                { tester: this.maxValue > 0 && v.moreThan(els.amount, this.maxValue), msg: Util.formatStr("每次最高转账额度是{1}元", this.maxValue), el: "#js_amount" },
                                { tester: this.minValue > 0 && v.lessThan(els.amount, this.minValue), msg: Util.formatStr("每次最低转账额度是{1}元", this.minValue), el: "#js_amount" },
                                { tester: v.isEmpty(els.bankCity), msg: "请选择开户银行所在城市", el: "#js_bank_city" },
                                { tester: v.isEmpty(params.cityid) || v.isEmpty(params.prvid), msg: "请选择完整的地区信息(省份和城市)", el: "#js_bank_city" },
                                { tester: v.isEmpty(els.bank), msg: "请选择银行", el: "#js_bank" },
                                { tester: v.isEmpty(els.bankname), msg: "请填写开户行名称", el: "#js_bank_name" },
                                { tester: v.isEmpty(els.name), msg: "请填写开户人姓名", el: "#js_name" },
                                { tester: v.lengthLess(els.name, 2) || v.lengthMore(els.name, 40) || (!v.isName(els.name)), msg: "请填写正确的开户人姓名", el: "#js_name" },
                                { tester: v.isEmpty(els.card_no), msg: "请填写银行卡号", el: "#js_card_no" },
                                { tester: (!v.isNum(els.card_no)) || v.lengthLess(els.card_no, 12) || v.lengthMore(els.card_no, 22), msg: "请填写正确的储蓄卡卡号，或更换其他储蓄卡", el: "#js_card_no" },
                                { tester: v.isEmpty(els.id_no), msg: "请填写持卡人证件号码", el: "#js_id_no" },
                                { tester: !v.isCorrectId(els.id_no), msg: "请填写正确的持卡人证件号码", el: "#js_id_no" },
		            			//身份证验证
                                { tester: v.isCertificate(els.id_name) && !disable && !v.testIDCard(els.id_no), msg: "请输入正确的证件号码", el: "#js_id_no" }
		            ];
		            //如果验证通过
		            if (this.validater(rule)) {
		                var self = this;
		                self.psd.show({
		                    title: '输入支付密码',
		                    content: '从 返现账户 转￥' + parseInt(els.amount) + '到 ' + els.bank + '储蓄卡（卡号 ' + Util.parseCard(els.card_no) + ')',
		                    confirmText: '确认转账',
		                    cancelText: '取消',
		                    context: self,
		                    success: function (pwd) {
		                        var pwd = pwd;
		                        self.showLoading();
		                        var paramObj = transferStore.get();
		                        var _cardNo = self.$el.find("#js_card_no").val();
		                        paramObj.cardno = cUtilCryptBase64.Base64.encode(_cardNo.replace(/\s/g, ""));
		                        paramObj.idno = cUtilCryptBase64.Base64.encode(self.$el.find("#js_id_no").val());
		                        paramObj.paypwd = pwd;
		                        paramObj.waytype = 2;
		                        paramObj.tktype = 0;
		                        transDepositCardModel.setParam(paramObj);
		                        transDepositCardModel.exec({
		                            suc: self._ExgOrGainSuc,
		                            scope: self,
		                            fail: function (data) {
		                                self.onModelExecFailAsync(data, 330);
		                            }
		                        });
		                    }
		                });
		            };
		        },
		        _ExgOrGainSuc: function (data) {
		            var self = this;
		            self.hideLoading();
		            console.log(data);
		            if (data.rc == 0) {
		                //成功
		                self.showSuccess();
		                CacheData.setIsAuthStateChanged(true);//notify index page to reload
		            } else {
		                //没成功
		                if (data.riskid && data.rc == 1302052) {//弹出alert
		                    self.showDlg({//兑换成功操作
		                        title: '',
		                        message: data.rmsg || "返现余额无法转出到储蓄卡！",
		                        buttons: [{
		                            text: '确认',
		                            ///type: c.ui.Alert.STYLE_CANCEL,
		                            click: function () {
		                                this.hide();
		                            }
		                        }]
		                    });
		                } else {
		                    self.showToast(data.rmsg);
		                }
		            }
		        },
		        showSuccess: function () {
		            var self = this;
		            self.showDlg({
		                title: '',
		                message: '成功提交储蓄卡转账申请！实际转账金额￥' +  parseInt(transferStore.getAttr('amount')) + '，将在10个工作日内转入您的储蓄卡账户。 ',
		                buttons: [
                            {
                                text: '确认',
                                click: function () {
                                    self.resetInfo();
                                    self.resetData();
                                    //CacheData.setIsRecashReloaded(true);
                                    //location.reload();//TODO: it will clear url params...
                                    self.onShow();
                                    this.hide();
                                } ///type: c.ui.Alert.STYLE_CANCEL
                            },
                            {
                                text: '查看转账记录',
                                click: function () {
                                    this.hide();
                                    self.resetData();
                                    self.resetInfo();
                                    //self.onShow();
                                    self.forward("payoutlist?flag=new");
                                }
                                ///type: c.ui.Alert.STYLE_CANCELSTYLE_CONFIRM
                            }]
		            });
		        },
		        showErrMsgOnLoad: function () {
		            var self = this;
		            self.hideLoading();
		            self.showWarning404(function () {
		                self.hideWarning404();
		                self.onShow();
		            });
		        }
		    });
		    return View;
		});

