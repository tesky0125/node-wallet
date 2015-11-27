/**
* @module idcodepageview
* @author luzx
* @description identfying code base page.
* @version since Wallet V5.7 
*/

define(['WalletPageView', 'WalletModel', 'Message', 'Config', 'Util', 'cUtilCryptBase64','WalletStore'],
    function (WalletPageView, WalletModel, Message, Config, Util, cUtilCryptBase64, WalletStore) {

        var STRING = {
            IDENTIFY_COUNT_DOWN: '秒后重发',
            CONFIRM: '确定',
            RETRY_TITLE: '网络连接失败，请重试',
            GET_CODE: '获取验证码'
        };

        var udf;
        var ID_RETRY_TIMES = 2;
        var moblieCodeStore = WalletStore.MoblieCodeStore.getInstance();

        var IdCodePageView = WalletPageView.extend({
            /**
            * @description -must-, according to api document
            */
            requestCode: null,
            /**
            * @description -option-, default is 0
            */
            reqflag: 0,
            retryTime: ID_RETRY_TIMES,
            getIdCodeFailGoto: 'securitycenter',
            bVerifyMobile: true,
            bVerifyIndentify:true,
            bVerifyBirth:false,
            preMobile: '',
            /**
            * @description bind event to button tag.
            */
            bindIDCodeEvent: function () {
                this.initIdCodeView(Config.VERIFY_ID_CODE);
                if(Config.VERIFY_ID_CODE){
                    this.initAutoVerifyIdCodeEvent();
                }else {
                    this.initCommonEvent();
                }
            },
            unBindIDCodeEvent: function () {
                this.$el.find('.J_Indentify').unbind();
            },
            initIdCodeView:function(bVerifyIdCode){
                if(bVerifyIdCode){
                    this.$el.find('.J_ClearInput').remove();
                }else{
                    this.$el.find('.J_Error').remove();
                    this.$el.find('.J_Correct').remove();
                    this.$el.find('.J_Loading').remove();
                }
            },
            initAutoVerifyIdCodeEvent:function(){
                var t;
                var that = this;
                this.$el.find('.J_Indentify').on('input', function () {
                    var val = $(this).val();
                    if (val.length != t) {
                        t = val.length;
                        that.retryTime = ID_RETRY_TIMES;
                        if (val.length == 6) {
                            that.autoVerfiedIdentifyCode.call(that, this);
                        }
                    }
                });
            },
            identifyPassed: false,
            identifyCache: {},
            /**
            * @description get identify code from server
            *param: {
            *       id: id,
            *      dom: dom,
            *      callback: function (){}
            *  }
            */
            getIdentifyCode: function () {
                var that = this;

                if(this.isWaitingInterval()){
                    that.loading.hide();
                    return;
                }

                if(this.existIntervalStore()){
                    that.loading.hide();
                    return;
                }

                this.leftTime = 60;

                var $mobile = this.$el.find('.J_Mobile');
                this._clearHighLight($mobile);
                var mobile = $mobile.val();
                if ($mobile[0] && this.bVerifyMobile) {
                    var rT = Util.verfiredMobile(mobile);
                    if (rT != true) {
                        this._hightLight($mobile);
                        this.showToast(Message.get(rT));
                        return;
                    }
                }

                if (!Util.isEmpty(this.preMobile)) {
                    mobile = this.preMobile;
                }

                //this.loading.show();
                this._showLoading();

                var codeModel = WalletModel.WalletVerifyCodeSend.getInstance();
                codeModel.param.vertype = this.requestCode;
                mobile && (codeModel.param.rsvval = cUtilCryptBase64.Base64.encode(mobile));
                this.msgparam && (codeModel.param.msgparam = this.msgparam);
                this.rsvtype && (codeModel.param.rsvtype = this.rsvtype);
                codeModel.param.reqflag = this.reqflag;
                this.rsvparam && (codeModel.param.rsvparam = this.rsvparam);

                codeModel.exec({
                    suc: function (info) {
                        that.procRcCode(info, true);

                        that.loading.hide();
                        that._hideLoading();

                        if (info.rc == 0) {
                            that.clearIdentifyCodeInput();
                            var code;
                            if (that.requestCode == 23 || that.requestCode == 56) {
                                code = 103;
                            } else {
                                code = 102;
                            }
                            that.showToast(Message.get(code));
                            that.startInterval();
                        } else if (info.rc == Config.RC_CODE.IDENTIFIED_CODE_LIMIT) {
                            that.showDlg({
                                message: Message.get(304),
                                buttons: [{
                                    text: STRING.CONFIRM,
                                    click: function () {
                                        this.hide();
                                        if (that.viewname == 'withdrawsendcode') {
                                            that.back('index');
                                        } else if (that.viewname == 'resetpaypsd' || that.viewname == 'setpaypsd2') {
                                            that.returnHandler();
                                        } else {
                                            that.back(that.getIdCodeFailGoto);//define in validatepremobile
                                        }
                                    }
                                }]
                            });
                        }
                    },
                    fail: function (data) {
                        that._hideLoading();
                        that.onModelExecFailAsync(data, 303);
                    },
                    scope: that
                });

            },
            _showLoading:function(){
                this.$el.find('.J_Get-indentify-code').addClass('hidden');
                this.$el.find('.J_CodeLoading').removeClass('hidden');
            },
            _hideLoading:function(){
                this.$el.find('.J_Get-indentify-code').removeClass('hidden');
                this.$el.find('.J_CodeLoading').addClass('hidden');
            },
            intervalCountDown: function () {
                var str = STRING.IDENTIFY_COUNT_DOWN;
                var $node = this.$el.find('.J_Get-indentify-code');
                if (this.leftTime > 0) {
                    $node.html(this.leftTime + str);
                    this.leftTime--;
                    moblieCodeStore.setAttr('leftTime',this.leftTime);
                } else {
                    this.clearInterval.call(this);
                    this.clearIntervalStore();
                }
            },
            isWaitingInterval: function(){
                var id = this.viewname;
                return !!this.identifyCache[id];
            },
            existIntervalStore: function(){
                var intervalId = moblieCodeStore.getAttr('intervalId');
                if(intervalId){
                    this.leftTime = moblieCodeStore.getAttr('leftTime');
                    var mobile = moblieCodeStore.getAttr('mobile');
                    this.$el.find('.J_Mobile').val(mobile);
                    this.startInterval();
                    return true;
                }
            },
            startInterval: function(){
                var $node = this.$el.find('.J_Get-indentify-code');
                var id = this.viewname;
                $node.removeClass('gets');
                $node.addClass('grey3');
                this.intervalCountDown();
                this.identifyCache[id] = setInterval(this.intervalCountDown.bind(this), 1000);
                moblieCodeStore.setAttr('intervalId',this.identifyCache[id]);

                var mobile = this.$el.find('.J_Mobile').val();
                moblieCodeStore.setAttr('mobile',mobile);
            },
            clearIntervalStore: function () {
                moblieCodeStore.setAttr('intervalId',null);
                moblieCodeStore.setAttr('leftTime',0);
                moblieCodeStore.setAttr('mobile',null);
            },
            clearInterval: function () {
                var $node = this.$el.find('.J_Get-indentify-code');
                var id = this.viewname;
                $node.addClass('gets');
                $node.removeClass('grey3');
                $node.html(STRING.GET_CODE);
                clearInterval(this.identifyCache[id]);
                delete this.identifyCache[id];
            },
            clearIdentifyCodeInput: function () {
                this.$el.find('.J_Indentify').val('');
                this.clearInputRightView();
            },
            /**
            * @description  verfied identify code to server
            */
            autoVerfiedIdentifyCode: function (dom) {
                var that = this;
                var $dom = $(dom);
                var $container = this.$el.find('.J_I_Container');
                var verfiedCode = $dom.val();
                var correct = $container.find('.J_Correct');
                var error = $container.find('.J_Error');
                var loading = $container.find('.J_Loading');
                var id = this.viewname + 'Code';

                if (verfiedCode.length != 6) {
                    correct.add(error).add(loading).addClass('hidden');
                    delete this.identifyCache[id];
                    return;
                }

                if (this.identifyCache[id]) {
                    return;
                }

                $container.removeClass('bgc1');
                loading.removeClass('hidden');
                correct.addClass('hidden');
                error.addClass('hidden');
                this.identifyCache[id] = true;

                this.checkIdCode(verfiedCode,
                    function(info){//suc
                        if (!that.identifyCache[id]) {
                            return;
                        }

                        that.procRcCode(info, true);

                        if (info.rc == 0) {
                            that.identifyPassed = true;
                            correct.removeClass('hidden');
                        } else {
                            that.identifyPassed = false;
                            error.removeClass('hidden');
                            $container.addClass('bgc1');
                        }
                        loading.addClass('hidden');
                        delete that.identifyCache[id];
                    },
                    function(info){//fail
                        that.identifyPassed = false;
                        error.removeClass('hidden');
                        $container.addClass('bgc1');
                        loading.addClass('hidden');
                        //that.showToast(Message.get(303));
                        delete that.identifyCache[id];

                        console.log('request idcode failed retryTime= ' + that.retryTime);

                        if (that.retryTime--) {
                            that.autoVerfiedIdentifyCode(dom);
                        } else {
                            that.showDlg({
                                message: STRING.RETRY_TITLE,
                                buttons: [{
                                    text: STRING.CONFIRM,
                                    click: function () {
                                        this.hide();
                                        that.retryTime = ID_RETRY_TIMES;
                                        that.autoVerfiedIdentifyCode(dom);
                                    }
                                }]
                            });
                        }
                    });

            },
            _hasMobile:function(){
                var needMobilList = [20, 24, 25, 30, 31, 40, 41, 66];
                if (needMobilList.indexOf(this.requestCode) != -1) {
                    var $mobile = this.$el.find('.J_Mobile');
                    var mobile = $mobile.val();

                    if ($mobile[0] && this.bVerifyMobile) {
                        var rT = Util.verfiredMobile(mobile);
                        if (rT != true) {
                            this.showToast(Message.get(rT));
                            return;
                        }
                    }
                    if (!Util.isEmpty(this.preMobile)) {
                        mobile = this.preMobile;
                    }
                    return mobile;
                }
                return;
            },
            checkIdCode:function(verfiedCode, sucCb,failCb){
                this.clearIntervalStore();

                var codeModel = WalletModel.WalletVerifyCodeCheck.getInstance();
                codeModel.param.vertype = this.requestCode;
                codeModel.param.vercode = verfiedCode;
                codeModel.param.reqflag = this.reqflag;
                this.rsvtype && (codeModel.param.rsvtype = this.rsvtype);
                this.rsvparam && (codeModel.param.rsvparam = this.rsvparam);
                var mobile = this._hasMobile();
                mobile && (codeModel.param.rsvval = cUtilCryptBase64.Base64.encode(mobile));

                codeModel.exec({
                    suc: function (info) {
                        sucCb(info);
                    },
                    fail: function (info) {
                        failCb(info);
                    },
                    scope: this
                });
            },
            manualVerfiedIdentifyCode:function(dom,callback){
                var that = this;
                var $dom = $(dom);
                var $container = this.$el.find('.J_I_Container');
                var verfiedCode = $dom.val();

                $container.removeClass('bgc1');

                this.checkIdCode(verfiedCode,
                    function(info){//suc
                        that.procRcCode(info, true);
                        if (info.rc == 0) {
                            callback(true);
                        } else {
                            $container.addClass('bgc1');
                            callback(false);
                        }
                    },
                    function(info){//fail
                        $container.addClass('bgc1');
                        callback(false);
                        that.showDlg({
                            message: STRING.RETRY_TITLE,
                            buttons: [{
                                text: STRING.CONFIRM,
                                click: function () {
                                    this.hide();
                                }
                            }]
                        });
                    });
            },
            /**
            * @description validate input.
            */
            checkInfo: function () {
                var that = this;
                var $psd = this.$el.find('.J_Psd');
                var $newPsd = this.$el.find('.J_NewPsd');
                var $confirmPsd = this.$el.find('.J_ConfirmPsd');
                var $birth = this.$el.find('.J_BirthChoice');
                var $mobile = this.$el.find('.J_Mobile');
                var $indentify = this.$el.find('.J_Indentify');
                this._clearHighLight($psd);
                this._clearHighLight($newPsd);
                this._clearHighLight($confirmPsd);
                this._clearHighLight($birth);
                this._clearHighLight($mobile);
                this._clearHighLight($indentify);

                var psd = $psd.val();
                var newPsd = $newPsd.val();
                var confirmPsd = $confirmPsd.val();
                var birth = $birth.val();
                var mobile = $mobile.val();
                var indentify = $indentify.val();

                if (!Util.isEmpty(this.preMobile)) {
                    mobile = this.preMobile;
                }
                var checkNullArr = [[$psd, 305, true], [$newPsd, 306, true], [$confirmPsd, 309, true],[$birth, 381, this.bVerifyBirth],
                    [$mobile, 311, this.bVerifyMobile], [$indentify, 315, this.bVerifyIndentify]];

                for (var i = 0; i < checkNullArr.length; i++) {
                    var item = checkNullArr[i];
                    if (typeof item[0][0] != udf && item[0].val() == '' && item[2]) {
                        this.showToast(Message.get(item[1]));
                        this._hightLight(item[0]);
                        return;
                    }
                }

                if (newPsd != udf && confirmPsd != udf) {
                    var pRet = Util.verfiredTwoPassWord(newPsd, confirmPsd);
                    if (pRet != true) {
                        this.showToast(Message.get(pRet));
                        this._hightLight($newPsd);
                        return;
                    }
                }

                if (mobile != udf && this.bVerifyMobile) {
                    var mRet = Util.verfiredMobile(mobile);
                    if (mRet != true) {
                        this.showToast(Message.get(mRet));
                        this._hightLight($mobile);
                        return;
                    }
                }

                if (indentify != udf && this.bVerifyIndentify) {
                    var iRet = Util.verfiredICode(indentify);
                    if (iRet != true) {
                        this.showToast(Message.get(iRet));
                        this._hightLight($indentify);
                        return;
                    }
                }

                if(birth != udf && this.bVerifyBirth){
                    var iRet = Util.verfiredBirth(birth);
                    if (iRet != true) {
                        this.showToast(Message.get(iRet));
                        this._hightLight($birth);
                        return;
                    }
                }

                if(Config.VERIFY_ID_CODE){
                    if (this.identifyPassed) {
                        return true;
                    } else {
                        this.showToast(Message.get(317));
                        return;
                    }
                }

                return true;
            },
            _hightLight: function (dom) {
                $(dom).parents('li').addClass('bgc1');
            },
            _clearHighLight: function (dom) {
                $(dom).parents('li').removeClass('bgc1');
            },
            onHide: function () {
                this.inherited(arguments);
                this.clearAllInput();
                this.retryTime = 0;
            },
            clearAllInput: function () {
                this.$el.find('.J_Psd').val('');
                this.$el.find('.J_Indentify').val('');
                this.$el.find('.J_NewPsd').val('');
                this.$el.find('.J_ConfirmPsd').val('');
                this.$el.find('.J_Mobile').val('');
                this.clearInputRightView();
                this.identifyPassed = false;
                this.clearInterval();
            },
            clearInvalidCode: function () {
                this.$el.find('.J_Indentify').val('');
                this.clearInputRightView();
                this.identifyPassed = false;
            },
            clearInputRightView:function(){
                var $container = this.$el.find('.J_I_Container');
                if(Config.VERIFY_ID_CODE) {
                    $container.find('.J_Correct').addClass('hidden');
                    $container.find('.J_Error').addClass('hidden');
                    $container.find('.J_Loading').addClass('hidden');
                }else{
                    $container.find('.J_ClearInput').hide();
                }
            },
            returnHandler:function(){
                this.inherited(arguments);
                this.clearIntervalStore();
            }
        });

        return IdCodePageView;
    });

