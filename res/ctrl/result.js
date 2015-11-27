/**
* @module result
* @author luzx
* @description result base page
* @version since Wallet V5.8
*/

define(['WalletModel', 'WalletStore', 'text!result_html', 'Util', 'WalletPageView', 'Message', 'Config', 'Log', 'Tradelist', 'Scmg'],
function (WalletModel, WalletStore, html, Util, WalletPageView, Message, Config, Log, Tradelist, Scmg) {

    var STRING = {
        FINISH: '完成',
        CONFIRM: '确定',
        CHANGE_CARD: '更换提现银行卡',
        WITHDRAW_TITLE: '提现完成',
        WITHDRAWBACK_TITLE: '提现完成',
        CASHBACK_TITLE: '转出结果',
        RECHARGE_TITLE: '充值结果',
        TRANSFER_TITLE: '转出完成',
        //WITHDRAW_PROCESSING_ALERT: '请稍后查看银行账户余额变更',
        WITHDRAW_SUCCESS: '提现成功！',
        WITHDRAW_PROCESSING: '提现处理中...',
        WITHDRAW_FAIL: '提现失败！',
        RETURN: '返回',
        RECHARGE_FAIL: '充值失败！',



        //返现 转出到银行卡.
        TRANSFER_SUCCEED: '转出成功！',
        TRANSFER_FAILED: '转出失败！',
        TRANSFER_PROCESSING: '转出处理中...',

        //账户实名认证
        ACCOUNT_VERIFIED:'账户实名认证',
        ACCOUNT_SUCCESS:'实名信息已成功提交！',
        ACCOUNT_TEXT:'我们将尽快对您的实名信息进行审核，请耐心等待，稍后查看账户实名认证结果。',

        //6.5公共
        PROCESSING:'处理中',
        FAIL:'失败',
        TITLE:'提交成功',
        //返现 充值话费
        EXCHGPHONE_TITLE: "兑换手机话费",
        EXCHGPHONE_SUC_MSGTITLE: "已提交!",
        EXCHGPHONE_FAIL_MSGTITLE: "提交失败!",
        EXCHGPHONE_BUNAME: "使用返现余额"
    };

    var RESULT = {
        SUCCESS: 1,
        FAIL: 2,
        PROCESSING: 3
    };
    var formPageStore=WalletStore.SetPageStore.getInstance();
    var WithdrawCardStore = WalletStore.WithdrawCard.getInstance();
    var exchgPhoneMsgStore = WalletStore.ExchgPhoneMsgStore.getInstance();
    //提现
    var withdrawResult = {
        pageTitle: STRING.WITHDRAW_TITLE,
        renderCode: 1,
        getInfo: function () {
            var info = WithdrawCardStore.get();
            info.amount = Util.parseMoney(info.amount);
            var RC_CODE = Config.RC_CODE;
            var btnText, msg = '', msgStatue,msgTitle, forwardTo = 'transacthistory',pageTitle;
             if(info.rc == 0||info.rc == RC_CODE.WITHDRAW_PROCESSING || info.rc == RC_CODE.WITHDRAW_PROCESSING2){
                ///WithdrawCardStore.setAttr('paypwd','');
                Scmg.setP('');
                btnText = STRING.FINISH;
                resultCode = RESULT.PROCESSING;
                //msg = STRING.WITHDRAW_PROCESSING_ALERT;
                msg = info.message;
                msgTitle =  STRING.PROCESSING;
                msgStatue='yes';
                pageTitle=STRING.TITLE;
            }  else {
                btnText = STRING.CONFIRM;
                forwardTo = 'withdraw';
                resultCode = RESULT.FAIL;
                msg = info.message;
                msgTitle = STRING.FAIL;
                msgStatue='no';
                pageTitle=STRING.FAIL;
            }

            WithdrawCardStore.setAttr('dataChanged', true);

            var ret = {
                pageTitle:pageTitle,
                forwardTo: forwardTo,//按钮点击事件跳转页面
                btnText: btnText,//按钮文字
                renderCode: this.renderCode,//渲染模板
                msgTitle: msgTitle,//消息头
                msgStatue:msgStatue,
                msg: msg,//消息内容
                resultCode: resultCode//成功与否 1.成功 2.失败 3.处理中

            };

            ret = Util.mix(ret, info);

            return ret;
        }
    };
    //实名认证结果
    var addAccountResult={
        renderCode:10,
        getInfo:function() {
            var forwardTo;
            var fromPage=formPageStore.getAttr('rmFromPage');
            switch (fromPage) {
                        case 'useraccount':
                           forwardTo='useraccount';
                            break;
                        case 'securitycenter':
                           forwardTo='securitycenter';
                            break;
                        case 'switchcash':
                           forwardTo='switchcash';
                            break;
                        default:
                            forwardTo='index';
                            break;
                    }

            var result={
                pageTitle:STRING.ACCOUNT_VERIFIED,
                forwardTo:forwardTo,
                btnText:STRING.FINISH,
                messageSuccess:STRING.ACCOUNT_SUCCESS,
                renderCode: this.renderCode,
                msg:STRING.ACCOUNT_TEXT
            };
            return result;
        },
        doneHandler: function(){
            formPageStore&&formPageStore.setAttr('rmFromPage','')
        }
    };
    //返现转到现金余额
    var cashbackResult = {
        pageTitle: STRING.CASHBACK_TITLE,
        renderCode: 2,
        getInfo: function () {
            var amt = this.getQuery("amt");
            var isSuc = this.getQuery("issuc");
            var result = {
                forwardTo: 'useraccount',
                btnText: STRING.RETURN,
                renderCode: this.renderCode,
                msgTitle: '',
                msg: '',
                buname:"携程钱包 现金余额",
                resultCode: RESULT.SUCCESS
            };

            if(isSuc == 0){
                result["btnText"] = STRING.FINISH;
                result["msgTitle"] = "转出成功！";
                result["msg"] = "已成功转至现金余额，您可以使用现金余额消费或继续提现至银行卡";
                result["amount"] = amt;
                result["resultCode"] = RESULT.SUCCESS;
            }else if(isSuc == 1){
                result["btnText"] = STRING.CONFIRM;
                result["msgTitle"] = "转出失败！";
                result["msg"] = "账户无法转出，如有疑问请联系携程客服。";
                result["amount"] = amt;
                result["resultCode"] = RESULT.FAIL;
            }else if(isSuc==3){
                result["btnText"] = STRING.FINISH;
                result["msgTitle"] = STRING.PROCESSING;
                result["msg"] = "转账申请已提交，请稍后在“返现—转出记录”中查看结果。";
                result["amount"] = amt;
                result["resultCode"] = RESULT.PROCESSING;
            }
            /*
               业务逻辑
            */

            //以下都必填
            return result;
        }
    };

    //充值
    var rechargeResult = {
        pageTitle: STRING.RECHARGE_TITLE,
        forwardTo: 'transacthistory',
        renderCode: 3,
        getInfo: function () {
            return this;
        },
        execQueryResultSvc: function () {
            var that = this;

            var accntListRechargeModel = WalletModel.WalletAccountListRecharge.getInstance();
            accntListRechargeModel.param.restype = 0; //0：全部记录 1：处理中    2：充值成功    3：充值失败    8：充值退回
            delete accntListRechargeModel.param.lastrfno;
            accntListRechargeModel.param.rfno = Lizard.P('rfno');

            accntListRechargeModel.exec({
                suc: function (data) {
                    this.loading.hide();
                    this.procRcCode(data);
                    if (data.rc == 0) {
                        if (data.rclist && data.rclist[0]) {
                            this.amount = data.rclist[0].amt;
                            this.bankname = data.rclist[0].srcname;

                            //1：处理中 2：充值成功 3：充值失败 8：充值退回
                            switch (data.rclist[0].restype) {
                                case 1:
                                    if (this.secWait < 6) {
                                        this.secWait += 3;
                                        this.loading.show();
                                        Log.Info('Once again...........');
                                        setTimeout(_.bind(this.execQueryResultSvc, this), 3000);
                                        return;
                                    }
                                    this.resultCode = RESULT.PROCESSING;
                                    this.msgTitle = '充值处理中...';
                                    this.msg = '请稍后查看现金余额变动或查看充值记录';
                                    this.btnText = STRING.FINISH;
                                    break;
                                case 2:
                                    this.resultCode = RESULT.SUCCESS;
                                    this.msgTitle = '充值成功！';
                                    this.msg = '';
                                    this.btnText = STRING.FINISH;
                                    break;
                                case 3:
                                    this.btnText = STRING.CONFIRM;
                                    this.resultCode = RESULT.FAIL;
                                    this.msgTitle = STRING.RECHARGE_FAIL;
                                    this.msg = "扣款失败，请检查银行卡余额或状态后再重试";
                                    break;
                            }
                            this.render();
                            //if (this.resultCode == RESULT.FAIL) {
                            //    this.$el.find('.J_Detail').addClass('hidden');
                            //}
                            this.turning();
                        } else {
                            this.showToast('充值流水号不存在');
                        }
                    }
                },
                //fail: function (data) {
                //    this.onModelExecFailAsync(data, 330);
                //},
                scope: that
            });
        },
        asyncRender: function () {
            ////http://localhost/webapp/wallet/index.html#result!recharge?issuc=0&rfno=rfnoXXX
            this.pageTitle = STRING.RECHARGE_TITLE;
            this.backToPage = this.forwardTo;
            this.renderCode = 3;

            if (Lizard.P('issuc') == '0') {
                this.amount = '';
                this.bankname = '';
                this.resultCode = RESULT.FAIL;
                this.msgTitle = STRING.RECHARGE_FAIL;
                this.msg = "支付提交失败，请稍后重试";
                this.btnText = STRING.CONFIRM;
                this.render();
                //this.$el.find('.J_Detail').addClass('hidden');
                this.turning();
            } else {
                this.secWait = 3;//wait 3 seconds
                this.loading.show();

                setTimeout(_.bind(this.execQueryResultSvc, this), 3000);
            }
        }
    };

    //定向提现
    var withdrawbackResult = {
        pageTitle: STRING.WITHDRAWBACK_TITLE,
        renderCode: 4,
        getInfo: function () {
            var store = WalletStore.SubmitFixed.getInstance();
            var WithDrawBackStore = WalletStore.WithDrawBack.getInstance();
            var info = store.get();
            var ret = {
                forwardTo: 'transacthistory',//按钮点击事件跳转页面
                btnText: '确定',//按钮文字
                renderCode: this.renderCode,//渲染模板
                resultCode: 1//成功与否 1.成功 2.失败 3.处理中
            };

            if (info.rc == 0) {
                ret.resultCode = 1;
                ret.msgTitle = '提现提交成功！';
            } else {
                ret.resultCode = 2;
                ret.msgTitle = '提现提交失败！';
            }
            ret.msg = info.rmsg;

            var amount = WithDrawBackStore.getAttr('amount');
            amount = Util.parseMoneyZeroFill(amount);
            var lastLine = '<li class="p15_0">' +
                             '<div class="t_r font16">提现总额:<span class="font20 green"><small>￥</small>{1}.<small>{2}</small></span></div>' +
                             '</li>';
            if (amount) {
                lastLine = Util.formatStr(lastLine, amount.split('.')[0], amount.split('.')[1]);
            }


            if (info && info.fixedlist && info.fixedlist.length) {
                Tradelist.setData(info.fixedlist, {
                    lastLine: lastLine
                });
                var template = Tradelist.getTemplate();
                var $template = $(template);

                ret.detail = $template[0].outerHTML;
            } else {
                ret.detail = '';
            }

            return ret;
        }
    };


    //返现 转出到储蓄卡.
    var transferResult = {
        renderCode : 5,
        getInfo: function() {
            var _transfer2Store = WalletStore.Transfer2Store.getInstance();
            var _info = _transfer2Store.get();

            var _resultCode = 0,
                _msgTitle = "",
                _msg = "",
                _msgStatue="",
                _pageTitle="",
                _amount = _info.amount,
                _bankName = _info.bankname,
                _btnText = STRING.FINISH;

             if(_info.status == RESULT.FAIL){
                //转出失败.
                 _resultCode = RESULT.FAIL;
                _msgTitle = STRING.FAIL;
                _msg = _info.rmsg;
                _msgStatue='no';
                _btnText = STRING.CONFIRM;
                _pageTitle=STRING.FAIL;

            } else if(_info.status == RESULT.PROCESSING||_info.status == RESULT.SUCCESS) {
                //转出处理中...
                _resultCode = RESULT.PROCESSING;
                _msgTitle = STRING.PROCESSING;
                _msgStatue='yes';
                _msg = _info.rmsg;
                _btnText = STRING.FINISH;
                _pageTitle=STRING.TITLE;
            }

            var ret = {
                pageTitle : _pageTitle,
                forwardTo: 'useraccount',
                btnText: _btnText,
                renderCode: this.renderCode,
                resultCode: _resultCode,
                msgTitle: _msgTitle,
                msg: _msg,
                msgStatue:_msgStatue,
                amount: _amount,
                bankname: _bankName
            };

            return ret;
        }
    };

    /**
    *@description: the result of  exchanging phone
    */
    var exchgPhoneResult = {
        pageTitle: STRING.EXCHGPHONE_TITLE,
        renderCode : 6,
        getInfo: function () {
            var amt = this.getQuery("amt");
            var isSuc = this.getQuery("issuc");
            var realamt = this.getQuery("realamt");
            var phone = exchgPhoneMsgStore.getAttr("phone"), _msg = exchgPhoneMsgStore.getAttr("msg");
            if (phone) phone = decodeURIComponent(phone);
            var result = {
                forwardTo: 'useraccount',
                btnText: STRING.RETURN,
                renderCode: this.renderCode,
                msgTitle: STRING.EXCHGPHONE_SUC_MSGTITLE,
                msg: _msg,
                buname: STRING.EXCHGPHONE_BUNAME,
                resultCode: RESULT.SUCCESS
            };

            result["amount"] = amt;
            result["realamt"] = realamt;
            result["phone"] = phone;
            if (isSuc == 0) {
                result["btnText"] = STRING.FINISH;
                result["msgTitle"] = STRING.EXCHGPHONE_SUC_MSGTITLE;
                result["resultCode"] = RESULT.SUCCESS;
            } else if (isSuc == 1) {
                result["btnText"] = STRING.FINISH;
                result["msgTitle"] = STRING.EXCHGPHONE_FAIL_MSGTITLE;
                result["resultCode"] = RESULT.FAIL;
            }

            return result;
        }
    };

    var exports = WalletPageView.extend({
        tpl: html,
        backBtn: true,
        events: {
            'click .J_FinishBtn': 'finishHandler'
        },
        /**
        * @description it will merge by path param and choice page.
        */
        onShow: function () {
            var path = this.getQuery('path');
            var page = null;
            switch (path) {
                case 'withdraw':
                    page = withdrawResult;
                    break;
                case 'cashback':

                    page = cashbackResult;
                    break;
                case 'recharge':

                    page = rechargeResult;
                    break;
                case 'withdrawback':

                    page = withdrawbackResult;
                    break;
                case 'transfer':

                    page = transferResult;
                    break;
                case 'exchgphone':

                    page = exchgPhoneResult;
                    break;
                case 'addaccountinfo':
                    page=addAccountResult;
                    break;
            }

            Util.mix(this, page);

            var info = this.getInfo();//TODO just to get backToPage
            //backToPage should set before super.onShow
            this.backToPage = this.forwardTo =info.forwardTo;
            this.inherited(arguments);

            if (this.asyncRender) {
                //set title first, then update view data
                if(info.pageTitle){
                    this.resetHeaderView({
                        title: info.pageTitle
                    });
                }
                this.asyncRender();
            } else {
                this.render();
            }

            this.turning();
        },
        render: function () {
            var info = this.getInfo();
            if(info.pageTitle){
                this.resetHeaderView({
                    title: info.pageTitle
                });
            }else{
                this.resetHeaderView({
                    title: this.pageTitle
                })
            }
            this.$el.html(_.template(this.tpl, info));
        },
        finishHandler: function () {
            this.doneHandler && this.doneHandler();
            if (this.forwardTo) {
                this.forward(this.forwardTo);
            }
        },        
        returnHandler:function(){
            this.inherited(arguments);
            this.doneHandler && this.doneHandler();
        },
        onHide: function () {
            this.inherited(arguments);
            this.asyncRender = null;
            this.pageTitle = "";
            this.forwardTo = this.backToPage = "";
            this.btnText = "";
            this.renderCode = null;
            this.msgTitle = "";
            this.msg = "";
        }
    });

    return exports;
});

