/**
 * @author yjj
 * @desc:  Wallet V6.10
 */
define(['text!insrcaddinfo_html', 'IdCodePageView', 'WalletStore', 'WalletModel', 'Util', 'Config', 'BirthChoicer', 'Message', 'CacheData','cGuiderService'],
    function ( html, IdCodePageView, WalletStore, WalletModel, Util, Config, BirthChoicer, Message, CacheData, cGuiderService) {
        var STRING = {
            PAGE_TITLE: '账户安全险',
            FREE_EXIT_TITLE: '确认退出，并放弃免费领取账户安全险？',
            NOTFREE_EXIT_TITLE: '确认退出，并放弃投“{1}”？',
            CONFIRM: '确认退出',
            CANCEL: '取消'
        };

        var MODE = {
            RealName:'addaccountinfo',
            Activity:'insrcactivity'
        };

        var mobileRuleQueryModel = WalletModel.WalletPublicQueryText.getInstance();
        var insrcAddInfoStore = WalletStore.InsrcAddInfoStore.getInstance();
        var userInfoStore = WalletStore.UserInfoStore.getInstance();
        var insrcCheckStore = WalletStore.InsrcCheckStore.getInstance();
        var authCheckStore = WalletStore.AuthVerifyStore.getInstance();
        var insrcSubmitModel = WalletModel.InsrcSubmitOrder.getInstance();
        var birthChoicer = null;
        var View = IdCodePageView.extend({
            tpl:html,
            title: STRING.PAGE_TITLE,
            backBtn: true,
            model:{},
            requestCode:33,
            reqflag: 1,
            getIdCodeFailGoto:'insrcactivity',
            events:{
                'click .J_BirthChoice':'choiceBirth',
                'click .J_Modify-mobile':'modifyMobile',
                'click .J_Get-indentify-code': 'getIdentifyCode',
                'click .J_GoNext': 'verifyCodeToGoNext'
            },
            onShow: function () {
                var that = this;
                this.inherited(arguments);

                this.model.bModifiedMobile = false;

                //from
                var path=this.getQuery('path');
                if(!path){
                    this.forward('insrcactivity');
                    return;
                }

                //auth
                var authstatus, birthstatus;
                //path
                if(path === MODE.RealName){
                    this.model.entry = MODE.RealName;
                    insrcAddInfoStore.setAttr('path', 'addaccountinfo');

                    authstatus = authCheckStore.getAttr('authstatus');
                    birthstatus = authCheckStore.getAttr('oldstatus');
                }else{
                    this.model.entry = MODE.Share;
                    insrcAddInfoStore.setAttr('path', 'insrcactivity');

                    authstatus = insrcCheckStore.getAttr('authstatus');
                    birthstatus = insrcCheckStore.getAttr('insurequalif');
                }

                //auth
                this.model.authstatus = authstatus;
                //birth
                this.model.birthok = (birthstatus === 1);
                //mobile
                var verifyMobile = userInfoStore.getAttr('secmobile');
                this.model.hasmobile = !!verifyMobile;
                this.model.mobile = Util.getMobile(verifyMobile);

                this.render();
                this.bindIDCodeEvent();

                //avoid refresh after get verify code
                setTimeout(function () {
                    if(that.existMobileStore()){
                        that.showNoMobileView();
                        that.existIntervalStore();
                    }
                    if(that.existBirthStore()){
                        that.showHasBirthView();
                    }
                }, 100);

            },
            existMobileStore:function(){
                var mobile = insrcAddInfoStore.getAttr('mobile');
                if(mobile){
                    this.setMobile(mobile);
                    return true;
                }
            },
            existBirthStore:function(){
                var birth = insrcAddInfoStore.getAttr('birth');
                if(birth){
                    this.setBirth(birth);
                    return true;
                }
            },
            clearInsrcAddInfoStore: function () {
                insrcAddInfoStore.setAttr('mobile',null);
                insrcAddInfoStore.setAttr('birth',null);
            },
            render:function(){
                var that = this;
                var insrctype = this.insrctype = insrcCheckStore.getAttr('insrctype');
                var prdname = this.prdname = insrcCheckStore.getAttr('prdname');
                this.resetHeaderView({
                    title: prdname
                });
                this.$el.html(_.template(this.tpl, this.model));
                this.turning();

                this._els = {
                    $J_BirthChoice: this.$el.find('.J_BirthChoice'),
                    $J_HasBirth: this.$el.find(".J_HasBirth"),
                    $J_HasMobile: this.$el.find(".J_HasMobile"),
                    $J_NoMobile: this.$el.find(".J_NoMobile"),
                    $J_Mobile:this.$el.find('.J_Mobile'),
                    $J_Indentify:this.$el.find('.J_Indentify')
                };

                if(!this.model.birthok){
                    this.showHasBirthView();
                    birthChoicer = new BirthChoicer({target:that._els.$J_BirthChoice,callback:function(date){
                        that.setBirth(date, true);
                    }});
                }

                if(this.model.hasmobile){
                    this.showHasMobileView();
                }else{
                    this.showNoMobileView();
                }

                this.getMobileReg();
            },
            showHasBirthView:function(){
                this._els.$J_HasBirth.show();
            },
            showHasMobileView:function(){
                this._els.$J_HasMobile.show();
                this._els.$J_NoMobile.hide();
            },
            showNoMobileView:function(){
                this._els.$J_HasMobile.hide();
                this._els.$J_NoMobile.show();
            },
            choiceBirth:function(){
                birthChoicer.show();
            },
            modifyMobile:function(){
                var msg = ''+
                    '<div class="cui-view" id="" style="z-index: 3007; visibility: visible;">' +
                    '<div class="cui-pop-box" style=" background:#f0f0f0">' +
                    '<div class="cui-hd" style=" margin:0 10px;background:#f0f0f0; color:#000; font-size:16px; text-align: center; border-bottom:1px solid #dfdfdf;">修改接收保单手机号</div>' +
                    '<div class="cui-bd p10">' +
                    '<div class="mb10 J_ModifyPrompt">修改手机号码，需要进行短信验证</div>' +
                    '<div class="mb10 red J_MobileRule" style="display: none;">请输入正确的手机号码，11位数字</div>' +
                    '<div class="input border mb20" style=" border-color:#c0c0c0;"><input class="J_MobileInput" maxlength="11" placeholder="输入手机号码"></div>' +
                    '<div class="mima-btn">' +
                    '<div class="mima-btn-cancel J_ModifyCancel" style=" background:#fff; border-color:#d5d5d5">取消</div>' +
                    '<div class="mima-btn-sure J_MofifyOK" style=" background:#52bce8;border-color:#099fde" "="">确认</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                this.mask = this.getCstMsg();
                this.mask.showMessage(msg, false, function(e) {});
                $('.J_MofifyOK').click(_.bind(function(){
                    var mobile = $('.J_MobileInput').val();
                    this.validateMobile(mobile, _.bind(function(bRet){
                        if(bRet){
                            this.mask.hide();
                            this.showNoMobileView();
                            this.setMobile(mobile, true);
                            this.model.bModifiedMobile = true;
                        }else{
                            $('.J_ModifyPrompt').hide();
                            $('.J_MobileRule').show();
                            setTimeout(function(){
                                $('.J_ModifyPrompt').show();
                                $('.J_MobileRule').hide();
                            },3000);
                            return false;
                        }
                    },this));
                },this));
                $('.J_ModifyCancel').click(_.bind(function(){
                    this.mask.hide();
                    return false;
                },this));
            },
            getMobileReg:function(){
                this.loading.show();
                mobileRuleQueryModel.param.reqtype = 15;
                mobileRuleQueryModel.exec({
                    scope: this,
                    suc:function(data){
                        this.loading.hide();
                        this.loading.hide();
                        if (data.rc == 0) {
                            this.model.mobilereg = new RegExp(data.text);
                            CacheData.setRegMobile(data.text);
                        }
                    },
                    fail: function(data){
                        this.loading.hide();
                        var mobileregtxt = CacheData.getRegMobile();
                        if(!mobileregtxt){
                            this.model.mobilereg = Util.getMobileReg();
                        }else{
                            this.model.mobilereg = new RegExp(mobileregtxt);
                        }
                    }
                });


            },
            validateMobile:function(mobile, callabck){
                if(!this.model.mobilereg){
                    this.getMobileReg(function(){
                        callabck(this.model.mobilereg.test(mobile));
                    });
                }else{
                    callabck(this.model.mobilereg.test(mobile));
                }

            },
            setMobile:function(mobile, bStore){
                this._els.$J_Mobile.val(mobile);
                this.model.bModifiedMobile = true;
                if(bStore) {
                    insrcAddInfoStore.setAttr('mobile', mobile);
                }
            },
            setBirth:function(birth, bStore){
                var str = birth.year + '年' + birth.month + '月' + birth.day + '日';
                var val = birth.year + '-' + birth.month + '-' + birth.day;
                this._els.$J_BirthChoice.val(str).attr('birth',val);
                this.model.birthok = false;
                if(bStore) {
                    insrcAddInfoStore.setAttr('birth', birth);
                }
            },
            verifyCodeToGoNext:function(){
                var that = this;

                this.bVerifyBirth = !this.model.birthok;
                this.bVerifyMobile = !this.model.hasmobile || !!this.model.bModifiedMobile;
                this.bVerifyIndentify = !this.model.hasmobile || !!this.model.bModifiedMobile;

                var f = this.checkInfo();
                if (!f) {
                    return;
                }

                this.goNext();

            },
            goNext:function(){
                insrcSubmitModel.param.insrctype = parseInt(this.insrctype);
                this.bVerifyBirth && (insrcSubmitModel.param.birthday = this._els.$J_BirthChoice.attr('birth'));
                if(this.bVerifyMobile) {
                    insrcSubmitModel.param.insrcmobile = this._els.$J_Mobile.val();
                }else{
                    insrcSubmitModel.param.insrcmobile = this.model.mobile;
                }
                this.bVerifyIndentify && (insrcSubmitModel.param.vercode = this._els.$J_Indentify.val());
                this.loading.show();
                insrcSubmitModel.exec({
                    scope: this,
                    suc:function(data){
                        this.loading.hide();
                        CacheData.setIsMyInsrcStateChanged(true);

                        if (data.rc == 0 || data.rc == 1406001 || data.rc == 1406002) {
                            this.clearInsrcAddInfoStore();
                            this.clearIntervalStore();
                            if (data.rc == 1406001 || data.rc == 1406002 || (data.rc == 0 && this.insrctype == 1)) {
                                this.forward('insrcend?path=insrcaddinfo');
                            } else if (this.insrctype == 2) {
                                var path_param = data.payurl.split('?');
                                var path = path_param[0];
                                var param = path_param[1];
                                if (Config.IS_HYBRID) { 
                                    back = 'file://webapp/wallet/index.html#index';
                                } else {
                                    back = location.href.split('/wallet/')[0] + '/wallet/index';
                                }
                                param = encodeURI(param) + '&from='+encodeURIComponent(back);
                                if (Config.IS_INAPP) {
                                    cGuiderService.cross({
                                        path: path,
                                        param: param
                                    });
                                } else {
                                    this.jump(path+'?'+param);
                                }
                                CacheData.setIsFromInsrcAct(false);
                            }
                        }else{
                            this.procRcCode(data, true);
                        }
                    },
                    fail: this.onModelExecFailAsync 
                });
            },
            returnHandler:function(){
                var that = this;
                var mesg;
                if(this.insrctype == 1){
                    mesg = STRING.FREE_EXIT_TITLE;
                    this.backToPage = 'insrcactivity';
                }else{
                    mesg = Util.formatStr(STRING.NOTFREE_EXIT_TITLE, this.prdname);
                    this.backToPage = 'insrcstart';
                }
                this.showDlg({
                    message: mesg,
                    buttons: [{
                        text: STRING.CANCEL,
                        click: function() {
                            this.hide();
                        }
                    },{
                        text: STRING.CONFIRM,
                        click: function() {
                            birthChoicer && birthChoicer.hide();
                            that.back(that.backToPage);
                            that.clearInsrcAddInfoStore();
                            that.clearIntervalStore();
                            this.hide();
                        }
                    }]
                });
                return;
            }
        });

        return View;

});
