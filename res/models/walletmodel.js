/**
 * @module mockmodel
 * @author wxm, lzx, wwg
 * @description wallet ajax model classes
 */

define(['cCoreInherit', 'cUtilCryptBase64', 'Util', 'WalletStore', 'WalletBaseModel', 'Config', 'BalConfig', 'CacheData'],
    function(cBase, cUtilCryptBase64, Util, WalletStore, WalletBaseModel, Config, BalConfig ,CacheData) {

        var M = {};
        var udf;

        var udf2Null = function(data) {
            return data == udf || typeof data == 'undefined' || data == null ? '' : data;
        };

        //transaction detail model
        M.WalletTradeDetailSearch = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Trade/DetailSearch"; //h5
                this.serviceCode = '32000202'; //hybird
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        //transaction history model
        M.WalletTradeListSearch = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Trade/ListSearch";
                this.serviceCode = '32000201';
                this.param = {
                    "ver": '1',
                    "pagesize": 25
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    if (data.tralist) {
                        data.generalizedlist = data.tralist;
                    } else {
                        data.generalizedlist = [];
                    }

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        // OperationType 1.support wallet 2.login password 3.trade password 4.security mobile 5.security email 6.certifeication
        M.WalletAccountCheck = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Account/Check";
                this.serviceCode = '32000103';
                this.param = {
                    "ver": '1',
                    "optype": 1,
                    "accinfo": 'input'
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletUserInfoCheck = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/UserInfo/Check";
                this.serviceCode = '32000505';
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletAccountModify = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Account/Modify";
                this.serviceCode = '32000104';
                this.param = {
                    "ver": 1
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletVerifyCodeSend = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/VerifyCode/Send";
                this.serviceCode = '32000301';
                this.param = {
                    "ver": 1
                };
                this.valFds=['vertype','reqflag'];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletVerifyCodeCheck = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/VerifyCode/Check";
                this.serviceCode = '32000302';
                this.param = {
                    "ver": 1
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletBindedCreditCardListSearch = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/CreditCard/ListSearch";
                this.serviceCode = '32000404';
                this.param ={
                    "paymchid" : Config.PAYMCHIDS.DEFAULT
                };
                this.param = {
                    "ver": 1
                };
                this.valFds=[];
                //cardtype 1~500~999 credit card, 1000+ savings card
                this.dataformat = function(data) {
                    // for fast pay.
                    data.fastPayCard = [];
                    data.fastPayDefectCard = [];
                    data.fastPayDefaultCard = [];
                    //for my bank card
                    data.haveVali = [];
                    data.waitvali = [];

                    if (data.cardlist) {
                        _.each(data.cardlist, function(item) {
                            //item.bankname && (item.bankname = Util.substring(item.bankname.replace(/\s+/g, ''), 20));
                            item.cardIcon = 'bank_' + item.cardtype;
                            if (item.cardtype < 500) {
                                item.fcardtype = 1;
                            } else if (item.cardtype < 1000) {
                                item.fcardtype = 1;
                            } else {
                                item.fcardtype = 2;
                            }
                            item.cardtypeUI = Util.getCardType(item.cardtype);
                            item.banknameShort = Util.fmtBankName(item.bankname);
                            item.authstatusUI = Util.getCardAuth(item.authstatus);

                            if (item.bindstatus == 41) {
                                data.fastPayDefectCard.push(item);
                            } else if (item.bindstatus == 42 || item.bindstatus == 43) {

                                data.fastPayCard.push(item);
                                if (item.bindstatus == 43) {
                                    data.fastPayDefaultCard.push(item);
                                }
                            }

                            if (item.authstatus == 21) {
                                data.waitvali.push(item);
                            } else if (item.authstatus == 22) {
                                data.haveVali.push(item);
                            }
                        })
                    } else {
                        data.cardlist = [];
                    }

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletBindedCreditCardDelete = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/CreditCard/Delete";
                this.serviceCode = '32000405';

                this.param = {
                    "ver": 1
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletAccountSearch = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Account/Search";
                this.serviceCode = '32000101';

                this.param = {
                    "ver": 1
                };
                this.valFds=[];

                this.getCacheData = function() {
                    return WalletStore.UserAccountStore.getInstance().get();
                }

                this.dataformat = function(data) {
                    var map = [
                        ['uid', 'accstatus', 'cretime', 'acttime', 'cur', 'total', 'avail', 'unavail', 'payonly', 'frozen', 'withdraw', 'basicbal'],
                        ['rtcash'],
                        ['lipincard'],
                        ['csmRecNum']
                    ];

                    return this.storeValidData(map, data, WalletStore.UserAccountStore.getInstance());
                };
                this.hasAccountData = function() {
                        return WalletStore.UserAccountStore.getInstance().hasAccountData();
                    },
                    this.hasCtripUserData = function() {
                        return WalletStore.UserAccountStore.getInstance().hasCtripUserData();
                    },
                    this.hasLipinCardData = function() {
                        return WalletStore.UserAccountStore.getInstance().hasLipinCardData();
                    },
                    this.hasCsmRecNumData = function() {
                        return WalletStore.UserAccountStore.getInstance().hasCsmRecNumData();
                    }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletUserInfoSearch = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/UserInfo/Search";
                this.serviceCode = '32000501';

                this.param = {
                    "ver": 1,
                    "devid": '' //100: 5.8先填空
                };
                this.valFds=[];
                this.getCacheData = function() {
                    var data = WalletStore.UserInfoStore.getInstance().get();
                    if (data && data.username) {
                        data.username = cUtilCryptBase64.Base64.decode(data.username);
                    }
                    return data;
                }

                this.dataformat = function(data) {
                    data.haspwd = udf2Null(data.haspwd);
                    data.email = udf2Null(data.secemail);
                    data.mobile = udf2Null(data.secmobile);

                    //wallet version 5.7 requirement.
                    //remove it in version 5.8
                    if (data.seclevel == 2) {
                        data.seclevel = 3;
                    }

                    var map = [
                        ['uid', 'username', 'usertype', 'userstatus', 'cretime', 'acttime', 'cretype', 'authstatus', 'idtype', 'idno', 'authtime', 'himg', 'aliasmobile', 'aliasemail'],
                        ['haspwd', 'secmobile', 'secemail', 'mcert', 'seclevel', 'tpstatus'],
                        ['cardcnt']
                    ];
                    //encrypte username in store
                    if (data.username) {
                        data.username = cUtilCryptBase64.Base64.encode(data.username);
                    }
                    this.storeValidData(map, data, WalletStore.UserInfoStore.getInstance());
                    if (data.username) {
                        data.username = cUtilCryptBase64.Base64.decode(data.username);
                    }

                    return data;
                };
                this.hasUserData = function() {
                        return WalletStore.UserInfoStore.getInstance().hasUserData();
                    },
                    this.hasPwdData = function() {
                        return WalletStore.UserInfoStore.getInstance().hasPwdData();
                    },
                    this.hasUsedCardData = function() {
                        return WalletStore.UserInfoStore.getInstance().hasUsedCardData();
                    }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletWithdrawListSearch = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Withdraw/ListSearch";
                this.serviceCode = '32000704';

                this.param = {
                    "ver": 1,
                    "pagesize": 25
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    if (data.wdlist) {
                        data.generalizedlist = data.wdlist;
                    } else {
                        data.generalizedlist = [];
                    }
                    _.each(data.generalizedlist, function(item) {
                        item.restypeUI = Util.getWithdrawType(item.restype);
                        item.cardtypeUI = Util.getCardType(item.cardtype);
                        item.banknameShort = Util.fmtBankName(item.bankname);
                        item.smdateShort = item.smdate.replace(/(.*) .*/g, '$1');
                    });

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletWithdrawDetailSearch = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Withdraw/DetailSearch";
                this.serviceCode = '32000705';

                this.param = {
                    "ver": 1
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    data.restypeUI = Util.getWithdrawType(data.restype);
                    //_.each(data.detaillist, function (item) {
                    //    item.restypeUI = Util.getWithdrawType(item.restype);
                    //})

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletAccountListRecharge = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Account/ListRecharge";
                this.serviceCode = '32000110';

                this.param = {
                    "ver": 1,
                    "pagesize": 25
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    if (data.rclist) {
                        data.generalizedlist = data.rclist;
                    } else {
                        data.generalizedlist = [];
                    }
                    _.each(data.generalizedlist, function(item) {
                        item.restypeUI = Util.getRechargeType(item.restype);
                        item.srcnameShort = Util.fmtBankName(item.srcname);
                        item.smdateShort = item.smdate.replace(/(.*) .*/g, '$1');
                    });

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletPublicQueryText = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/Public/QueryText";
                this.serviceCode = '32000601';

                this.param = {
                    "ver": 1
                };
                this.valFds=[];

                this.dataformat = function(data){
                    if(this.param.reqtype === 15){
                        CacheData.setRegMobile(data.text);
                    }
                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WithdrawLimit = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Account/WithdrawLimit';
                this.serviceCode = '32000105';
                this.param = {
                    "ver": 1
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    var store = WalletStore.WithdrawLimit.getInstance();
                    store.setObject(data);
                    return data;
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.CheckBin = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/CreditCard/CheckBin';
                this.serviceCode = '32000403';
                this.param = {
                    "ver": 1,
                    "paymchid" : Config.PAYMCHIDS.DEFAULT
                };
                this.valFds=[];

                function formatCard(card) {
                    var item = card;
                    item.cardIcon = 'bank_' + card.cardtype;
                    item.cardtypeUI = Util.getCardType(card.cardtype);
                    item.banknameShort = Util.fmtBankName(card.bankname);
                    return item;
                }

                this.dataformat = function(data) {
                    data.creditCard = [];
                    data.unionCreditCard = [];
                    data.unionSavingCard = [];
                    if (data && data.typelist && data.typelist.length > 0) {
                        for (var i = 0; i < data.typelist.length; i++) {
                            var item = formatCard(data.typelist[i]);
                            if (item.cardtype < 500) {
                                //1~499直连信用卡
                                data.creditCard.push(item);
                            } else if (item.cardtype < 1000) {
                                //500~999银联信用卡
                                data.unionCreditCard.push(item);
                            } else {
                                //1000及以上银联储蓄卡
                                data.unionSavingCard.push(item);
                            }
                        }
                    } else {
                        data.typelist = [];
                    }
                    if (data.unionSavingCard.length > 0) {
                        var checkStore = WalletStore.CheckBin.getInstance();
                        checkStore.setObject(data.unionSavingCard[0]);
                    }

                    //存储卡bin 所有信息.
                    var cardBinStore = WalletStore.CardBinStore.getInstance();
                    cardBinStore.setObject(data);

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });


        M.WithDraw = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Account/Withdraw';
                this.serviceCode = '32000106';
                this.param = {
                    "ver": 1
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.ContinueWithDraw = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Account/ContinueWithdraw';
                this.serviceCode = '32000108';
                this.param = {
                    "ver": 1
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.WalletAccountRecharge = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Account/Recharge';
                this.serviceCode = '32000109';
                this.param = {
                    "ver": 1
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:返现金额和记录
         */
        M.ReCashListModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Recash/ListSearch';
                this.serviceCode = '32009501';
                this.param = {
                    "pageid": 1,
                    "reqbmp": 4
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    var map = [
                        ['refundlist'],
                        ['payoutlist'],
                        ['cashamt']
                    ];

                    return this.storeValidData(map, data, WalletStore.ReCashListStore.getInstance());
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:获取兑换方式
         */
        M.ExchangeTicketMethodModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Recash/ListWithdrawWay';
                this.serviceCode = '32009503';
                this.param = {};
                this.valFds=[];
                this.result = WalletStore.ReCashWayListStore.getInstance();
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:提现储蓄卡或兑换礼品卡
         */
        M.ExgOrGainModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Recash/SubmitOrder';
                this.serviceCode = '32009504';
                this.param = {
                    "waytype": "",
                    "amount": "",
                    "bankid": "",
                    "bankname": "",
                    "cardno": "",
                    "idtype": "",
                    "idno": "",
                    "holder": "",
                    "prvid": "",
                    "prvname": "",
                    "cityid": "",
                    "cityname": "",
                    "tktype": "",
                    "vercode": "",
                    "paypwd": "",
                    "riskid": ""
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:风控发送验证码
         */
        M.GetValidateNumModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Recash/SendVerifyCode';
                this.serviceCode = '32009505';
                this.param = {
                    "ftype": "",
                    "riskid": "",
                    "waytype": "",
                    "amount": ""
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:设置兑换方式
         */
        M.SetExgMethodModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Recash/SetExchangeMode';
                this.serviceCode = '32009506';
                this.param = {
                    "exchgtype": ""
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:获取银行列表
         */
        M.BankListModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.protocol = 'https';
                this.serviceCode = '32009507';
                this.method = 'POST';
                this.param = {
                    datatype: 10
                };
                this.url = '/Recash/ListBank';
                this.valFds=[];
                this.result = WalletStore.BankListStore.getInstance();
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:获取省份列表
         */
        M.PostPrivinceModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = '/Recash/ListCity';
                this.serviceCode = '32009508';
                this.param = {
                    "dataver": 0,
                    "datatype": 4,
                    "parentkey": 0
                };
                this.valFds=[];
                this.result = WalletStore.CityListStore.getInstance();
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:xzh
         *@desc:获取城市列表
         */
        M.PostCityModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.protocol = "https";
                this.param = {
                    datatype: "4",
                    parentkey: "0"
                };
                this.serviceCode = '32009508';
                this.url = "/Recash/ListCity";
                this.valFds=[];
                this.result = WalletStore.CityListStore.getInstance();
            },
            initialize: function($super, options) {
                $super(options);
            },
            paraData: function(data) {
                var districts = data.districts || [];
                //省数据
                var province = $.grep(districts, function(n, i) {
                    return n.parentKey == 0;
                });
                for (var pIdx = 0, ln = province.length; pIdx < ln; pIdx++) {
                    var pKey = province[pIdx].treeKey;
                    province[pIdx].citys = $.grep(districts, function(n, i) {
                        return n.parentKey == pKey;
                    });
                    var citys = province[pIdx].citys;
                    for (var cIdx = 0, cln = citys.length; cIdx < cln; cIdx++) {
                        var cKey = citys[cIdx].treeKey;
                        citys[cIdx].contries = $.grep(districts, function(n, i) {
                            return n.parentKey == cKey;
                        });
                    }
                }
                return province;
            }
        });
        /**
         *@auth:xzh
         *@desc:广告
         */
        M.BalanceAdsModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.isPipeModel = false;
                this.method = 'POST';
                this.protocol = "http";
                this.url = '/soa2/10245/GetGlobalADList.json';
                this.param = {
                    "ChannelID": "0",
                    "SystemCode": "12",
                    "GlobalBusinessInfo": {
                        "BizType": "40",
                        "PageCode": "8"
                    },
                    "DeviceInfo": {
                        "ScreenWidth": "640",
                        "ScreenHeight": "1136",
                        "ScreenPxDensity": "0",
                        "DeviceOSVersion": "7.1"
                    }
                };
                this.valFds=[];
                this.isUserData = true;
                this.buildurl = function() {
                    var baseurl = BalConfig.DOMAINARR_Ads[BalConfig.ENV];
                    return (this.protocol || "http") + "://" + baseurl["domain"] + "/" + baseurl["path"] + (typeof this.url === 'function' ? this.url() : this.url);
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        //刮刮卡活动
        M.ExgScratchCardModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.isPipeModel = false;
                this.url = '/soa2/10116/GetCampaignEntry.json';
                this.protocol = "http";
                this.method = 'POST';
                this.param = {
                    "AppType": "1",
                    "UID": ""
                };
                this.valFds=[];
                this.buildurl = function() {
                    var baseurl = BalConfig.DOMAINARR[BalConfig.ENV];
                    return (this.protocol || "http") + "://" + baseurl["domain"] + "/" + baseurl["path"] + (typeof this.url === 'function' ? this.url() : this.url);
                };
                this.isUserData = true;
                this.result = WalletStore.ScratchCardStore.getInstance();
                this.dataformat = function(data) {
                    //Fix bug of M10ZH-1684
                    //http://m.ctrip.com/market/activity/lottery/?from=%252Fwebapp%252Fifinance%252Fbalance%252Findex.html%2523useraccount%253Fcash
                    //http://m.ctrip.com/market/activity/lottery/?from=%252Fwebapp%252Fwallet%252Findex.html%2523useraccount
                    var originHybridUrlWithParam = data.HybridUrl;
                    var urlParams = originHybridUrlWithParam.split('?');
                    var fixedHybridUrl = urlParams[0];
                    var originHybridParam = urlParams[1];
                    if(originHybridParam && originHybridParam.indexOf('ifinance') !== -1){
                        var fixedHybridParam = '?from=%252Fwebapp%252Fwallet%252Findex.html%2523useraccount';
                        data.HybridUrl = fixedHybridUrl + fixedHybridParam;
                    }
                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        /*
         *@auth:zh.xu
         *@desc:获取充值面额列表
         */
        M.PhoneRechargeModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.protocol = 'https';
                this.serviceCode = '32009509';
                this.method = 'POST';
                this.url = '/Recash/ListMobileRecharge';
                this.param = {};
                this.valFds=[];
                this.result = WalletStore.PhoneRechargeStore.getInstance();
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.QuerySource = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Withdraw/QuerySource';
                this.serviceCode = '32000702';
                this.isUserData = true;
                this.result = WalletStore.QuerySource.getInstance();
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];

                this.dataformat = function(data) {

                    var store = WalletStore.QuerySource.getInstance();
                    store.setObject(data);

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.SubmitFixed = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Withdraw/SubmitFixed';
                this.serviceCode = '32000703';
                this.valFds=[];
                this.result = WalletStore.SubmitFixed.getInstance();

                this.dataformat = function(data) {

                    var store = WalletStore.SubmitFixed.getInstance();
                    store.setObject(data);

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.TouchPayQuery = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/TouchPay/Query';
                this.serviceCode = '32000801';
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.TouchPaySet = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/TouchPay/Set';
                this.serviceCode = '32000802';
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.TouchPayVerify = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/TouchPay/Verify';
                this.serviceCode = '32000803';
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.UserGetLoginSession = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/UserInfo/GetLoginSession';
                this.serviceCode = '32000502';
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];
                this.dataformat = function(data) {

                    var store = WalletStore.GetLoginSession.getInstance();
                    store.setObject(data);

                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.CreditCardSetDefault = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/CreditCard/SetDefault';
                this.serviceCode = '32000408';
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.UserInfoQueryNotice = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/UserInfo/QueryNotice';
                this.serviceCode = '32000503';
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.UserInfoClearNotice = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/UserInfo/ClearNotice';
                this.serviceCode = '32000504';
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.CreditCardBind = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/CreditCard/Bind';
                this.serviceCode = '32000406';
                this.param = {
                    "paymchid" : Config.PAYMCHIDS.DEFAULT
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.CreditCardSave = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/CreditCard/Save';
                this.serviceCode = '32000407';
                this.param = {
                    "paymchid" : Config.PAYMCHIDS.DEFAULT
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.QueryCertList = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Public/QueryListInfo';
                this.serviceCode = '32000602';
                this.param = {
                    "paymchid" : Config.PAYMCHIDS.DEFAULT
                };
                this.valFds=[];
                this.dataformat = function(data) {

                    if (data.rc == 0 && this.param.src != 1) {
                        var store = WalletStore.CertListStore.getInstance();
                        store.setObject(data);
                    } else if (data.rc == 0 && this.param.src == 1) {
                        var store = WalletStore.RealCertListStore.getInstance();
                        store.setObject(data);
                    }
                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.PublicCheck = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Public/Check';
                this.serviceCode = '32000603';
                this.param = {
                    "paymchid" : Config.PAYMCHIDS.DEFAULT
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.PublicQueryListInfo = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Public/QueryListInfo';
                this.serviceCode = '32000602';
                this.param = {
                    "paymchid" : Config.PAYMCHIDS.DEFAULT
                };
                this.valFds=[];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });
        M.ConsumeRecordsModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Account/ListConsume';
                this.serviceCode = '32000111';
                this.param = {
                    'ver': '1',
                    'pagesize': 25
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    if (data.csmlist) {
                        data.generalizedlist = data.csmlist;
                    } else {
                        data.generalizedlist = []
                    }
                    return data;
                }
            },

            initialize: function($super, options) {
                $super(options)
            }
        });
        M.AuthVerifyCheck = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.method = 'POST';
                this.url = "/UserInfo/AuthVerify";
                this.serviceCode = '32000506';
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];
                this.result = WalletStore.AuthVerifyStore.getInstance();
            },
            initialize: function($super, options) {
                $super(options);
            }
        });
        M.GlobalAdSearchModel = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.isPipeModel = false;
                this.protocol = 'https';
                this.url = '/soa2/10245/GetGlobalADListV2.json';
                this.method = 'POST';
                this.param = {};
                this.ajaxOnly = false; //can use cache store instead of webcall everytime
                this.valFds=[];
                this.result = WalletStore.AdStore.getInstance();
                this.buildurl = function() {
                    var baseurl = {
                        "domain": "sec-m.ctrip.com",
                        "path": "restapi"
                    };
                    if(Config.ENV === 'test' || Config.ENV === 'uat') {
                        baseurl["domain"] = 'm.fat.ctripqa.com';  //m.uat.ctripqa.com
                    }
                    return (this.protocol || "http") + "://" + baseurl["domain"] + "/" + baseurl["path"] + (typeof this.url === 'function' ? this.url() : this.url);
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });
        M.UserInfoList = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/UserInfo/QueryList';
                this.serviceCode = '32000507';
                this.param = {
                    "ver": '1'
                };
                this.valFds=[];
                this.dataformat = function(data) {
                    var sortoutArrKeys = [];
                    data.sortoutArr = [];
                    var store = WalletStore.UserInfoList.getInstance();
                    if (data.rc == 0&&data.uerinfolist.length>0) {
                        _.each(data.uerinfolist, function(num) {
                            if (num.cname) {
                                num.cname = cUtilCryptBase64.Base64.encode(num.cname)
                            }
                            return data.uerinfolist
                        })
                        data.uerinfolist.map(function(item, index) {
                            sortoutArrKeys.indexOf(item.idtype) == -1 ? (function() {
                                sortoutArrKeys.push(item.idtype);
                                Object.defineProperty(data.sortoutArr, item.idtype, {
                                    value: []
                                });
                            }()) : false;
                            data.sortoutArr[item.idtype].push(item);
                        });
                        store.setAttr('list', data.sortoutArr)
                    }
                    return data;
                }
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.InsrcOrderList = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Insurance/OrderList';
                this.serviceCode = '32000151';
                this.param = {
                    "ver": 1
                };
                this.valFds=['reqtype'];
            },
            initialize: function($super, options) {
                $super(options);
            }
        });

        M.InsrcOrderDetail = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Insurance/OrderDetail';
                this.serviceCode = '32000152';
                this.param = {
                    "ver": 1
                };
                this.valFds=['orderid'];
                this.dataformat = function(data) {
                    var store = WalletStore.InsrcDetailStore.getInstance();

                    if(data.complogo){
                        data.complogo = Util.getH5ImgUrl('insrc/'+data.complogo+'.png');
                    }
                    store.setObject(data);
                    return data;
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });
        M.InsrcSubmitOrder = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Insurance/SubmitOrder';
                this.serviceCode = '32000154';
                this.param = {
                    "ver": 1
                };
                this.valFds=['insrctype','insrcmobile'];
                //this.result = WalletStore.InsrcSubmitStore.getInstance();
                this.dataformat = function(data) {
                    var store = WalletStore.InsrcSubmitStore.getInstance();
                    if(data.complogo){
                        data.complogo = Util.getH5ImgUrl('insrc/'+data.complogo+'.png');
                    }
                    store.setObject(data);
                    return data;
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });
        M.InsrcGetPrdInfo = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Insurance/GetPrdInfo';
                this.serviceCode = '32000155';
                this.param = {
                    "ver": 1
                };
                this.valFds=['insrctype'];
                this.dataformat = function(data) {
                    if(data.complogo){
                        data.complogo = Util.getH5ImgUrl('insrc/'+data.complogo+'.png');
                    }
                    return data;
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });
        M.InsrcCheck = new cBase.Class(WalletBaseModel, {
            __propertys__: function() {
                this.url = '/Insurance/Check';
                this.serviceCode = '32000153';
                this.param = {
                    "ver": 1
                };
                this.valFds=['insrctype'];
                // this.result = WalletStore.InsrcCheckStore.getInstance();
                this.dataformat = function(data) {
                    var store = WalletStore.InsrcCheckStore.getInstance();
                    store.setAttr('insrctype', this.param.insrctype);
                    if(data.complogo){
                        data.complogo = Util.getH5ImgUrl('insrc/'+data.complogo+'.png');
                    }
                    store.setObject(data);
                    return data;
                };
            },
            initialize: function($super, options) {
                $super(options);
            }
        });
        return M;
    });
