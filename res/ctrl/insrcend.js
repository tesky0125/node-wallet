/**
 * @author chen.yun
 * @desc:  Wallet V6.7
 */
define(['WalletPageView', 'WalletModel', 'WalletStore', 'text!insrcend_html', 'Util', 'Config', 'Message', 'CacheData', 'ModelObserver', 'GetCerList'],
    function(WalletPageView, WalletModel, WalletStore, html, Util, Config, Message, CacheData, ModelObserver, GetCerList) {
        var STRING = {
            ACCOUNT_VERIFIED_TITLE: '账户安全险',
            VERIFIED_YES: '账户实名信息已成功认证',
            VERIFIED_ING: '账户实名信息已提交审核',
            INSRC_ING: '信息认证成功后即可生效，我们将用短信通知您',
            INSRC_YES: '出保成功后，我们将用短信通知您',
            INSRC_NO: '保单号：',
            FINISH: '完成',
            SHARE: '通知好友来抢'

        };
        var MODE = {
            RealName: 'addaccountinfo',
            Activity: 'insrcactivity'
        };
        var userInfoStore = WalletStore.UserInfoStore.getInstance();
        var realNameVerifyStore = WalletStore.RealNameVerifyStore.getInstance();
        var insrcCheckStore = WalletStore.InsrcCheckStore.getInstance();
        var insrcSubmitStore = WalletStore.InsrcSubmitStore.getInstance();
        var InsrcAddInfoStore = WalletStore.InsrcAddInfoStore.getInstance();
        var authVerifyStore = WalletStore.AuthVerifyStore.getInstance();
        var View = WalletPageView.extend({
            tpl: html,
            title: STRING.ACCOUNT_VERIFIED_TITLE,
            backBtn: true,
            //backToPage: 'index',//TODO
            onCreate: function() {
                this.inherited(arguments);
                this.wxShare=Util.wxShareInsrcAct();
            },
            events: {
                'click .wxShare': '_goToShare',
                'click .finish': '_goToFinish'
            },
            _goToShare: function() {
                this.wxShare.hybirdShare();
            },
            _goToFinish: function() {
                this.back(this.backToPage);
                CacheData.setIsFromInsrcAct(false);
            },
            onShow: function() {
                this.inherited(arguments);
                this.insrctype = insrcCheckStore.getAttr("insrctype");
                //保单信息
                var _path = this.getQuery('path');
                switch (_path) {
                    case 'insrcstart':
                    case 'insrcactivity':
                        this.iSfromShare();
                        break;
                    case 'addaccountinfo':
                        this.iSfromRealName();
                        break;
                    case 'insrcaddinfo':
                        this.iSformInsrcInfo();
                        break;
                    default:
                        this.redirectToInsrc();
                }
                this.render();
            },
            getAuthstatus:function(getModelStore){
                //实名状态
                var as = this.as = getModelStore.getAttr("authstatus"); //
                if (as == 1) {
                    this.aStatus = 1;
                    this.authText = STRING.VERIFIED_YES
                } else {
                    this.aStatus = 0;
                    this.authText = STRING.VERIFIED_ING
                }
            },
            redirectToInsrc:function(){
                if(this.insrctype ==1){
                    this.forward('insrcactivity');
                }else{
                    this.forward('insrcstart');
                }
            },
            //免费保险活动页面+高级保险活动页面过来
            iSfromShare: function() {
                this.getAuthstatus(insrcCheckStore);
                var insrcStu = insrcCheckStore.getAttr('ordstatus');
                var insurequalif = insrcCheckStore.getAttr('insurequalif');
                this.complogo = insrcCheckStore.getAttr('complogo');
                this.name = insrcCheckStore.getAttr('uname');
                this.idtype = insrcCheckStore.getAttr('idtype');
                this.idname = insrcCheckStore.getAttr('idname');
                this.idno = insrcCheckStore.getAttr('idno');
                this.prdname = insrcCheckStore.getAttr("prdname");
                this.hasVfd = false;
                this.isAddedInfo = false;

                if (this.insrctype == 2 && (this.as == 3 || this.as == 100)) {
                    this.aStatus = 2;
                } else {
                    switch (insrcStu) {
                        case 1:
                            this.insrcStu = 1;
                            this.insrcText = STRING.INSRC_YES;
                            break;
                        case 2:
                            this.insrcStu = 2;
                            this.insrcText = STRING.INSRC_NO + 'No.' + insrcCheckStore.getAttr('orderno');
                            break;
                    }
                    if (insurequalif == 0) {
                        this.isless18th = true;
                    } else {
                        this.isless18th = false;
                    }
                }

            },
            //从实名页面过来
            iSfromRealName: function() {
                this.getAuthstatus(userInfoStore);
                if (this.insrctype == 2 && (this.as == 3 || this.as == 100)) {
                    this.aStatus = 2;
                }else{
                    var insurequalif = authVerifyStore.getAttr('oldstatus');
                    this.hasVfd=true;
                    if (insurequalif == 0) {
                        this.isless18th = true;
                    }
                }

            },
            //保险信息补充页面过来
            iSformInsrcInfo: function() {
                this.getAuthstatus(userInfoStore);
                var insrcStu = insrcSubmitStore.getAttr('sbmtstatus')
                var rc = insrcSubmitStore.getAttr('rc')
                this.hasVfd = InsrcAddInfoStore.getAttr('path') === MODE.RealName;
                this.isAddedInfo = true;
                switch (rc) {
                    case 0:
                        this.isless18th = false;
                        this.sucStuFn(insrcStu);
                        break;
                    case 1406001:
                        this.isless18th = true;
                        break;
                    case 1406002:
                        this.isless18th = false;
                        this.insrcStu = 3;
                        this.insrcText = insrcSubmitStore.getAttr('rmsg');
                        break;
                }
            },
            sucStuFn: function(data) {
                this.complogo = insrcSubmitStore.getAttr('complogo');
                this.name = insrcSubmitStore.getAttr('uname');
                this.idtype = insrcSubmitStore.getAttr('idtype');
                this.idname = insrcSubmitStore.getAttr('idname');
                this.idno = insrcSubmitStore.getAttr('idno');
                this.prdname=insrcSubmitStore.getAttr('prdname');
                switch (data) {
                    case 0:
                        this.insrcStu = 0;
                        this.insrcText = STRING.INSRC_ING;
                        break;
                    case 1:
                        this.insrcStu = 1;
                        this.insrcText = STRING.INSRC_YES;
                        break;
                    case 2:
                        this.insrcStu = 3;
                        this.insrcText = insrcSubmitStore.getAttr('rmsg');
                        break;
                }
            },
            onHide: function() {
                this.inherited(arguments);
                this.isAddedInfo = false;
            },
            render: function() {
                var that = this;
                this.resetHeaderView({
                    title: this.prdname||"账户安全险"
                });
                
                var _model = {
                    insrctype: this.insrctype,
                    prdname:this.prdname||"账户安全险",
                    hsdVfd: this.hasVfd || false, //有无经过实名页面
                    isless18th: this.isless18th, //是否满18岁
                    isAddedInfo: this.isAddedInfo,//是否经过信息补充页
                    authStu: this.aStatus, //实名状态
                    authText: this.authText, //实名状态文字
                    complogo: this.complogo || '',
                    insrcStu: this.insrcStu, //保单状态
                    insrcText: this.insrcText||'', //保单状态文字
                    name: this.name||'', //姓名
                    idtype: this.idtype||'', //证件类型
                    idtypeString: this.idname||'', //证件类型
                    idNo: this.idno||'', //证件号码
                    isInApp: Config.IS_INAPP //是否在App中
                };
                this.$el.html(_.template(this.tpl, _model));

                this.updateBackToPage();
            },
            updateBackToPage: function(){
                if(this.insrctype == 1){
                    this.backToPage = 'index';
                }else if(this.insrctype == 2){
                    if(this.isless18th || this.aStatus == 2){
                        this.backToPage = 'insrcstart';//TODO
                    }else{
                        this.backToPage = 'index';
                    }
                }                
            },
            returnHandler: function() {
                this.back(this.backToPage);
                userInfoStore.setAttr('hsdVfd', false)
                CacheData.setIsFromInsrcAct(false);
            }
        });
        return View;
    });