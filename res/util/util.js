/**
 * @module util
 * @author luzx, wxm
 * @version since Wallet V5.8
 * @description wallet base page view for all wallet standalone pages
 */
define(['CommonStore', 'cUtilCryptBase64', 'Config', 'cGuiderService', 'cMemberService', 'cUtilCommon', 'FeedModel', 'WalletStore', 'Message', 'Log', 'LoadingLayer', 'CacheData', 'UIAlert', 'UIToast', 'PageMap', 'IdCard', 'UBT', 'WxShare'],
    function(CommonStore, cUtilCryptBase64, Config, cGuiderService, cMemberService, cUtilCommon, FeedModel, WalletStore, Message, Log, LoadingLayer, CacheData, UIAlert, UIToast, PageMap, IdCard, UBT, WxShare) {
        var MOBILE_REG = /^1(3|4|5|7|8)\d{9}$/;
        var SIX_NUM_REG = /^\d{6}$/;

        var STRING = {
            NOT_LOGIN: "您尚未登录，登录后才能管理携程钱包",
            GO_LOGIN: "去登录",
            NOT_SUPPORT_ACNT: "会员账户暂不支持携程钱包，个人用户请先登录www.ctrip.com，进入我的携程-我的信息设置手机或邮箱后即可升级为钱包账户。",
            CONFIRM: "确定",
            AUTH_RETRY_LIMIT: "无法获取登录信息，请联系携程客服"
        };
        var certListStore = WalletStore.CertListStore.getInstance();
        var realCertListStore = WalletStore.RealCertListStore.getInstance();
        var exports = {
            getMobileReg: function() {
                return MOBILE_REG;
            },
            //判断运通卡
            isAECard: function(cardType) {
                return cardType == 58 || cardType == 8;
            },
            /**
             * @description check the ua and return true if your device is iphone
             *
             */
            isIphone: function() {
                return navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
            },
            /**
             * @description mix a object with b object
             *
             */
            mix: function(a, b) {
                for (var i in b) {
                    a[i] = b[i];
                }
                return a;
            },
            /**
             * @description parse bank card code
             * @example
             * if you input '123456789123456789'
             * it will return '1234 **** 89'
             */
            parseCard: function(str) {
                if (str.indexOf("*") != -1) {
                    return str;
                } else {
                    return str.substr(0, 4) + " " + str.substr(4, 2) + "****" + str.substr(-2);
                }
            },
            /**
             * @description parse money
             * @example input '.2' return '0.2'
             */
            parseMoney: function(val) {
                if (val.charAt(0) == '.') {
                    val = '0' + val;
                }
                return val;
            },
            /*
             *@description parse money
             *@example'.2' return '0.2','0.2360'return'0.23'
             */
            parseInputMoney: function(val) {
                var re = /([0-9]+.[0-9]{2})[0-9]*/;
                if (val.charAt(0) == '.') {
                    val = '0' + val;
                }
                if (val.indexOf('.') != -1) {
                    val = val.replace(re, "$1")
                }
                return val;
            },
            /*
             */
            compareZero: function(val) {
                var tplIndex = val.indexOf('.');
                if (tplIndex != -1) {
                    var floatVal = val.substring(tplIndex + 1);
                    if (parseInt(floatVal) > 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            /**
             * @description fill up with zero
             * @example inpit '.2' return '0.20'
             *
             */
            parseMoneyZeroFill: function(val) {
                val = val.replace(/^0+(?!=0)/, '').replace(/\.(?!=0)0+$/, '');
                if (/^\d*\.*\d*$/.test(val)) {
                    if (/^\.\d$/.test(val)) {
                        val = '0' + val + '0';
                    } else if (/^\.\d+$/.test(val)) {
                        val = '0' + val;
                    } else if (/^\d+\.\d$/.test(val)) {
                        val = val + '0';
                    } else if (/^\d+\.$/.test(val)) {
                        val = val + '00';
                    } else if (/^\d+$/.test(val)) {
                        val = val + '.00';
                    }
                }

                return val;
            },
            /**
             * @description will return false if you input any text like '0' or '0.000'
             */
            passCheckZeroMoney: function(val) {
                if (val == '' || val == '0' || /^0+\.$|^\.0+$|^0+\.0+$/.test(val)) {
                    return false;
                } else {
                    return true;
                }
            },
            /**
             * zeroize num to string
             * 1 -> '01'
             */
            zeroize: function(value, length) {
                if (!length) {
                    length = 2;
                }
                value = new String(value);
                for (var i = 0, zeros = ''; i < (length - value.length); i++) {
                    zeros += '0';
                }
                return zeros + value;
            },
            /**
             * @description check the money format  is right or not
             */
            passCheckMoney: function(val) {
                if (/^[\.\d]+$/.test(val) && val.indexOf('.') == val.lastIndexOf('.') && /^[1-9]+0*\.\d+$|^0\.0*[1-9]+0*$|^[^0]+\d*$/.test(val)) {
                    if (val.indexOf(".") != -1) {
                        var t = val.split(".")[1];
                        if (t.length > 2) {
                            return false;
                        }
                    }

                    return true;
                } else {
                    return false
                }
            },
            /**
             * @description set cursor to where you want.
             */
            setCursorTo: function(dom, index) {
                if (dom.createTextRange) {
                    var r = dom.createTextRange();
                    r.moveStart('character', index);
                    r.collapse(true);
                    r.select();
                } else {
                    setTimeout(function() {
                        dom.setSelectionRange(index, index);
                        dom.focus();
                    }, 1);
                }
            },
            /**
             * @description trim blank
             */
            trimAll: function(str) {
                if (str) {
                    str = str.replace(/\s/g, "");
                }
                return str
            },
            /**
             * @description format card
             * @example
             * input '123456789' return '1234 5678 9'
             */
            formatCardCode: function(num) {
                num += '';
                num = num.replace(/\s+/g, "").replace(/(\w{4})/g, "$1 ").replace(/\s$/, "");
                return num;
            },
            formatCardCode2: function(num, e) {
                var keyCode = e.keyCode;
                if (keyCode == 8 && num.length % 5 == 4) {
                    return num.substr(0, num.length - 1);
                }
                num = this.formatCardCode(num);
                if (num.length % 5 == 4) {
                    num = num + ' ';
                }
                num = num.substr(0, 23);
                return num;
            },
            /**
             * @description format mobile
             * @example
             * input '18999999999' return '189 9999 9999'
             */
            formatMobileNo: function(num) {
                num += '';
                num = num.replace(/\s+/g, "");
                var len = num.length;
                if (len <= 3) {
                    return num;
                } else if (len <= 7) {
                    num = num.replace(/(\d{3})(\d{1,4})/g, "$1 $2").replace(/\s$/, "");
                } else {
                    num = num.substr(0, 11);
                    num = num.replace(/(\d{3})(\d{4})(\d{1,4})/g, "$1 $2 $3").replace(/\s$/, "");
                }
                return num;
            },
            formatMobileNo2: function(num, e) {
                var keyCode = e.keyCode;
                if (keyCode == 8 && (num.length == 3 || num.length == 8)) {
                    return num.substr(0, num.length - 1);
                }
                num = this.formatMobileNo(num);
                if (num.length == 3 || num.length == 8) {
                    num = num + ' ';
                }
                return num;
            },
            /**
             * @description call local api to call phone.
             */
            callPhone: function(number) {
                if (Config.IS_INAPP) { //
                    cGuiderService.callPhone({
                        tel: number
                    });
                } else {
                    window.location.href = "tel:" + number;
                }
            },
            isFromNativePage: function() {
                var idx = location.href.indexOf('from_native_page');
                return idx >= 0;
            },
            checkLogin:function(){
                if (Config.MOCK_SERVICE_CALL) {
                    return true;
                }
                var userStore = CommonStore.UserStore.getInstance();
                  if((Config.IS_WEBH5)&&!FeedModel.getFeedAuth()){
                    return false
                  }else if(Config.IS_INAPP&&!userStore.isLogin()){
                    return false
                  }else{
                    return true
                  }
            },
            //return: true for valid auth and user type
            checkUser: function(that, bIgnoreFromLogin) {
                if (Config.MOCK_SERVICE_CALL) {
                    return true;
                }
                var bCheckLogin = !bIgnoreFromLogin && location.href.indexOf('ifrmlgi') != -1;
                if ((Config.IS_WEBH5) && !FeedModel.getFeedAuth()) { //
                    var retryStore = WalletStore.LoginRetryStore.getInstance();
                    var times = retryStore.getAttr('trytimes');
                    if (times > Config.AUTH_RETRY_TIMES) {
                        retryStore.setAttr('trytimes', 0);
                        this.showRetryMaxAlert(that);
                    } else {
                        retryStore.setAttr('trytimes', ++times);
                        if (bCheckLogin) {
                            that.exitWalletModule();
                            return false;
                        } else {
                            this.showLoginAlert(that);
                        }
                    }
                    that.bIgnoreBackKey = true;
                    return false;
                } else if (Config.IS_INAPP) { //
                    var userStore = CommonStore.UserStore.getInstance();
                    if (!userStore.isLogin()) {
                        if (bCheckLogin) {
                            that.exitWalletModule();
                            return false;
                        } else {
                            this.showLoginAlert(that);
                        }
                        that.bIgnoreBackKey = true;
                        return false;
                    }
                    //leave wallet-support-checking to wallet service(index and transacthistory page), not local user store
                    //if (userStore.isNonUser()) {
                    //    this.showAcntUnsupAlert(that);
                    //    return false;
                    //}
                }
                return true;
            },
            showRetryMaxAlert: function(viewContext) {
                // viewContext.showDlg({
                //     message: STRING.AUTH_RETRY_LIMIT,
                //     buttons: [{
                //         text: STRING.CONFIRM,
                //         click: function() {
                if (Config.IS_INAPP) { //
                    cGuiderService.home();
                } else {
                    viewContext.jump(Config.H5_MAIN_HOME_URL);
                }
                //         }
                //     }]
                // });
            },
            showLoginAlert: function(viewContext) {
                // var that = this;
                // viewContext.showDlg({
                //     message: STRING.NOT_LOGIN,
                //     buttons: [{
                //         text: STRING.GO_LOGIN,
                //         click: function() {
                //             that.gotoLogin(viewContext);
                //             this.hide();
                //         }
                //     }]
                // });

                //6.10 request: not show alert
                this.gotoLogin(viewContext);
            },
            showAcntUnsupAlert: function(viewContext) {
                viewContext.showDlg({
                    message: STRING.NOT_SUPPORT_ACNT,
                    buttons: [{
                        text: STRING.CONFIRM,
                        click: function() {
                            // if (viewContext.tokenInfo() && viewContext.tokenInfo().from) {
                            //     //viewContext.jump(viewContext.tokenInfo().from);//hybrid can't jump??
                            //     viewContext.jump2TokenUrl(viewContext.tokenInfo().from);
                            // } else {
                            //     if (Config.IS_INAPP) { //
                            //         cGuiderService.home();
                            //     } else {
                            //         viewContext.jump(Config.H5_MAIN_HOME_URL);
                            //     }
                            // }
                            viewContext.returnHandler();
                            this.hide();
                        }
                    }]
                });
            },
            gotoLogin: function(viewContext) {
                var that = this;

                var bFromLogin = location.href.indexOf('ifrmlgi') != -1;
                var param = location.href;
                if (!bFromLogin) {
                    param = location.href + ((location.href.indexOf('?') != -1) ? '&' : '?') + 'ifrmlgi=1';
                }
                cMemberService.memberLogin({
                    param: "from=" + encodeURIComponent(param),
                    callback: function(userData) {
                        if (Config.IS_INAPP) { //
                            if (Config.IS_HYBRID) {
                                var f, p;
                                var s = location.href.split('\/wallet\/index.html');
                                if (s[1]) {
                                    var x = (location.href.indexOf('?') != -1) ? '&' : '?';
                                    if (!bFromLogin) {
                                        p = 'index.html' + s[1] + x + 'ifrmlgi=1';
                                    } else {
                                        p = 'index.html' + s[1];
                                    }
                                } else {
                                    p = 'index.html?ifrmlgi=1';
                                }
                                cGuiderService.cross({
                                    path: 'wallet',
                                    param: p
                                });
                            } else {
                                if (!bFromLogin) {
                                    location.href = location.href + ((location.href.indexOf('?') != -1) ? '&' : '?') + 'ifrmlgi=1';
                                } else {
                                    location.reload();
                                }
                            }
                        }
                    }
                });
            },
            getTokenFromUrl: function() {
                var token = Lizard.P('token'); //{from:''}
                if (token) {
                    return this.parseObj(token);
                } else {
                    var from = Lizard.P('from'); //TODO
                    if (from && (from.match(/^http/i) || from.match(/^file/i))) {
                        return {
                            from: decodeURIComponent(from)
                        };
                    } else {
                        return null;
                    }
                }
            },
            getReferrerPage: function(context) {
                if (context.referrer) {
                    return context.referrer.replace(/(.*\/)?([_a-zA-Z0-9]*).*/i, '$2');
                }

            },
            parseObj: function(val) {
                var obj;
                try {
                    obj = JSON.parse(cUtilCryptBase64.Base64.decode(decodeURIComponent(val)));
                    return obj;
                } catch (e) {
                    console.log("parse obj error!!! obj string = " + val);
                    return false;
                };
            },
            /**
             * @description subtring++, also include chinese.
             */
            substring: function(str, len) {
                var vlen = 0,
                    i = 0;
                for (; i < str.length; i++) {
                    if (vlen >= len) {
                        break;
                    } else {
                        if (str.charCodeAt(i) < 27 || str.charCodeAt(i) > 126) {
                            vlen += 2;
                        } else {
                            vlen++;
                        }
                    }
                }
                return str.substring(0, i);
            },
            /**
             * @description format mobile
             * @example
             * input '15900001111' return '159****1111'
             */
            getMobile: function(num) {
                num = num + '';
                var r = num.substr(0, 3) + "****" + num.substr(-4);
                return r;
            },
            isSixNum: function(num) {
                num = num + '';
                return SIX_NUM_REG.test(num);
            },
            /**
             * @description verfied id code
             */
            verfiredICode: function(iCode) {
                iCode = iCode + '';
                var len = this.getNumLen(iCode);
                if (len == 0) {
                    return 315;
                }

                if (!SIX_NUM_REG.test(iCode)) {
                    return 316;
                }

                return true;
            },
            /**
             * @description verfire your input is mobile or not
             */
            verfiredMobile: function(mobile) {
                mobile = mobile + '';
                var len = this.getNumLen(mobile);
                if (len == 0) {
                    return 311;
                }

                if (!MOBILE_REG.test(mobile)) {
                    return 312;
                }

                return true;
            },
            verfiredBirth: function(birth) {
                if (birth == '') {
                    return 381;
                }
                return true;
            },
            /**
             * @description verfire your twice input
             */
            verfiredTwoPassWord: function(ps1, ps2) {

                var ps1r = this.verfiedPassWord(ps1);
                var ps2r = this.verfiedPassWord(ps2);

                switch (ps1r) {
                    case 0:
                        return 306;
                        break;
                    case 1:
                        return 325;
                        break;
                    case 2:
                        return 308;
                        break;
                }

                if (ps2r == 0) {
                    return 309;
                }

                if (_.isEqual(ps1, ps2)) {
                    return true;
                } else {
                    return 310;
                }
            },
            /**
             * @description
             *   verfied password
             *   follows are illegal
             *
             *  @example
             *        ABCDEF: 123456
             *        ABCABC: 123123
             *        ABCCBA: 123321
             *        AAAAAA: 111111
             */
            verfiedPassWord: function(password) {
                password = password + '';
                var padLength = this.getNumLen(password);

                if (padLength == 0) {
                    return 0;
                }

                if (!SIX_NUM_REG.test(password)) {
                    return 1;
                }

                var that = this;

                var firstBlock = password.substr(0, 3);
                var lastBlock = password.substr(3);

                //ABCDEF
                function a() {
                    return that.isSerialNumber(password);
                }
                //ABCABC
                function b() {
                    return that.isSerialNumber(firstBlock) && _.isEqual(firstBlock, lastBlock);
                }

                //ABCCBA
                function c() {
                    return that.isSerialNumber(firstBlock) && _.isEqual(firstBlock.split(''), lastBlock.split('').reverse());
                }

                //AAAAAA
                function d() {
                    var flag = false;
                    var o = {};
                    _.each(password.split(''), function(item) {
                        o[item] = 1;
                    });
                    if (_.keys(o).length == 1) {
                        flag = true;
                    }

                    return flag;
                }


                if (a() || b() || c() || d()) {
                    return 2;
                }

                return true;
            },
            /**
             * @description wheather the number is serial (0 and 9 are not continuous)
             * @example ABCDEF: 123456 or 654321
             */
            isSerialNumber: function(number) {
                var tNumber = number + '';
                if (!/^\d+$/.test(tNumber)) {
                    return false;
                }

                var tReverseNum = tNumber.split('').reverse().join('');

                function check(input) {
                    //forward eg : 123456
                    for (var i = input.length - 1; i; i--) {
                        var l = parseInt(input[i - 1]),
                            r = parseInt(input[i]);
                        if ((l + 1) != r) {
                            return false;
                        }
                    }
                    return true;
                }

                if (check(tNumber) || check(tReverseNum)) {
                    return true;
                }

                return false;
            },
            /**
             * @description is zero?
             */
            isZero: function(str) {
                return /^0*(\.0+)?$/.test(str);
            },
            /**
             * @description get string lenth
             */
            getNumLen: function(number) {
                return (number + "").length;
            },
            getSafeLevel: function(nLevel) {
                var safeMapping = {
                    0: '警告',
                    1: '低',
                    2: '中',
                    3: '高'
                };
                return safeMapping[nLevel];
            },
            getSafeLevelClass: function(nLevel) {
                return 'alertc_' + (nLevel + 1);
            },
            getAccountStatus: function(nStat) {
                var statMapping = {
                    0: '创建',
                    1: '激活',
                    2: '冻结',
                    9: '注销'
                };
                return statMapping[nStat];
            },
            getWithdrawType: function(nType) {
                var typeMapping = {
                    1: '处理中',
                    2: '成功',
                    3: '失败',
                    4: '部分成功'
                };
                return typeMapping[nType];
            },
            getRechargeType: function(nType) {
                var typeMapping = {
                    1: '处理中',
                    2: '成功',
                    3: '失败',
                    8: '充值退回'
                };
                return typeMapping[nType];
            },
            //根据CreditCardType确定卡类型（1~499直连信用卡；500~999银联信用卡；1000以上银联储蓄卡）。
            getCardType: function(nType) {
                if (nType <= 999)
                    return '信用卡';
                else
                    return '储蓄卡';
            },
            getCardAuth: function(status) {
                if (status == 21) {
                    return '待验证';
                } else if (status == 22) {
                    return '已验证';
                } else if (status == 23) {
                    return '担保卡';
                }
            },
            extObj: function(srcObj, desObj) {
                for (var key in srcObj) {
                    desObj[key] = srcObj[key];
                }
            },
            getPlatformType: function() {
                //1 = IOS_Native
                //2 = Android_Native
                //3 = IOS_Hybrid
                //4 = Android_Hybrid
                //5 = H5

                if (!Config.IS_INAPP) { //
                    return 5;
                }

                var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
                if ((u.indexOf("mac", 0) != -1) || (u.indexOf("ios", 0) != -1)) {
                    return 3;
                }
                if ((u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1)) {
                    return 4;
                }
                //if (u.indexOf('MicroMessenger') > -1) {
                //    return 3;
                //}
                return -1;
            },
            /**
             * @description get system code.
             * @return: 当前H5为09；Hybrid及Native为32(Android)和12(iOS); 青春版：Android :36，IOS: 16
             */
            getSyscode: function() {
                if (!Config.IS_INAPP) { //
                    return '09';
                } else {
                    var deviceInfo = JSON.parse(localStorage.CINFO);
                    return deviceInfo.systemCode;
                }
            },
            /**
             * @description format bank name
             */
            fmtBankName: function(str) {
                if (this.isEmpty(str) || str == 'null') {
                    return '';
                }
                var ret = str;
                ret = this.substring(str.replace(/\s+/g, ''), 18);

                if (ret != str.replace(/\s+/g, '')) {
                    ret = this.substring(ret, 16);
                    ret = ret + '…';
                }
                return ret;
            },
            /**
             * @description format string
             * @example
             * var str = 'aaa{0}bbb';
             * str = Util.formatStr(str,1);
             * 'aaa1bbb'
             */
            formatStr: function(str) {
                var args = _.toArray(arguments);
                var strings = args.splice(1);
                for (var i = 0; i < strings.length; i++) {
                    str = str.replace('{' + (i + 1) + '}', strings[i]);
                }
                return str;
            },
            isEmpty: function(str) {
                return _.isUndefined(str) || _.isNull(str) || _.isNaN(str) || _.isEmpty(str);
            },
            getAuth: function() {
                return CommonStore.HeadStore.getInstance().get().auth;
            },
            getQuery: function(str, name) {
                var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
                var ret = "";
                if (reg.test(str)) {
                    ret = unescape(RegExp.$2);
                    if (ret == 'null' || ret == 'undefined') {
                        ret = "";
                    }
                }
                return ret;
            },
            getViewAndParam: function() {
                var ret = '';
                if (Config.IS_HYBRID) {
                    if (location.hash.indexOf('balance') != -1) {
                        ret = location.hash.replace(/#balance\//i, '');
                    } else {
                        ret = location.hash.replace(/#/i, '');
                    }
                } else {
                    ret = location.href.replace(/.*wallet\/([_a-zA-Z0-9]*)/i, '$1');
                }
                if (ret === '') {
                    ret = 'index';
                } else if (ret.indexOf('?') === 0) { //h5:https://secure.ctrip.com/webapp/wallet/?xxx=x
                    ret = 'index' + ret;
                }
                ret && (ret = decodeURIComponent(ret));
                return ret;
            },
            getEncodeUrl: function(params) { //得到encodeUriCom后的地址
                var self = params.scope;
                var _url = params.url;
                var enUrl = "";
                var temp = self.getRoot() + "#balance/" + _url;
                enUrl = encodeURIComponent(temp);
                return enUrl;
            },
            /**
             * @description is uc browser?
             */
            isUCBrowser: function() {
                var ua = navigator.userAgent.toLowerCase();
                return ua.indexOf('ucbrowser') != -1 || ua.indexOf('ubrowser') != -1;
            },
            escapeWlt: function(html) {
                var elem = document.createElement('div');
                var txt = document.createTextNode(html);
                elem.appendChild(txt);
                return elem.innerHTML;
            },
            unescapeWlt: function(str) {
                var elem = document.createElement('div');
                elem.innerHTML = str;
                return elem.innerText || elem.textContent
            },
            /**
             * @description get viewname
             */
            getViewName: function() {
                var ret;
                if (Config.IS_HYBRID) {
                    if (location.hash.indexOf('balance') != -1) {
                        ret = location.hash.replace(/#balance\/([_a-zA-Z0-9]*).*/i, '$1');
                    } else {
                        ret = location.hash.replace(/#([_a-zA-Z0-9]*).*/i, '$1');
                    }
                } else {
                    ret = location.href.replace(/.*wallet\/([_a-zA-Z0-9]*).*/i, '$1');
                }
                return ret ? ret : 'index'; //user not give hash, then default page is index
            },
            /**
             *@description: get array signed
             *@author: zh.xu
             *@version: 6.3
             */
            getSignedRechargeArr: function(arr, recash_amt) {
                var self = this;
                var _arr = [];
                _.each(arr, function(item) {
                    _result = self.compareTwoNum(recash_amt, item.recashamt);
                    if (_result == 1 || _result == 0) {
                        item.enabled = true;
                    } else {
                        item.enabled = false;
                    }
                    _arr.push(item);
                });
                return _arr;
            },
            /**
             *@description: get index of Object indicated
             *@author: zh.xu
             *@version: 6.3
             */
            getIndexByObj: function(arr, obj) {
                var _index = -1;
                _.each(arr, function(item, index) {
                    if (obj == item) {
                        _index = index;
                    }
                });
                return _index;
            },
            /**
             *@description: the object which is the most close to recash amount
             *@author: zh.xu
             *@version: 6.3
             */
            getBestRechargeObj: function(arr, recash_amt) {
                var other_arr = [],
                    obj = null,
                    self = this;
                other_arr = _.filter(arr, function(ele) {
                    var _result = self.compareTwoNum(recash_amt, ele.recashamt);
                    return (_result == 0 || _result == 1) ? true : false;
                });
                obj = _.max(other_arr, function(ele) {
                    return self.getNumByHundred(ele.recashamt);
                });
                return obj;
            },
            /**
             *@description: get a number multipled by one hundred
             *@author: zh.xu
             *@version: 6.3
             */
            getNumByHundred: function(recash_amt) {
                var amt = 0;
                amt = parseInt(Number(recash_amt) * 100);
                return amt;
            },
            /**
             *@description: compare a number to the other
             *@author: zh.xu
             */
            compareTwoNum: function(amt, otherAmt) {
                var result = -1;
                if (this.getNumByHundred(amt) > this.getNumByHundred(otherAmt)) {
                    result = 1;
                } else if (this.getNumByHundred(amt) == this.getNumByHundred(otherAmt)) {
                    result = 0;
                } else {
                    result = -1
                }
                return result;
            },
            /**
             *@description: get pageid or recreate value from viewmap
             *@view:index?path=xxx&xxx=yyy
             *@author: yanjj
             */
            pageReg: /([_a-zA-Z0-9]*).*/i,
            getPageParam: function(context, view, param) {
                var _viewName = view.replace(this.pageReg, '$1'); //this -> Util
                var _page, _ref, _subRef, _path;
                if (param === 'pageid') {
                    if (_viewName && param && (_page = PageMap[_viewName]) && (_ref = _page[param])) {
                        if (_ref instanceof Array) {
                            return {
                                pageid: _ref[0],
                                hpageid: _ref[1]
                            };
                        } else if (_ref instanceof Object) {
                            _path = context.getQuery('path'); //context -> WalletPageView
                            if ((_subRef = _ref[_path]) || (_subRef = _ref['default'])) {
                                return {
                                    pageid: _subRef[0],
                                    hpageid: _subRef[1]
                                };
                            }
                        }
                    }
                } else if (param === 'recreate') {
                    if (_viewName && param && (_page = PageMap[_viewName]) && (_ref = _page[param]) !== undefined) {
                        if (_ref instanceof Object) {
                            _path = this.getQuery(view, 'path'); //this -> Util
                            if ((_subRef = _ref[_path]) !== undefined || (_subRef = _ref['default'])) {
                                return _subRef;
                            } else {
                                return false;
                            }
                        } else if (typeof _ref === "boolean") {
                            return _ref;
                        }
                    } else {
                        return false;
                    }
                }
            },
            /**
             *@description: bind common apis to wallet base view instance, such as walletpagevie,
             *@author: wxm
             */
            bindCommonApi: function(context) { //context -> WalletPageView
                var that = this; //this -> Util
                //page id api...
                context.setPageId = function() {
                    var _viewName = this.viewname;
                    var pageids = that.getPageParam(context, _viewName, 'pageid');
                    if (pageids) {
                        this.pageid = pageids.pageid;
                        this.hpageid = pageids.hpageid;
                    }
                };

                //loading api...
                context.loading = {
                    show: function() {
                        LoadingLayer.show();
                    },
                    hide: function() {
                        LoadingLayer.hide();
                    }
                };
                context.showLoading = function() {
                    LoadingLayer.show();
                };
                context.hideLoading = function() {
                    LoadingLayer.hide();
                };

                //alert wrapper api...
                context.showDlg = function(param) {
                    if (!this.alert || !this.alert.isShow) {
                        var obj = {};
                        obj.datamodel = {};
                        obj.datamodel.btns = [];
                        obj.events = {};
                        var class_prefix = 'wallet_alert_btn_idx';

                        obj.datamodel.content = param.message;
                        for (var i = 0; i < param.buttons.length; i++) {
                            obj.datamodel.btns.push({
                                name: param.buttons[i].text,
                                className: class_prefix + i
                            });
                            //obj.events['click .' + class_prefix + i] = param.buttons[i].click;
                            obj.events['click .' + class_prefix + i] = (function(i) {
                                return function() {
                                    param.buttons[i].click.call(this);
                                    this.isShow = false;
                                };
                            }(i));
                        }

                        this.alert = new UIAlert(obj);
                        this.alert.show();

                        this.alert.isShow = true;
                    }
                };

                //toast wrapper api...
                context.showToast = function(content, param2, callback) {
                    if (!param2 || (param2 && typeof param2 == 'function')) {
                        //function (content, callback)
                        var data = {
                            content: content
                        };
                        if (param2) {
                            Lizard.showToast({
                                datamodel: data,
                                hideAction: param2
                            });
                        } else {
                            Lizard.showToast({
                                datamodel: data
                            });
                        }
                    } else {
                        //function (content, second, callback)
                        if (callback) {
                            this.toast02 = new UIToast({
                                datamodel: {
                                    content: content
                                },
                                needAnimat: false,
                                hideSec: param2 * 1000,
                                hideAction: callback
                            });
                        } else {
                            this.toast02 = new UIToast({
                                datamodel: {
                                    content: content
                                },
                                needAnimat: false,
                                hideSec: param2 * 1000
                            });
                        }

                        this.toast02.show();
                    }
                };

                context.sendUBT = function(key, data) {
                    UBT._sendUBT(key, data);
                };

                context.setUBTListener = function() {
                    var ubtMap = this.ubtMap || [];
                    $(ubtMap).forEach(function(item, index, array) {
                        var target = item.target;
                        var key = item.key;
                        var dataHandler = item.dataHandler.bind(this);
                        var cb = item.cb;

                        var listener = item.listener = (function(target, key, dataHandler, cb) {
                            return function(e) {
                                var e = e || window.event;
                                var data = dataHandler();
                                for (var i = 0; i < target.length; i++) {
                                    var targetClass = target[i].replace(/[#.]/g, "");
                                    //if(e.target.className.indexOf(targetClass) !== -1){
                                    if ($(e.target).hasClass(targetClass)) {
                                        UBT._sendUBT(key, data, cb);
                                        that.removeEvent(document, 'click', listener, true);
                                    }
                                }
                            };
                        }(target, key, dataHandler, cb));
                        that.removeEvent(document, 'click', listener, true);
                        that.addEvent(document, 'click', listener, true);
                    }, context);
                };

                context.unsetUBTListener = function() {
                    var ubtMap = this.ubtMap || [];
                    $(ubtMap).forEach(function(item, index, array) {
                        var listener = item.listener;
                        that.removeEvent(document, 'click', listener, true);
                    }, context);
                };

                context.getPathParam = function(href) {
                    if (href.match(/^(https?|ctrip):\/\//i)) {
                        //zhilian or h5
                        return {
                            path: href,
                            type: 0 //0 for h5/zhilian type
                        };
                    } else {
                        var ret = href.match(/.*webapp\w*\/\/?(.*)\/(\w+\.html.*)/i);

                        return {
                            path: ret[1],
                            param: ret[2],
                            type: 1 //1 for hybrid type
                        };
                    }
                };

                /**
                 * @description go to page whose address is specified by param fromUrl
                 */
                context.jump2TokenUrl = function(fromUrl, replace) {
                    if (Config.IS_INAPP) { //
                        var obj = this.getPathParam(fromUrl);
                        if (obj.type == 1) {
                            //hybrid
                            cGuiderService.cross({
                                path: obj.path,
                                param: obj.param
                            });
                        } else {
                            //zhilian
                            //guider jump will create new webview, so just use location.href
                            //cGuiderService.jump({
                            //    targetModel: fromUrl.match(/^ctrip:\/\//i) ? 'app' : 'h5',
                            //    url: obj.path //title: document.title
                            //});
                            location.href = fromUrl;
                        }
                    } else {
                        if (replace) {
                            this.jump(fromUrl, true);
                        } else {
                            this.jump(fromUrl);
                        }
                    }
                };
            },
            /**
             *@description: preprocess events, avoid multi `click` elems in short time, such as 500ms
             *@author: yjj
             */
            preprocEvents: function(context) {
                var that = this;

                var originEvents = context.events; //log backbone events
                _.each(originEvents, function(item, key) {
                    //console.log('events key:'+key);
                    if ($.trim(key).indexOf('click') === 0) { //start with `click`
                        originEvents[key] = (function(item, key) {
                            var isPreprocessed = !!item.isPreprocessed;

                            if (isPreprocessed) { //if preprocessed recovery it to backbone events
                                item = item.origin;
                            }

                            //preprocess backbone events, add timeout click filter
                            var fnPreprocessed = function(evt) {
                                var fn;
                                if (_.isFunction(item)) {
                                    fn = item;
                                } else if (_.isString(item)) {
                                    fn = this[item];
                                }
                                //console.log('>>>>>>>>>>>>>>>> Call by proxy >>>>>>>>>>>>>>>>');
                                //console.warn('item:' + item);
                                that.timeoutClick.call(this, fn, evt);
                            }.bind(context);

                            //avoid return to page those events has preprocessed
                            fnPreprocessed.isPreprocessed = true; //log backbone events has preprocessed
                            fnPreprocessed.origin = item; //log backbone events
                            return fnPreprocessed;
                        }(item, key));
                    }
                });

            },
            timeoutClick: function(callback, evt) {
                var _this = this; //this -> view context
                if (_this._clicked) {
                    //except bind two callback on one target, $.on('key',callback1).on('key',callbck2)
                    if (_this._last && _this._last == callback) {
                        return;
                    }
                }
                _this._clicked = true;
                _this._last = callback;

                callback.call(this, evt);
                window.setTimeout(function() {
                    _this._clicked = false;
                    _this._last = null;
                }, 300);
            },
            /**
             *@description: create unique(low possibility of conflict) guid
             *@author: from http://www.broofa.com/Tools/Math.uuid.js
             */
            createGuid: function() {
                var ret = cUtilCommon.createGuid();
                CacheData.setGuid(ret);
                return ret;
                /*var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

                var chars = CHARS, uuid = [], i;
                // rfc4122, version 4 form
                var r;

                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                // Fill in random data.  At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }

                var ret = uuid.join('');
                CacheData.setGuid(ret);

                return ret;*/
            },
            /**
             *@description: get guid from store or create a new one
             *@return guid from store if exist, otherwise create a new one
             *@author: wxm
             */
            getGuid: function() {
                var ret = CacheData.getGuid('GUID');
                if (ret) {
                    return ret;
                } else {
                    return this.createGuid();
                }
            },
            /**
             *@description: format money, if >= 1000w, return 1000万
             *@return formated text
             *@author: wxm
             */
            fmtMoney: function(val) {
                var t = val.match(/^(\d*)/)[0];
                if (t.length >= 8) {
                    return '>\<small\>&yen;\<\/small\>1000万';
                } else {
                    return '\<small\>&yen;\<\/small\>' + val;
                }
            },
            _add0: function(m) {
                return m < 10 ? '0' + m : m;
            },
            /**
             *@description: return like 201504301024
             *@return formated text
             *@author: wxm
             */
            getDateNowFmt: function() {
                var time = new Date();

                var y = time.getFullYear();
                var m = time.getMonth() + 1;
                var d = time.getDate();
                var h = time.getHours();
                var mm = time.getMinutes();
                return y + this._add0(m) + this._add0(d) + this._add0(h) + this._add0(mm);
            },
            getRetpage: function() {
                var ret = "";
                if (Config.IS_HYBRID) {
                    if (location.href.match(/retpage%3D/i)) {
                        ret = location.href.replace(/.*retpage%3D([\w%]*).*/i, '$1');
                    }
                } else {
                    if (location.href.match(/retpage=/i)) {
                        ret = location.href.replace(/.*retpage=([\w%]*).*/i, '$1');
                    }
                }
                return ret;
            },
            getRetViewname: function(retpage) {
                var i = retpage.indexOf('?');
                if (i != -1) {
                    return retpage.substring(0, i);
                }
                return retpage;
            },
            isValidChinaIDCard: function(sChinaIdCardNo) {
                if (sChinaIdCardNo !== undefined) {
                    return IdCard.isValidChinaIDCard(sChinaIdCardNo);
                }
                return false;
            },
            formatChinaIDCard: function(sChinaIdCardNo) {
                if (sChinaIdCardNo !== undefined) {
                    return sChinaIdCardNo.replace(/\s/g, '').replace('x', 'X');
                }
            },
            formatIDCard: function(sIdCardNo) {
                if (sIdCardNo !== undefined) {
                    return sIdCardNo.replace(/\s/g, '');
                }
            },
            /**
             * @description format mobile
             * @example
             * input '321253156623156614' return '3****************4'
             */
            getIDcard: function(num) {
                return num.split("").map(function(el, i) {
                    return (i !== 0 && (i !== (num.length - 1))) ? "*" : el;
                }).join("");
            },
            addEvent: function(el, type, fn, capture) {
                if (document.addEventListener) {
                    el.addEventListener(type, fn, capture);
                } else if (window.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
            removeEvent: function(el, type, fn, capture) {
                if (document.removeEventListener) {
                    el.removeEventListener(type, fn, capture);
                } else if (window.detachEvent) {
                    el.detachEvent(type, fn);
                }
            },
            stopPropagation: function(evt) {
                var e = (evt) ? evt : window.event;
                if (window.event) {
                    e.cancelBubble = true;
                } else {
                    e.stopPropagation();
                }
            },
            preventDefault: function(evt) {
                var e = (evt) ? evt : window.event;
                if (window.event) {
                    e.returnValue = false;
                } else {
                    e.preventDefault();
                }
            },
            /**
             * @description dynamically create new style
             * @param cssString: like '.rztips{ background: url(./res/res/img/rzbg.png) no-repeat; background-size:260px 310px; width:260px; height:310px; position:relative;}'
             * @example
             * input '321253156623156614' return '3****************4'
             */
            createCss: function(cssString) {
                var s = document.createElement('style');
                s.setAttribute('type', 'text/css');
                s.innerHTML = cssString; //
                document.getElementsByTagName("head")[0].appendChild(s);
            },
            onWalletInit: function() {
                if (typeof this._entryView === 'undefined') {
                    // var urlTokenStore = WalletStore.UrlTokenStore.getInstance();
                    var entryNow = this.getViewName(); //防止当前页面刷新

                    // //TODO refresh page
                    // if (entryNow == 'index' || entryNow == 'transacthistory' ||
                    //     entryNow == 'useraccount' || entryNow == 'securitycenter' ||
                    //     entryNow == 'accountverified' || entryNow == 'insrcactivity') {
                    //     var tk = this.getTokenFromUrl(); //token/from
                    //     if (tk) {
                    //         tk.entryLast = entryNow;
                    //         urlTokenStore.set(tk);
                    //     } else {
                    //         if (this.getQuery(location.href, 'from_native_page')) { //TODO
                    //             tk = {};
                    //             tk.entryLast = entryNow;
                    //             urlTokenStore.set(tk);
                    //         }
                    //     }
                    // }
                    this._entryView = entryNow;
                }
            },
            // setTokenInfoStore: function(tk) {
            //     var urlTokenStore = WalletStore.UrlTokenStore.getInstance();
            //     return urlTokenStore.set(tk);
            // },
            // getTokenInfoStore: function() {
            //     var urlTokenStore = WalletStore.UrlTokenStore.getInstance();
            //     return urlTokenStore.get();
            // },
            // clearTokenInfoStore: function() {
            //     var urlTokenStore = WalletStore.UrlTokenStore.getInstance();
            //     return urlTokenStore.set({});
            // },
            getEntryView: function() {
                return this._entryView;
            },
            //setRetPage: function(viewName, retPage) { //TODO temp, for accontverified!
            //    var retPageStore = WalletStore.RetPageStore.getInstance();
            //    if (!retPage) {
            //        retPage = retPageStore.getAttr(viewName);
            //    }
            //    retPageStore.setAttr(viewName, retPage);
            //},
            //getRetPage: function(viewName) {
            //    var retPageStore = WalletStore.RetPageStore.getInstance();
            //    return retPageStore.getAttr(viewName);
            //},
            //clearRetPage: function(viewName) {
            //    var retPageStore = WalletStore.RetPageStore.getInstance();
            //    return retPageStore.setAttr(viewName, null);
            //},
            /**
             * @description check if device is rooted(android) or jailbreak(ios)
             * @param callback: callback api
             * callback param:
             *  1: rooted
             *  0: not rooted
             *  -1: unknow in H5
             */
            checkRoot: function(callback) {
                if (Config.IS_INAPP) {
                    var cHybridShell = require('cHybridShell');
                    new cHybridShell.Fn('init_member_H5_info', function(data) {
                        console.log(data.isJailBreak);
                        callback(data.isJailBreak === true ? 1 : 0);
                    }).run();
                } else {
                    callback(-1);
                }
            },
            /**
             * @description check if device is rooted(android) or jailbreak(ios)
             * @return true for rooted
             */
            isRootedDevice: function() {
                try {
                    var deviceInfo = JSON.parse(localStorage.CINFO);
                    return deviceInfo.isJailBreak;
                } catch (err) {
                    return false;
                }
            },
            /**
             * @description due to size limitation, some big size image is not in app. so have this api to get image address
             * @return picture url
             */
            getH5ImgUrl: function(imagename) {
                var ret;
                var path = 'dest/res/res/img/' + imagename;
                if (Config.IS_HYBRID) {
                    ret = Config.DOMAIN_H5_ARR[Config.ENV] + '/webapp/wallet/' + path;

                    //for hybrid test convenience
                    if (Config.ENV === 'test' || Config.ENV === 'uat' || Config.ENV === 'baolei') {
                        ret = ret.replace(/^https/i, 'http');
                    }
                } else {
                    ret = './' + path;
                }
                return ret;
            },
            /**
             * @description insrcactivity weixin share api
             * called in hybrid only
             */
            wxShareInsrcAct: function() {
                var d = Config.DOMAIN_H5_ARR[Config.ENV] + '/webapp/wallet/';
                var wxShare = new WxShare({
                    imgUrl: d + 'dest/res/res/img/wxshare.png',
                    sinaImg: d + 'dest/res/res/img/wbshare.png',
                    title: '万元账户安全险免费抢！',
                    text: '保障你携程账户的资金安全，名额有限，赶紧抢！',
                    linkUrl: d + 'insrcactivity?from=share&now=' + Date.now()
                });
                return wxShare;
            },
            shareHighInsrcAct: function() {
                var d = Config.DOMAIN_H5_ARR[Config.ENV] + '/webapp/wallet/';
                var wxShare = new WxShare({
                    imgUrl: d + 'dest/res/res/img/wxShareH.png',
                    sinaImg: d + 'dest/res/res/img/share.png',
                    title: '携程账户安全险 资金安全无忧',
                    text: '保额50万的账户安全险，让您放心出游，更放心支付！',
                    linkUrl: d + 'insrcstart?from=share&insrctype=2&now=' + Date.now()
                });
                return wxShare;
            },
            getIdCardType: function(isRealName, num) {
                if (isRealName) {
                    var _items = realCertListStore.getAttr('idtypelist');
                } else {
                    var _items = certListStore.getAttr('idtypelist');
                }
                for (var i = 0; i < _items.length; i++) {
                    if (_items[i].idtype == num) {
                        return _items[i].idname;
                    }
                }
                return _items[0].idname;
            },
            formatCtrpUid: function(ctrpUid) {
                var len = ctrpUid.length;
                var numReg = /^\d*$/g;
                if (len >= 14 && len <= 19 && numReg.test(ctrpUid)) {
                    var prefix = ctrpUid.substring(0, 6);
                    var mid = ctrpUid.substring(6, len - 2);
                    var stars = '';
                    for (var i = 0; i < mid.length; i++) {
                        stars += '*';
                    }
                    var suffix = ctrpUid.substring(len - 2, len);
                    return prefix + stars + suffix;
                }
                return ctrpUid;
            },
            /**
             * @description get css object for dynamic manipulation
             * @return css object array
             * @example getCSS('.authentication');
             */
            getCSS: function(selector) {
                var ret = [];
                var css = document.styleSheets;
                var isIE = document.attachEvent ? true : false;
                for (var i = 0; i < css.length; i++) {
                    var rs = !isIE ? css[i].cssRules : css[i].rules;
                    if (rs) {
                        for (var j = 0; j < rs.length; j++) {
                            if (rs[j].selectorText == selector) {
                                ret.push(rs[j]);
                            }
                        }
                    }
                }

                return ret;
            }
        };

        return exports;
    });