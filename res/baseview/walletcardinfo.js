/**
* @module walletcardinfo
* @author luzx
* @description walletcardinfo base page
* @version since Wallet V6.2
*/
define(['WalletModel', 'WalletStore', 'text!walletcardinfo_html', 'Util', 'WalletPageView', 'Message', 'PopupSelect', 'Config', 'CacheData','CerKeyBoard','GetCerList'],
function (WalletModel, WalletStore, html, Util, WalletPageView, Message, PopupSelect, Config,CacheData,CerKeyBoard,GetCerList) {

    /**
     * @description elements data
     * elements: {
     *   cardTitle: true or "xxx",//default "验证银行卡信息"
     *   cardInfo: {
     *     cardno: '1234 4465 4433',
     *     bankname: '浦发银行',
     *     cardIcon: 'bank_1111',
     *     cardtypeUI: '信用卡'
     *   },
     *   fieldlist:[
     *   {
     *     fieldname: "Validity" //Validity(卡有效期);
     *       //VerifyNo(卡验证码) ;
     *       //CardHolder(持卡人);
     *       //IdType(证件类型);
     *       //IdNumber(证件号码);
     *       //PhoneNo(银行预留手机)
     *     fieldstatus: 0
     *     fieldvalue: ""
     *   }
     *   ],
     *   authoptstatus: 0 // default text:"该卡身份信息用于账户实名信息认证，请确保使用本人银行卡"
     * }
     */

    //withdraw or transfer
    var inputLineTemplate = ''+
        '<div class="topgrey">' +
        '   <%=label%>：<span class="font16"><small>¥</small><%=money%></span>' +
        '</div>' +
        '<ul class="border2 p10li mb10">' +
        '   <li class="J_MoneyLine">' +
        '       <i class="J_ClearInput clear-input" style="display: none;"><span></span></i><em class="fl w80 font16"><%=inputLabel%></em>' +
        '       <div class="input">' +
        '           <input class="J_Input J_Money" type="text" placeholder=<%=inputHint%>>' +
        '       </div>' +
        '   </li>' +
        '</ul>';

    var STRING = {
        CERTIFICATE_SELECT: '选择证件',
        IDENTITY: '身份证',
        CASH_LEFT: '现金余额',
        WITHDRAW_NUMBER: '提现金额',
        ACTION_DEFAULT: '下一步',
        AUTHCHECKTIP:'确认该卡是本人持有，卡信息用于账户实名认证，实名信息无法修改。'
    };
    var AUTH_OPT_STATUS={
        NO_AUTH:0,//无实名提示栏位
        NO_CHECK:1,//有实名提示栏位(无勾选框)(主要用于强制实名)
        AUTH_CHECK:2//有实名提示栏位(有勾选框)(可用于实名)
    };
    var FIELD = {
        CardInfo: 'cardInfo',
        CardHolder: 'CardHolder',
        IdCardType: 'IdCardType',
        IdNumber: 'IdNumber',
        Validity: 'Validity',
        VerifyNo: 'VerifyNo',
        PhoneNo: 'PhoneNo'
    };

    var certListModel = WalletModel.QueryCertList.getInstance();
    var certListStore = WalletStore.CertListStore.getInstance();
    var userInfoStore = WalletStore.UserInfoStore.getInstance();
    var bindCardTempStore = WalletStore.BindCardTempStore.getInstance();
    var exports = WalletPageView.extend({
        confirmRealName: null, /*abstract*/
        inputMaxLength:18,
        paymchid:Config.PAYMCHIDS.DEFAULT,
        getPaymchid:function(){
            return this.paymchid;
        },
        events: {
            'blur input': function (e) {
                if (document.activeElement.tagName.toLowerCase() != 'input') {
                    $(window).scrollTop(0);
                }
            },
            'input .J_Money':'inputEvent'
        },
        onShow: function () {
            this.inherited(arguments);
            this.elements = {};
            this.hideTopError();
            CacheData.setIsAuthStateChanged(true);//possible of auth state change, notify index page to reload
        },
        onHide:function(){
            this.inherited(arguments);
            this.resetInput();
        },
        resetInput:function(){
            if(!!this._els){
                this._els.$validity.val('');
                this._els.$cardIdentify.val(''); //卡验证码
                this._els.$cardHolder.val('');//持卡人
                this._els.$cardNo.val('');//证件号码
                this._els.$cardType.html('');
                this._els.$preTel.val('');
                this._els.$money.val('');
                this._clearHighLight();
                this._unSelect();
                this.$el.find('.J_ClearInput').hide();
            }
        },
        showSubTitle: function (title) {
            this._els.$subTitle.html(title).removeClass("hidden");
        },
        inputEvent: function (e) {
            var val = $(e.target).val();
                var newVal=Util.parseInputMoney(val);
                $(e.target).val(newVal);
        },
        loadCerList:function(callback){
            if (this.existIdCardInput()) {
                this.getCerList = new GetCerList({
                            page:this,
                            isRealName: false,
                            callback: _.bind(callback, this),
                            getPaymchid: Config.PAYMCHIDS.DEFAULT,
                        })
            } else {
                callback.call(this);
            }
        },
        render: function () {
            var elements = this.elements;
            if (!!elements.authoptstatus && !userInfoStore.hasUserData()) {
                this.showToast(Message.get(123), _.bind(this.returnHandler, this));
                return;
            }

            this.bVerifyMobile = true;
            this.ResetCrdNo=0;
            for (var i = 0; i < elements.fieldlist.length; i++) {
                var item = elements.fieldlist[i];
                elements[item.fieldname] = {
                    'status': item.fieldstatus,
                    'value': item.fieldvalue
                };
                if (item.fieldname == FIELD.PhoneNo) {
                    if (!Util.isEmpty(item.fieldvalue)) {
                        this.bVerifyMobile = false;
                    }
                }
            }

            this.authstatus = userInfoStore.getAttr("authstatus");

            var lis = '';
            lis += '<li class="J_Top litips hidden">卡信息错误，请核对并修改</li>';
            for (var k in elements) {
                lis += this._getListItems(k, elements[k]);
            }

            var _model = {};
            _model.action = elements.action || STRING.ACTION_DEFAULT;
            this.$el.html(_.template(html, _model));

            this.$el.find('.J_Fragments').html(lis);
            if (elements.inputData) {
                this.addInputLine();
            }

            if (!!elements.authoptstatus && this.authstatus != 1) {//add authstatus to enhance.
                this.addAuthStatus();
            }

            this._els = {
                $cardTypeHandler: this.$el.find(".J_Widget_CertTypeLi"),
                $cardType: this.$el.find(".J_Widget_CardType"),
                $validity: this.$el.find(".J_Widget_Validity"), //卡有效期
                $cardIdentify: this.$el.find(".J_Widget_CardIdentify"), //卡验证码
                $cardHolder: this.$el.find(".J_Widget_CardHolder"), //持卡人
                $cardNo: this.$el.find(".J_Widget_CardNo"), //证件号码
                $preTel: this.$el.find(".J_Widget_PreTel"),
                $validityQ: this.$el.find(".J_Widget_Validity_Q"),
                $cardIdentifyQ: this.$el.find(".J_Widget_CardIdentify_Q"),
                $check: this.$el.find(".J_Check"),
                $checkLine: this.$el.find(".J_CheckLine"),
                $money: this.$el.find('.J_Money'),
                $moneyLine: this.$el.find('.J_MoneyLine'),
                $cardHolderHelp: this.$el.find('.J_Widget_CardHolder_Q'),
                $ctripHelp: this.$el.find('.J_CtripHelp'),
                $subTitle: this.$el.find('.J_SubTitle')
            };
            if(this._els.$cardType.html()==STRING.IDENTITY&&(!this._els.$cardNo.attr("readOnly"))){
                this.keyboard = new CerKeyBoard({
                   // scrollToVisible: _.bind(this._scrollToVisible, this),
                    maxLength: this.inputMaxLength,
                    targetInput: this._els.$cardNo,
                    webViewInput:this.$el.find('input')
                });
                this._els.$cardNo.attr("readOnly", true);
                this.keyboard.targetDivShow();
            }else if(this._els.$cardType.html()!=STRING.IDENTITY&&(!this._els.$cardNo.attr("readOnly"))){
                this._removeReadOnly();
                this.keyboard&&this.keyboard.targetDivHide()
            }
            if (elements.subTitle) {
                this.showSubTitle(elements.subTitle);
            }

            if (elements[FIELD.IdCardType] && elements[FIELD.IdCardType].value != '') {
                this._els.$cardTypeHandler.attr('data-value', elements[FIELD.IdCardType].value);
            } else {
                this._els.$cardTypeHandler.attr('data-value', '1');
            }

            this.restoreCard();

            this._bindEvent();
        },
        returnHandler: function () {
                this.inherited(arguments);
                this.keyboard&&this.keyboard.cleanAll();
            },
        commonGoNext:function(){
            this.keyboard&&this.keyboard.cleanAll();
        },
        existIdCardInput: function () {
            var _elements = this.elements;
            for (var i = 0; i < _elements.fieldlist.length; i++) {
                var _item = _elements.fieldlist[i];
                if (FIELD.IdCardType == _item.fieldname) {
                    return true;
                }
            }
            return false;
        },
        addInputCardInfoTip:function(){
            this.$el.find('.J_SubTitle').after('<div class="pt5 mb5"><b>填写银行卡信息</b></div>');
        },
        addInputLine: function (data) {
            this.$el.find('.J_ConfirmLine').append(_.template(inputLineTemplate, this.elements.inputData));
        },
        addAuthStatus: function () {
            var _tip = this.elements.authTip;
            var _authTip = Util.isEmpty(_tip) ? STRING.AUTHCHECKTIP : _tip;
            var _checkbox = '';
            if(this.elements.authoptstatus === AUTH_OPT_STATUS.AUTH_CHECK){
                _checkbox = '<i class="J_Check selected fl"></i>';
            }
            var checkLine = Util.formatStr('<div class="grey mb10 p0_15 J_CheckLine">{1}<div>{2}</div></div>', _checkbox, _authTip);
            this.$el.find('.J_ConfirmLine').append(checkLine);
        },
        highLightCheckLine: function () {
            this.$el.find('.J_CheckLine').addClass('bgc1');
        },
        unHighLightCheckLine: function () {
            this.$el.find('.J_CheckLine').removeClass('bgc1');
        },
        showTopError: function (str) {
            var top = this.$el.find('.J_Top');
            top.removeClass('hidden');
            if (str) {
                top.html(str);
            }
        },
        hideTopError: function () {
            this.$el.find('.J_Top').addClass('hidden');
        },
        isAECard: function () {
            return this.elements.cardInfo.isAECard;
        },
        getAllValue: function () {
            var ret = {
                cardInfo: this.elements.cardInfo,
                validity: Util.trimAll(this._els.$validity.val()), //卡有效期
                cardIdentify: Util.trimAll(this._els.$cardIdentify.val()), //卡验证码
                cardHolder: this._els.$cardHolder.val(), //持卡人
                cardNo: Util.trimAll(this._els.$cardNo.val()), //证件号码,
                cardType: parseInt(this._els.$cardTypeHandler.attr('data-value')), //证件类型
                cardTypeString: this._els.$cardType.html(),
                preTel: Util.trimAll(this._els.$preTel.val()), // 银行预留手机'18988887777'
                bindname: this._els.$check.hasClass('checked'),
                money: Util.trimAll(this._els.$money.val()),
                isResetCrdNo:this.ResetCrdNo
            };

            return ret;
        },
        validate: function () {
            this._clearHighLight();
            this.hideTopError();

            for (var i in this.elements) {
                if (FIELD[i]) {
                    if (!this.checkField(FIELD[i])) {
                        return false;
                    }
                }
            }

            if (!this.checkMoney()) {
                return false;
            }

            this.formatIDCard();

            return true;
        },
        checkMoney: function () {
            if (this._els.$money[0] && _.isFunction(this.elements.inputData.valiCallBack)) {
                var val = this._els.$money.val();
                var flag = this.elements.inputData.valiCallBack.call(this, Util.trimAll(val));

                if (!flag) {
                    this._els.$money.val('');
                    this._highLight(this._els.$money);
                }

                return flag;
            }

            return true;
        },
        checkField: function (field) {
            switch (field) {
                case FIELD.Validity:
                    if (this._els.$validity[0]) {
                        var val = this._els.$validity.val();
                        if (val == '') {
                            this.showToast(Message.get(360));
                            this._highLight(this._els.$validity);
                            return;
                        } else if (!this._isFourNumber(val)) {
                            this.showToast(Message.get(361));
                            this._highLight(this._els.$validity);
                            return;
                        }
                    }
                    break;
                case FIELD.VerifyNo:
                    if (this._els.$cardIdentify[0]) {
                        var val = this._els.$cardIdentify.val();
                        if (val == '') {
                            this.showToast(Message.get(362));
                            this._highLight(this._els.$cardIdentify);
                            return;
                        } else {
                            if (this.isAECard()) {
                                if (!this._isFourNumber(val)) {
                                    this.showToast(Message.get(363));
                                    this._highLight(this._els.$cardIdentify);
                                    return
                                }
                            } else {
                                if (!this._isThreeNumber(val)) {
                                    this.showToast(Message.get(363));
                                    this._highLight(this._els.$cardIdentify);
                                    return
                                }

                            }
                        }
                    }
                    break;
                case FIELD.CardHolder:
                    if (this._els.$cardHolder[0]) {
                        var val = this._els.$cardHolder.val();
                        if (val == '') {
                            this.showToast(Message.get(353));
                            this._highLight(this._els.$cardHolder);
                            return;
                        }
                    }
                    break;
                case FIELD.IdNumber:
                    if (this._els.$cardNo[0]) {
                        var type = this._els.$cardType.text().replace(/\s/g, '')
                        var val = this._els.$cardNo.val().replace(/\s/g, '');
                        var disable = this._els.$cardNo.prop('readonly')&&!this.keyboard;
                        if(val == ''){
                            this.showToast(Message.get(354));
                            this._highLight([this._els.$cardNo, this._els.$cardType]);
                            return;
                        }else if (!disable && type === STRING.IDENTITY && !Util.isValidChinaIDCard(val)) {
                            this.showToast(Message.get(355));
                            this._highLight([this._els.$cardNo, this._els.$cardType]);
                            return;
                        }
                    }
                    break;
                case FIELD.PhoneNo:
                    if (this._els.$preTel[0]) {
                        var val = this._els.$preTel.val();
                        if (val == '') {
                            this.showToast(Message.get(311));
                            this._highLight(this._els.$preTel);
                            return;
                        } else if (this.bVerifyMobile && !this._isPhone(val)) {
                            this.showToast(Message.get(312));
                            this._highLight(this._els.$preTel);
                            return
                        }
                    }
                    break;
            }

            return true;
        },
        highLightTel: function () {
            this._highLight(this._els.$preTel);
        },
        _highLight: function (doms) {
            var that = this;
            this._clearHighLight();
            if (_.isArray(doms)) {
                _.each(doms, function (item) {
                    that._hightLightLine(item);
                })
            } else {
                this._hightLightLine(doms);
            }
        },
        _hightLightLine: function (dom) {
            $(dom).parents('li').addClass('bgc6');
        },
        _clearHighLight: function () {
            _.each(this._els, function (item) {
                $(item).parents('li').removeClass('bgc6');
            });

            if (this._els.$check[0]) {
                this.unHighLightCheckLine();
            }

        },
        //是否是四位数字
        _isFourNumber: function (s) {
            return /^[0-9]{4}$/.test(s);
        },
        //是否是三位数字
        _isThreeNumber: function (s) {
            return /^[0-9]{3}$/.test(s);
        },
        _isPhone: function (s) {
            return /^[0-9]{11}$/.test(s);
        },
        formatIDCard:function(){
            if(this._els.$cardNo[0]){
                var type = this._els.$cardType.text().replace(/\s/g, '');
                var idcode = this._els.$cardNo.val();
                if(type === STRING.IDENTITY){
                    this._els.$cardNo.val(Util.formatChinaIDCard(idcode));
                }else{
                    this._els.$cardNo.val(Util.formatIDCard(idcode));
                }
            }
        },
        _bindEvent: function () {
            var that = this;
            this._els.$cardTypeHandler.unbind().bind('click', function () {
                if (that.elements[FIELD.IdCardType] && that.elements[FIELD.IdCardType].status == 0) {
                    that._showCertificates();
                }
            });

            this._els.$validity.unbind().bind('input', _.bind(this._formatValidity, this));

            this._els.$cardNo.unbind().bind('input', _.bind(this._cardNoInput, this));

            this._els.$preTel.unbind().bind('keydown input propertychange', _.bind(function () {
                var $mobile = this._els.$preTel;
                var _mobile = $mobile.val();
                if (!this.bVerifyMobile && _mobile.indexOf("*") != -1) {
                    $mobile.val('');
                    this.bVerifyMobile = true;
                }
            }, this));

            this._els.$validityQ.unbind().bind('click', _.bind(function () {
                this.saveCard();
                this.forward('cardvalidity');
            }, this));

            this._els.$cardIdentifyQ.unbind().bind('click', _.bind(function () {
                var url = '';
                if (that.isAECard()) {
                    url = 'cardidentifying?path=ae';
                } else {
                    url = 'cardidentifying';
                }
                this.saveCard();
                this.forward(url);
            }, this));

            if(this.elements.authoptstatus === AUTH_OPT_STATUS.AUTH_CHECK){
                this._els.$checkLine.unbind().bind('click', _.bind(this._checkBox, this));
            }

            this._els.$money.on('blur', function () {
                var val = $(this).val();
                $(this).val(Util.parseMoney(val));
            });

            this._els.$cardHolderHelp.unbind().on('click', function () {
                that.getCstMsg().showMessage(that.elements.cardHolderHelp);
                $('.J_CtripHelp').unbind().on('click', function () {
                    Util.callPhone(Config.SERVICE_TEL_NUMBER);
                })
            });

            this._els.$ctripHelp.unbind();
            this.initCommonEvent();
        },
        _checkBox: function () {
            if (this._els.$cardNo.val() == '' || this._els.$cardHolder.val() == '') {
                this.showToast(Message.get(371));
                this._highLight(this._els.$checkLine);
                return;
            }

            if (this.confirmRealName) {
                this.confirmRealName(this._select, this._unSelect);
            }
        },
        _select: function () {
            this._els.$check.addClass('checked');
        },
        _unSelect: function () {
            this._els.$check.removeClass('checked');
        },
        _cardNoInput: function () {
            var val = this._els.$cardNo.val();
            var type = this._els.$cardType.text();
            var totalLen = val.length;
            var validLen = val.replace(/\s/g,'').length;
            if(type === STRING.IDENTITY && validLen >= 18){
                this._els.$cardNo.attr('maxlength',totalLen);
            }else{
                this._els.$cardNo.removeAttr('maxlength');
            }
        },
        _formatValidity: function () {
            var val = this._els.$validity.val();
            if (val.length == 1 && val > 1) {
                this._els.$validity.val("0" + val);
            }
            if(val.length==2&&val>12){
                this._els.$validity.val(1);
            }
            if(val.length==2&&val==0){
                this._els.$validity.val(0);
            }
        },
        _showCertificates: function () {
            var _data = certListStore.get();
            var _items = _data.idtypelist;

            var type = this._els.$cardTypeHandler.data("value");
            var params = {
                title: STRING.CERTIFICATE_SELECT,
                selItems: _items,
                defaultValue: type,
                mask: this.getCstMsg(),
                scope: this
            };

            var popupSelect = new PopupSelect(params);

            var that = this;
            popupSelect.show(function (value) {
                that._updateCardNo(value);
            });
        },
        _updateCardNo: function (data) {
            this._els.$cardType.html(data.name);
                var type = data && data.id || 1;
                this._els.$cardTypeHandler.attr("data-value", type);
            if(data.id!=this.idCardType){
                this._els.$cardNo.val("");
                this._removeReadOnly();
                this.ResetCrdNo=1;
                this._els.$cardNo.attr("maxlength", /*data.name == STRING.IDENTITY ? 18 :*/ 40);
            }else{
                this._els.$cardNo.val(this.caCardNo);
                this.ResetCrdNo=0;
                this._els.$cardNo.attr("readOnly",true);
            }
            if(this.keyboard){
                this.keyboard.cerType=data.name
            }
            if (data.name == STRING.IDENTITY) {
                if(!this.keyboard){
                   this.keyboard = new CerKeyBoard({
                   // scrollToVisible: _.bind(this._scrollToVisible, this),
                    maxLength: this.inputMaxLength,
                    targetInput: this._els.$cardNo,
                    webViewInput:this.$el.find('input')
                });
                }
                this._els.$cardNo.attr("readOnly",true);
                this.keyboard.targetDivShow();
                } else {
                    this._removeReadOnly();
                    this.keyboard&&this.keyboard.targetDivHide();
                }

        },
        _removeReadOnly:function(){
            if(this._els.$cardNo.attr('readOnly')){
                this._els.$cardNo.removeAttr("readOnly");
            }
        },
        _getListItems: function (k, v) {
            var li = '';
            switch (k) {
                case FIELD.CardInfo:
                    li = '<li class="p10">' +
                    '<figure class="' + v.cardIcon + ' default"></figure>' +
                    '<div class="h40">' +
                    '<span class="font16 pr12">' + v.banknameShort + '</span><em>' + v.cardtypeUI + '</em>' +
                    '<div class="font14 lh1">' + v.cardno + '</div>' +
                    '</div>' +
                    '</li>';
                    break;
                case FIELD.CardHolder:
                    li = '<li>';
                    if (this.elements.cardHolderHelp) {
                        li += '<i class="J_Widget_CardHolder_Q question valign"></i>';
                    }
                    li += '<em class="fl w90">持卡人</em>' +
                    '<div class="input">' +
                    '<input class="J_Widget_CardHolder" type="text" placeholder="卡面持卡人姓名" ';
                    if (v.status == 1) {
                        li += 'value="' + v.value + '" readonly>';
                    } else {
                        li += '>';
                    }
                    li += '</div>';
                    li += '</li>';
                    break;
                case FIELD.IdCardType:
                    this.idCardType=v.value;
                    if (this.authstatus == 1 && v.value == 1) {
                        li = '<li class="J_Widget_CertTypeLi">';
                    } else {
                        li = '<li class="J_Widget_CertTypeLi arryes">';
                    }
                    li += '<em class="fl w90">证件类型</em>';
                    li += '<div class="input">';
                    li += '<span class="J_Widget_CardType pl5">' + Util.getIdCardType(false,v.value) + '</span>';

                    li += '</div>';
                    li += '<i class="fr"></i>';
                    li += '</li>';
                    break;
                case FIELD.IdNumber:
                     this.caCardNo=v.value;
                    li = '<li>' +
                    '<em class="fl w90">证件号码</em>' +
                    '<div class="input input_no">' +
                    '<input name="" class="J_Widget_CardNo " type="text" maxlength="40" placeholder="输入证件号码"';
                    if (v.status == 1) {
                        li += 'value="' + v.value + '" readonly>';
                    } else {
                        li += 'value="' + v.value + '">';
                    }
                    li += '</div>';
                    li += '</li>';
                    break;
                case FIELD.Validity:
                    li = '<li><i class="J_Widget_Validity_Q question valign"></i><em class="fl w90">卡有效期</em>' +
                    '<div class="input">' +
                    '<input class="J_Widget_Validity" type="tel" maxlength="4" placeholder="月年，如：0618">' +
                    '</div></li>';
                    break;
                case FIELD.VerifyNo:
                    li = '<li><i class="J_Widget_CardIdentify_Q question valign"></i><em class="fl w90">卡验证码</em>' +
                    '<div class="input">';
                    if (this.isAECard()) {
                        li += '<input class="J_Widget_CardIdentify" type="tel" maxlength="4" placeholder="签名栏末尾最后4位">';
                    } else {
                        li += '<input class="J_Widget_CardIdentify" type="tel" maxlength="3" placeholder="签名栏末尾最后3位">';
                    }

                    li += '</div>';
                    li += '</li>';
                    break;
                case FIELD.PhoneNo:
                    li = '<li>' +
                   '<em class="fl w90 font14">银行预留手机</em>' +
                   '<div class="input">' +
                   '<input class="J_Widget_PreTel" type="tel" maxlength="11" placeholder="银行办卡手机"';
                    if (v.status == 1) {
                        li += 'value="' + v.value + '" >';
                    } else {
                        li += '>';
                    }
                    li += '</div>';
                    li += '</li>';
                    break;
            }

            return li
        },
        saveCard: function () {
            var all = this.getAllValue();
            if (this._els.$checkLine[0] && this._els.$check.hasClass('checked')) {
                all.bindname = true;//TODO
            }

            bindCardTempStore.set(all);
            bindCardTempStore.setAttr('needRestore', true);
        },
        restoreCard: function () {
            var all = bindCardTempStore.get();
            if (all && all.needRestore) {
                this._els.$validity.val(all.validity);
                this._els.$cardIdentify.val(all.cardIdentify);
                this._els.$cardHolder.val(all.cardHolder);
                this._els.$cardNo.val(all.cardNo);
                this._els.$cardTypeHandler.attr('data-value', all.cardType);
                this._els.$cardType.html(all.cardTypeString);
                this._els.$preTel.val(all.preTel);
                if (all.bindname === true) {
                    this._els.$check.addClass('checked');
                }
            }
            this.clean();
        },
        clean: function () {
            bindCardTempStore.remove();
        }
    });

    return exports;
});
