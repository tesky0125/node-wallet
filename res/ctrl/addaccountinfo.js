/**
 * @author chen.yun
 * @desc:  Wallet V6.7
 */
define(['WalletPageView', 'WalletModel', 'WalletStore', 'Util', 'Config', 'Message', 'PopupSelect', 'RealName', 'CacheData', 'CerKeyBoard', 'GetCerList', 'CacheData', 'Scmg'],
    function(WalletPageView, WalletModel, WalletStore, Util, Config, Message, PopupSelect, RealName, CacheData, CerKeyBoard, GetCerList, CacheData, Scmg) {
        var STRING = {
            ACCOUNT_VERIFIED_TITLE: '账户实名认证',
            REAL_NAME_TITLE: '请确认实名信息，一旦认证无法修改',
            CERTIFICATE_SELECT: '选择证件',
            IDENTITY: '身份证',
            CONFIRM: '确认'
        };
        var userinfoListModel = WalletModel.UserInfoList.getInstance();
        var sltInfoList = WalletStore.SltInfoList.getInstance(); //select list
        var selectInfo = WalletStore.SelectInfo.getInstance(); //select cer
        var userinfoListStore = WalletStore.UserInfoList.getInstance();
        var realCertListStore = WalletStore.RealCertListStore.getInstance();
        var realNameStore = WalletStore.RealNameStore.getInstance();
        var realNameVerifyStore = WalletStore.RealNameVerifyStore.getInstance();
        var certListModel = WalletModel.QueryCertList.getInstance();
        var authVerifyCheck = WalletModel.AuthVerifyCheck.getInstance();
        var userInfoStore = WalletStore.UserInfoStore.getInstance();
        var insrcRetStore = WalletStore.InsrcRetStore.getInstance();
        var insrcCheckStore = WalletStore.InsrcCheckStore.getInstance();
        var tplHtml = '<article class="wrap"><div class="topgrey">请填写身份信息，以完成实名认证</div>' +
            '<ul class="border2 p10li mb10 ml15p0">' +
            '<li><i class="J_ClearInput_Name clear-input " style="right:35px !important;"><span></span></i><i class="maillist valign" style="display:none"><span class="maillistIcon"></span></i><em class="fl w90">姓名</em><div class="input"><input class="J_Widget_CardHolder" name="" type="text" placeholder="输入真实姓名"></div></li>' +
            '<li class="J_Widget_CertTypeLi"  data-value="1"><em class="fl w90">证件类型</em><div class="input" style="padding-left:5px"><span class="J_Widget_CardType">身份证</span></div><i class="fr"></i></li>' +
            '<li><i class="J_ClearInput_Cid clear-input" ><span class="ClearInput_Cid_btn"></span></i><i class="J_ClearInput_Xcid clear-input" ><span class="ClearInput_Xcid_btn"></span></i><em class="fl w90">证件号</em><div class="input input_no"><input name="" type="text" class="J_Widget_CardNo_auth" readOnly  maxlength="40" placeholder="输入证件号码" value=""></div></li>' +
            '</ul>' +
            '<div class="p10"><button class="btn J_Next">下一步</button></div><div class="Realnameicon t_c"><i></i>身份信息由携程严格保密</div></article>';
        var View = WalletPageView.extend({
            tpl: tplHtml,
            title: STRING.ACCOUNT_VERIFIED_TITLE,
            backBtn: true,
            inputMaxLength: 18,
            guide: false,
            ubtMap: [{
                target: ['.maillist', '.maillistIcon'], //ok
                key: 'wallet.realname',
                dataHandler: function() {
                    return this.ubtRealNameDataHandler();
                },
                cb: null,
                listener: null //for set/unset event
            }],
            events: {
                'click .J_Next': '_goNext',
                'click .J_Widget_CertTypeLi': '_showCertificates',
                'click .maillist': '_goUserInfoList'
            },
            ubtRealNameDataHandler: function() {
                var value;
                if (Config.IS_H5) {
                    value = 'click_realname_choose_h5'
                } else {
                    value = 'click_realname_choose_hybrid'
                }
                return {
                    id: value
                };
            },
            onCreate: function() {
                this.inherited(arguments);
            },
            onShow: function() {
                this.certList = {};
                this.inherited(arguments);
                if (!Util.checkUser(this))
                    return;
                this.getCerList = new GetCerList({
                    page: this,
                    isRealName: true,
                    getPaymchid: Config.PAYMCHIDS.DEFAULT,
                    callback: _.bind(this.render, this)
                })
            },
            _goUserInfoList: function() {
                this.forward('userinfolist');
            },
            gotoSelect: function(type, typeName) {
                if (!!this.userInfoList && this.userInfoList[type] && this.userInfoList[type].length > 0) {
                    this._els.$selectBtn.show();
                    this._els.$clearInputName.css({
                        right: '35px !important'
                    });
                } else {
                    this._els.$selectBtn.hide();
                    this._els.$clearInputName.css({
                        right: '0px !important'
                    });
                }
                sltInfoList.setAttr('typelist', this.userInfoList[type]);
                sltInfoList.setAttr('typeName', typeName)
            },
            getUserInfoList: function(type, typeName) {
                var _data = userinfoListStore.getAttr("list"),
                    _oldUid = userInfoStore.getAttr("oldUid");
                if (_data && _oldUid == this.nowUid) {
                    this.userInfoList = _data;
                    userinfoListStore.setAttr('oldUid', this.nowUid)
                    selectInfo.setAttr('oldUid', this.nowUid)
                    this.gotoSelect(type, typeName)
                } else {
                    userinfoListModel.param = {};
                    userinfoListModel.param.reqtype = 1; //1：证件类型
                    this.loading.show();
                    userinfoListModel.exec({
                        scope: this,
                        suc: function(data) {
                            this.loading.hide();
                            if (data.rc == 0) {
                                this.userInfoList = data.sortoutArr;
                                userinfoListStore.setAttr('oldUid', this.nowUid)
                                selectInfo.setAttr('oldUid', this.nowUid)
                                this.gotoSelect(type, typeName)
                            } else {
                                this._els.$selectBtn.hide();
                                this._els.$clearInputName.css({
                                    right: '0px !important'
                                });
                            }
                        },
                        fail: function(data) {
                            //this.onModelExecFailAsync(data);
                            this._els.$selectBtn.hide();
                            this._els.$clearInputName.css({
                                right: '0px !important'
                            });
                        }
                    });
                }
            },
            formatIDCard: function() {
                if (this._els.$cardNo[0]) {
                    var type = this._els.$cardType.text().replace(/\s/g, '');
                    var idcode = this._els.$cardNo.val();
                    if (type === STRING.IDENTITY) {
                        this._els.$cardNo.val(Util.formatChinaIDCard(idcode));
                    } else {
                        this._els.$cardNo.val(Util.formatIDCard(idcode));
                    }
                }
            },
            onHide: function() {
                this.inherited(arguments);
            },
            render: function(data) {
                this.certList = data;
                this.uType = selectInfo.getAttr("idtype") || '1';
                this.uiIdname = selectInfo.getAttr("idname") || STRING.IDENTITY;
                this.nowUid = userInfoStore.getAttr('uid');
                this.$el.html(_.template(tplHtml));
                this._els = {
                    $cardTypeHandler: this.$el.find(".J_Widget_CertTypeLi"),
                    $cardHolder: this.$el.find(".J_Widget_CardHolder"), //持卡人
                    $cardNo: this.$el.find(".J_Widget_CardNo_auth"), //证件号码
                    $cardType: this.$el.find(".J_Widget_CardType"),
                    $clearInputName: this.$el.find(".J_ClearInput_Name"),
                    $clearInputCid: this.$el.find('.J_ClearInput_Cid'),
                    $clearCidBtn: this.$el.find('.ClearInput_Cid_btn'),
                    $clearInputXcid: this.$el.find('.J_ClearInput_Xcid'),
                    $selectBtn: this.$el.find('.maillist')
                };
                this.getUserInfoList(this.uType, this.uiIdname);
                this._els.$cardTypeHandler.attr('data-value', '1');
                if (this._isOnlyIdcard(this.certList)) {
                    this._els.$cardTypeHandler.addClass('arryes');
                } else {
                    this._els.$cardTypeHandler.removeClass('arryes');
                }
                if (this.canGetStore() && selectInfo.getBase64("cname")) {
                    this._els.$cardHolder.val(selectInfo.getBase64("cname"));
                } else {
                    this._els.$cardHolder.val('');
                }
                if (this.canGetStore() && selectInfo.getAttr("idno")) {
                    this._els.$cardNo.val(selectInfo.getAttr("idno"));
                } else {
                    this._els.$cardNo.val('');
                }
                 if (this.canGetStore() && selectInfo.getAttr("idname")) {
                    this._els.$cardType.html(selectInfo.getAttr("idname"))
                } else {
                    this._els.$cardType.html(STRING.IDENTITY)
                }
                 if (this.canGetStore() && selectInfo.getAttr("idtype")) {
                    this._els.$cardTypeHandler.attr('data-value', selectInfo.getAttr("idtype"))
                } else {
                    this._els.$cardTypeHandler.attr('data-value',1)
                }
                if (this._els.$cardType.html() == STRING.IDENTITY) {
                    this._els.$cardNo.attr("readOnly", true);
                    this.keyboard = new CerKeyBoard({
                        maxLength: this.inputMaxLength,
                        targetInput: this._els.$cardNo,
                        inputClear: this._els.$clearInputXcid,
                        webViewInput: this.$el.find('input'),
                        inputCallback: _.bind(this.cerinputCallback, this),
                        delCallback: _.bind(this.cerdelCallback, this),
                        clearCallback: _.bind(this.cerclearCallback, this)
                    });
                    this.keyboard.targetDivShow();
                } else if (this._els.$cardType.html() != STRING.IDENTITY) {
                    this._removeReadOnly();
                    this.keyboard && this.keyboard.targetDivHide()
                }
                this._els.$cardNo.unbind().bind('input focus', _.bind(this._cardNoInput, this));
                this._els.$cardHolder.unbind().bind('input focus', _.bind(this._cardNameInput, this));
                this._els.$clearInputName.unbind().bind('click', _.bind(this._clearInputName, this));
                this._els.$clearInputCid.unbind().bind('click', _.bind(this._clearInputId, this));
            },
            canGetStore: function() {
                if (!!selectInfo && !!selectInfo.get() && selectInfo.getAttr("oldUid") == this.nowUid) {
                    return true;
                } else {
                    return false;
                }
            },
            cerinputCallback: function() {
                selectInfo.setAttr('idno', this._els.$cardNo.val())
            },
            cerdelCallback: function() {
                selectInfo.setAttr('idno', this._els.$cardNo.val())
            },
            cerclearCallback: function() {
                selectInfo.setAttr('idno', '')
            },
            returnHandler: function() {
               this.inherited(arguments);
               this.keyboard && this.keyboard.cleanAll();
               selectInfo.remove();
			     CacheData.setIsFromInsrcAct(false);
            },
            _cardNoInput: function(e) {
                this._cardHolderInput(this._els.$cardNo, this._els.$clearInputCid);
                var val = this._els.$cardNo.val();
                var type = this._els.$cardType.text();
                var totalLen = val.length;
                var validLen = val.replace(/\s/g, '').length;
                if (type === STRING.IDENTITY && validLen >= 18) {
                    this._els.$cardNo.attr('maxlength', totalLen);
                } else {
                    this._els.$cardNo.removeAttr('maxlength');
                }
                this._setInfoStore();
            },
            _cardNameInput: function() {
                var val = this._els.$cardHolder.val();
                this._cardHolderInput(this._els.$cardHolder, this._els.$clearInputName);
                this._setInfoStore(1);
            },
            //1:代表姓名，不传代表身份证
            _setInfoStore: function(opt) {
                var cname = this._els.$cardHolder.val(),
                    idno = this._els.$cardNo.val(),
                    idname = this._els.$cardType.html(),
                    idtype = this._els.$cardTypeHandler.attr('data-value');
                selectInfo.setAttr('idname', this._els.$cardType.html())
                selectInfo.setAttr('idtype', this._els.$cardTypeHandler.attr('data-value'))
                if (opt) {
                    selectInfo.setBase64('cname', cname)
                } else {
                    selectInfo.setAttr('idno', idno);
                }
            },
            _clearInputName: function() {
                this._clearInput(this._els.$cardHolder, this._els.$clearInputName);
                selectInfo.setAttr('cname', '');
            },
            _clearInputId: function() {
                this._clearInput(this._els.$cardNo, this._els.$clearInputCid);
                selectInfo.setAttr("idno", '')
            },
            _cardHolderInput: function(obj, objclear) {
                var val = obj.val();
                if (val != '') {
                    objclear.show();
                } else {
                    objclear.hide();
                }
            },
            _clearInput: function(obj, objclear) {
                obj.val('');
                objclear.hide();
            },
            //显示证件类型
            _showCertificates: function() {
                var _data = realCertListStore.get();
                var _items = _data.idtypelist;

                if (this._isOnlyIdcard(_items)) {
                    var type = this._els.$cardTypeHandler.attr("data-value");
                    var params = {
                        title: STRING.CERTIFICATE_SELECT,
                        selItems: _items,
                        defaultValue: type,
                        mask: this.getCstMsg(),
                        scope: this
                    };

                    var popupSelect = new PopupSelect(params);

                    var that = this;
                    popupSelect.show(function(value) {
                        that._updateCardNo(value);
                    });
                }
            },
            //是否只支持身份证
            _isOnlyIdcard: function(data) {
                if (data && data.length == 1 && data[0].idtype == 1) {
                    return false;
                } else {
                    return true;
                }
            },
            //更新证件类型及号码
            _updateCardNo: function(data) {
                this._els.$cardType.html(data.name);
                var type = data && data.id || 1;
                this._els.$cardTypeHandler.attr("data-value", type);
                this._els.$cardType.html(data.name);
                this.gotoSelect(type, data.name);
                this._els.$cardNo.val("");
                selectInfo.setAttr("idname", data.name)
                selectInfo.setAttr("idtype", type)
                selectInfo.setBase64("cname", this._els.$cardHolder.val())
                selectInfo.setAttr("idno", '')
                this._els.$clearInputCid.hide();
                this._els.$clearInputXcid.hide();
                this._els.$cardNo.attr("maxlength", data.name == /*STRING.IDENTITY ? 18 :*/ 40);
                if (this.keyboard) {
                    this.keyboard.cerType = data.name
                }
                if (data.name == STRING.IDENTITY) {
                    if (!this.keyboard) {
                        this.keyboard = new CerKeyBoard({
                            maxLength: this.inputMaxLength,
                            targetInput: this._els.$cardNo,
                            inputClear: this._els.$clearInputXcid,
                            webViewInput: this.$el.find('input'),
                            inputCallback: this.cerinputCallback,
                            delCallback: this.cerdelCallback,
                            clearCallback: this.cerclearCallback
                        });
                    }
                    this._els.$cardNo.attr("readOnly", true);
                    this.keyboard.targetDivShow();
                } else {
                    this._removeReadOnly();
                    this.keyboard && this.keyboard.targetDivHide();
                }

            },
            _removeReadOnly: function() {
                if (this._els.$cardNo.attr('readOnly')) {
                    this._els.$cardNo.removeAttr("readOnly");
                }
            },
            //获取所有填写字段
            getAllValue: function() {
                var ret = {
                    cardHolder: Util.escapeWlt(this._els.$cardHolder.val()), //持卡人
                    cardNo: Util.trimAll(Util.escapeWlt(this._els.$cardNo.val())), //证件号码,
                    cardType: parseInt(this._els.$cardTypeHandler.attr('data-value')), //证件类型
                    cardTypeString: this._els.$cardType.html()
                };
                return ret
            },
            //点击下一步
            _goNext: function() {
                var _valid = this.validate();
                if (!this.validate()) {
                    return;
                }
                this.formatIDCard();
                var that = this;
                var _data = this.getAllValue();
                realNameVerifyStore.setAttr('uname', _data.cardHolder);
                realNameVerifyStore.setAttr('idtype', _data.cardType);
                realNameVerifyStore.setBase64('idno', _data.cardNo);
                var params = {
                    cardHolder: _data.cardHolder,
                    cardType: _data.cardType,
                    cardTypeString: _data.cardTypeString,
                    cardNo: _data.cardNo,
                    realNameType: 1,
                    realNameTitle: STRING.REAL_NAME_TITLE,
                    realNameTip: '',
                    mask: this.getCstMsg()
                };
                var realName = new RealName(params);
                realName.show(function(flag) {
                    if (flag) {
                        that.validateAuth(params);
                    }
                });

            },
            isFromInsrc: function() {
                if (CacheData.getIsFromInsrcAct()) {
                    return true
                } else {
                    return false
                }
            },
            gotoNext: function(stu, oldstatus) {
                if (this.isFromInsrc()) {
                    this.isInsrcNext(stu, oldstatus)
                } else {
                    this.isRealNameNext(stu)
                }
            },
            isInsrcNext: function(stu, oldstatus) {
                var insrctype = insrcCheckStore.getAttr("insrctype");
                if(insrctype == 2 && (stu == 3 || stu == 100)){
                    this.forward('insrcend?path=addaccountinfo')
                }else{
                    if (oldstatus === 0) {
                        insrcRetStore.setAttr('isless18th', true)
                        this.forward('insrcend?path=addaccountinfo')
                    } else {
                        insrcRetStore.setAttr('isless18th', false)
                        this.forward('insrcaddinfo?path=addaccountinfo')
                    }   
                }
            },
            isRealNameNext: function(stu) {
                //stu===1已成功实名
                if (stu === 1) {
                    this.forward('accountverified');
                } else {
                    this.forward('result?path=addaccountinfo');
                }
            },
            unFail: function(num) {
                this.setUserInfoStore();
                userInfoStore.setAttr('authstatus', num);
                this.keyboard && this.keyboard.cleanAll();
                CacheData.setIsFromInsrcAct(false);
                selectInfo.remove();
            },
            //检查实名认证信息
            validateAuth: function(params) {
                var that = this;
                if (Scmg.getV() == 1) {
                    ///authVerifyCheck.param.paypwd = realNameStore.getAttr('pwd');
                    authVerifyCheck.param.paypwd = Scmg.getP();
                } else {
                    //指纹.
                    authVerifyCheck.param.touchinfo = Scmg.getT();

                }
                authVerifyCheck.param.uname = realNameVerifyStore.getAttr('uname');
                authVerifyCheck.param.idtype = realNameVerifyStore.getAttr('idtype');
                authVerifyCheck.param.idno = realNameVerifyStore.getAttr('idno');
                if (this.isFromInsrc()) {
                    authVerifyCheck.param.scenparam = 1;
                } else {
                    authVerifyCheck.param.scenparam = 0;
                }
                this.loading.show();
                authVerifyCheck.exec({
                    scope: this,
                    suc: function(info) {
                        this.loading.hide();
                        if (info.rc == 0) {
                            CacheData.setIsAuthStateChanged(true); //notify index page to reload
                            switch (info.authstatus) {
                                case 1: //已认证；
                                    this.gotoNext(1, info.oldstatus ? info.oldstatus : 0)
                                    this.unFail(1);
                                    break;
                                case 2: //认证失败
                                    this.showDlg({
                                        message: Message.get(379),
                                        buttons: [{
                                            text: STRING.CONFIRM,
                                            click: function() {
                                                this.hide();
                                            }
                                        }]
                                    });
                                    break;
                                case 3:
                                    this.gotoNext(3, info.oldstatus ? info.oldstatus : 0)
                                    this.unFail(3)
                                    break;
                                default: //认证无结果 //认证审核中
                                    this.gotoNext(100, info.oldstatus ? info.oldstatus : 0)
                                    this.unFail(100)
                                    break;
                            }

                        } else if (info.rc == 1006) {
                            this.showDlg({
                                message: info.rmsg,
                                buttons: [{
                                    text: STRING.CONFIRM,
                                    click: function() {
                                        this.hide();
                                        this.keyboard && this.keyboard.cleanAll();
                                        selectInfo.remove();
                                        that.forward('index');
                                    }
                                }]
                            });
                        } else {
                            this.showToast(info.rmsg);
                        }
                    },
                    fail: function(data) {
                        this.onModelExecFailAsync(data, 330);
                    }
                })

            },
            //store for show realname result
            setUserInfoStore: function() {
                var _data = this.getAllValue();
                userInfoStore.setBase64('username', realNameVerifyStore.getAttr('uname'));
                userInfoStore.setAttr('idtype', realNameVerifyStore.getAttr('idtype'));
                userInfoStore.setAttr('idno', Util.getIDcard(_data.cardNo));
                userInfoStore.setAttr('cardTypeString', _data.cardTypeString);
            },
            //填写字段效验
            validate: function() {
                this._clearHighLight();
                var all = this.getAllValue();
                if (all.cardHolder == '') {
                    this.showToast(Message.get(377));
                    this._highLight(this._els.$cardHolder);
                    return;
                }
                if (all.cardNo == '') {
                    this.showToast(Message.get(354));
                    this._highLight(this._els.$cardNo);
                    return;
                } else if (all.cardType == 1 && (!Util.isValidChinaIDCard(all.cardNo))) {
                    this.showToast(Message.get(355));
                    this._highLight(this._els.$cardNo);
                    return;
                }

                return true;
            },
            //高亮显示
            highLightCheckLine: function() {
                this.$el.find('.J_CheckLine').addClass('bgc1');
            },
            //去掉高亮
            unHighLightCheckLine: function() {
                this.$el.find('.J_CheckLine').removeClass('bgc1');
            },
            _highLight: function(doms) {
                var that = this;
                this._clearHighLight();
                if (_.isArray(doms)) {
                    _.each(doms, function(item) {
                        that._hightLightLine(item);
                    })
                } else {
                    this._hightLightLine(doms);
                }
            },
            _hightLightLine: function(dom) {
                $(dom).parents('li').addClass('bgc6');
            },
            //清除所有高亮
            _clearHighLight: function() {
                _.each(this._els, function(item) {
                    $(item).parents('li').removeClass('bgc6');
                })
            }
        });

        return View;

    });
