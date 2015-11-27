/**
 * @module mockdata
 * @author wxm, lzx, wwg
 * @description for debug purpose, this module contains all and only ajax service mock data
 */


window.walletMockData = {
    "WalletAccountSearch": function(reqparams) {
        var reqbmp = reqparams.reqbmp;
        var resbmp;
        if(reqbmp == 0){
            resbmp = 15;
        }else{
            resbmp = reqbmp;
        }
        var obj = {
            rc: 0,
            resbmp: resbmp,
            uid: 'Mxxx888',
            accstatus: 1, //0：创建；1：已激活；2：已冻结；9：已注销
            total: '333.33',
            avail: '33444445555.44',
            unavail: '1.00',
            lipincard: '222.22',
            rtcash: '150.00',
            basicbal: '222.88', //5.10
            payonly: '100.00', //5.10
            uarefund: '4.55', //5.10
            csmRecNum: '1' //6.5
        };
        return obj;
    },
    "WalletUserInfoSearch": function() {

        var obj = {
            "head": {
                "auth": "7C49064056CB26FEFC0D41E6F434957E5DE93802133E0DD3E1F405000F401ED9",
                "errcode": 0
            },
            rc: 0,
            resbmp: 7,
            uid: 'Mxxx888',
            ctrpuid: '1111112222222',
            username: 'aaa',
            cardcnt: 12,
            seclevel: 3,
            aliasmobile:'18999999999',//
            secmobile: '15909090909', //
            secemail: 'dsa@ddd',
            userstatus: 1, //0：创建；1：已激活；2：已冻结；9：已注销
            authstatus: 0, //0：未认证；1：已认证；2:认证失败 3:认证无结果 100:认证审核中
            haspwd: 1, //1:有支付密码，否则无
            tpstatus: 0,
            idtype: 2,
            idno: '310113664949914X'
        };

        return obj;
    },
    "WalletTradeDetailSearch": function() {
        return {
            //rc: 1200001,
            rc: 0,
            rmsg: "错误信息描述",
            rfno: "09887777822",
            tratype: 1001,
            traamt: "600.00",
            tradate: "YYYY.MM.DD hh24:mm:ss",
            cash: '6000.00',
            trasrc: '0',
            traname: '交易付款',
            itemname: '3月29日上海到北京的机票',
            srcname: '中国银行'
        }
    },
    "WalletTradeListSearch": function() {
        return {
            rc: 0,
            rmsg: "错误信息描述",
            tralist: [{
                rfno: "09887777822",
                tratype: 1001,
                traamt: '555.00',
                tradate: 'YYYY.MM.DD',
                cash: '4000.00',
                traname: '退款',
                flows: 1
            }, {
                rfno: "09887777823",
                tratype: 1002,
                traamt: '556.00',
                tradate: 'YYYY.MM.DD',
                cash: '4000.00',
                traname: '付款',
                flows: 2
            }, {
                rfno: "09887777824",
                tratype: 2001,
                traamt: '556.00',
                tradate: 'YYYY.MM.DD',
                cash: '4000.00',
                traname: '提现',
                flows: 2
            }]
        }
    },
    "WalletAccountCheck": function(reqparams) {
        return {
            rc: 0, //1403002
            rmsg: "错误信息描述",
            desc: "1"
        }
    },
    "WalletUserInfoCheck": function() {
        return {
            rc: 0,
            rmsg: "错误信息描述",
            rflag: "2|2|1|1|1|1|2|2|2|1|0" //1	是否支持钱包					0:获取失败;1不支持；2:支持
                //13	用户是否在白名单					0:获取失败;1不在白名单；2:在白名单
                //12用户是否冻结					0:获取失败;1非冻结；2:已冻结
                //21现金余额是否需要强制实名					0:获取失败;1不强制；2:强制
                //22礼品卡是否需要强制实名					0:获取失败;1不强制；2:强制
                //23返现是否需要强制实名					0:获取失败;1不强制；2:强制
                //24是否非强制实名提醒					0:获取失败;1不提醒；2:提醒
                //25独立实名认证开关					0:获取失败;1关闭；2:打开
                //26  是否提示账号险活动                   0:获取失败;1不提示；2:提示
                //28  送保险活动开关                 0:获取失败;1无；2:有
                //29  用户实名状态                 0：未认证；1：已认证；2:认证失败 3:认证无结果 100:认证审核中
        }
    },
    "WalletAccountModify": function() {
        return {
            rc: 0
        }
    },
    "WalletVerifyCodeSend": function(reqparams) {
        //console.log('SendCode params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0
        }
    },
    "WalletVerifyCodeCheck": function(reqparams) {
        //console.log('CheckCode params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0,
            rmsg: '验证码错误，请重新输入！'
        }
    },
    "WalletBindedCreditCardListSearch": function(reqparams) {
        //console.log('CreditCardListSearch params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0,
            first: 0,
            usedcardcount: 2,
            cardlist: [{
                cardid: '2',
                cardtype: 561,
                cardno: '231**77',
                bankname: 'XX银行银行银行银行银行银行',
                authstatus: 22,
                bindstatus: 41,
                cardholder: '大款周',
                mobile: '13877777',
                infoid: 101
            }]
        }
    },
    "WalletBindedCreditCardDelete": function() {
        return {
            rc: 0
        }
    },
    "WalletWithdrawListSearch": function() {
        return {
            rc: 0,
            rmsg: "错误信息描述",
            wdlist: [{
                rfno: "09887777822",
                restype: 1,
                amt: '111.00',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                cardtype: 300,
                cardno: '34****22',
                wdtype: 1,
                bankname: '啊啊银行',
                cardname: '储蓄卡'
            }, {
                rfno: "09887777823",
                restype: 2,
                amt: '222.00',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                cardtype: 800,
                cardno: '12****22',
                wdtype: 1,
                bankname: '中国银行',
                cardname: '储蓄卡'
            }, {
                rfno: "09887777824",
                restype: 3,
                amt: '333.00',
                rmsg: '您的银行卡暂不支持，请更换银行卡重试',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                cardtype: 1112,
                cardno: '88****22',
                wdtype: 1,
                bankname: '阿萨德银行',
                cardname: '储蓄卡'
            }, {
                rfno: "09887777825",
                restype: 4,
                amt: '555.00',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                cardtype: 1112,
                cardno: '88****22',
                wdtype: 2,
                bankname: '退回原付款账户',
                cardname: ''
            }]
        }
    },
    "WalletWithdrawDetailSearch": function() {
        return {
            rc: 0,
            rmsg: "错误信息描述",
            rfno: "787878",
            restype: 4,
            amt: '333.33',
            smdate: 'YYYY.MM.DD hh24:mi:ss',
            detaillist: [{
                bankname: '工商银行',
                cardtype: '信用卡',
                cardno: '1122 33****44 ',
                srcamt: '1002.01',
                recvtext: '预计3个工作日',
                restype: 1,
                cardname: '储蓄卡'
            }, {
                bankname: '工商银行',
                cardtype: '储蓄卡',
                cardno: '1122 33****44 ',
                srcamt: '1002.01',
                recvtext: '预计3个工作日',
                restype: 1,
                cardname: '信用卡'
            }]
        }
    },
    "WalletAccountListRecharge": function() {
        return {
            rc: 0,
            rmsg: "错误信息描述",
            rclist: [{
                rfno: "09887777822",
                restype: 1,
                amt: '555.00',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                srcname: '啊啊银行'
            }, {
                rfno: "09887777823",
                restype: 2,
                amt: '555.00',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                srcname: '中国银行'
            }, {
                rfno: "09887777824",
                restype: 3,
                amt: '555.00',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                srcname: '阿萨德发银行银行银行银行'
            }, {
                rfno: "09887777825",
                restype: 8,
                amt: '555.00',
                smdate: 'YYYY.MM.DD hh24:mi:ss',
                findate: 'YYYY.MM.DD hh24:mi:ss',
                srcname: '阿萨德发银行银行银行银行'
            }]
        }
    },
    "WalletPublicQueryText": function() {
        return {
            rc: 0,
            rmsg: "rmsg",
            text: '^1(3|4|5|7|8)\\d{9}$'
        }
    },
    "WithdrawLimit": function() {
        var obj = {
            rc: 0,
            rmsg: '',
            overflow: 0,
            totalamt: 50000,
            remamt: 500,
            cardIcon: '',
            itemlist: [{
                limtype: 1,
                remamt: 11
            }]

        };
        return obj;
    },
    "CheckBin": function(reqparams) {
        //console.log('CheckBin params:--------------->');
        //console.log($.param(reqparams));
        var chktype = reqparams.chktype; //1：提现历史卡；//2：常用卡；//4：快捷支付卡；//8：银行通道实名认证
        var savingCard = {
            cardtype: 1112,
            bankname: '啦啦银行',
            paywayid: 10000,
            bindtype: 'xxxx',
            cardholder: '额鹅鹅',
            cardIcon: '',
            idtype: 1,
            cardtypeUI: '储蓄卡',
            id: '10 20XXXX20',
            AuthOptStatus: 1, //0：无实名提示栏位 1：有实名提示栏位(无勾选框)(主要用于强制实名) 2：有实名提示栏位(有勾选框)(可用于实名)
            fieldlist: [{
                "fieldname": "Validity",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "VerifyNo",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "CardHolder",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "IdCardType",
                "fieldvalue": "7",
                "fieldstatus": 0
            }, {
                "fieldname": "IdNumber",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "PhoneNo",
                "fieldvalue": "",
                "fieldstatus": 0
            }]
        };
        var creditCard = {
            cardtype: 561,
            bankname: 'aa银行',
            paywayid: 10000,
            bindtype: 'xxxx',
            cardholder: 'David',
            cardIcon: '',
            idtype: 1,
            cardtypeUI: '智联信用卡',
            id: '10 20XXXX20',
            AuthOptStatus: 2,
            fieldlist: [{
                "fieldname": "Validity",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "VerifyNo",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "CardHolder",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "IdCardType",
                "fieldvalue": "7",
                "fieldstatus": 0
            }, {
                "fieldname": "IdNumber",
                "fieldvalue": "",
                "fieldstatus": 0
            }, {
                "fieldname": "PhoneNo",
                "fieldvalue": "",
                "fieldstatus": 0
            }]
        };

        var obj = {
            rc: 0, //0,1105438，1105437
            rmsg: '错误信息描述',
            typelist: []
        };

        switch (chktype) {
            case 1:
                savingCard.AuthOptStatus = 2;
                obj.typelist.push(savingCard);
                break;
            case 2:
                savingCard.AuthOptStatus = 2;
                obj.typelist.push(savingCard /*,creditCard*/ );
                break;
            case 4:
                creditCard.AuthOptStatus = 0;
                obj.typelist.push(creditCard);
                break;
            case 8:
                savingCard.AuthOptStatus = 1;
                obj.typelist.push(savingCard /*,creditCard*/ );
                break;
            default:
                obj.typelist.push(savingCard, creditCard);
                break;
        }

        return obj;
    },
    "WithDraw": function(reqparams) {
        //console.log('WithDraw params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0
        }
    },
    "ContinueWithDraw": function() {
        return {
            rc: 0
        }
    },

    "WalletAccountRecharge": function() {
        return {
            rc: 0,
            rmsg: 'recharge rmsg...',
            rfno: 'rfnoXXX',
            oid: '1109705',
            reqid: '1014081410000005101'
        };
    },
    "ReCashListModel": function() {
        return {
            "head": {
                "auth": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9",
                "errcode": 0
            },
            "ResponseStatus": {
                "Timestamp": "\/Date(1408527147135+0800)\/",
                "Ack": "Success",
                "Errors": [],
                "Extension": [{
                    "Id": "Auth",
                    "Value": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9"
                }, {
                    "Id": "ServiceCode",
                    "Value": "32009501"
                }]
            },
            "rc": 0,
            "cashamt": "610",
            "count": 3983,
            "refundlist": [{
                "oid": "1",
                "oname": "嘉年华抽奖活动",
                "date": "2014.08.05",
                "amt": "11"
            }, {
                "oid": "1148546531",
                "oname": "PHN",
                "date": "2014.07.30",
                "amt": "20"
            }, {
                "oid": "100001",
                "oname": "DFS（冲绳T广场店）(DFS)",
                "date": "2014.07.17",
                "amt": "18"
            }, {
                "oid": "100001",
                "oname": "陈汉东专用测试(qnmb)",
                "date": "2014.07.10",
                "amt": "986"
            }, {
                "oid": "1",
                "oname": "嘉年华抽奖活动",
                "date": "2014.06.21",
                "amt": "1"
            }, {
                "oid": "120",
                "oname": "订单名称test",
                "date": "2014.06.03",
                "amt": "300000"
            }, {
                "oid": "1142792458",
                "oname": "无线门票5.5_66472_wzq_因为测试需求所以变得超长超过一行有一行水潺潺兮生烟风萧萧兮易水寒大风起兮云飞扬安得猛士兮守四方",
                "date": "2014.06.03",
                "amt": "10"
            }],
            "payoutlist": [{
                "date": "2014.08.20",
                "name": "兑换礼品卡",
                "amt": "1",
                "status": "失败",
                'errcode': '10005',
                'account': '20元，135****097',
                'errmsg': '注：为了您的账户'
            }, {
                "date": "2014.08.20",
                "name": "兑换礼品卡",
                "account": "",
                "amt": "1",
                "status": "失败",
                'errcode': '',
                'errmsg': '',
                'type': '兑换礼品卡'
            }, {
                "date": "2014.08.20",
                "name": "兑换手机话费",
                "amt": "1",
                'account': '20元，135****097',
                "status": "成功"
            }]
        };
    },
    "ExchangeTicketMethodModel": function() {
        return {
            "head": {
                "auth": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9",
                "errcode": 0
            },
            "ResponseStatus": {
                "Timestamp": "\/Date(1408527347926+0800)\/",
                "Ack": "Success",
                "Errors": [],
                "Extension": [{
                    "Id": "Auth",
                    "Value": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9"
                }, {
                    "Id": "ServiceCode",
                    "Value": "32009503"
                }]
            },
            "rc": 0,
            "exchgtype": 0,
            "count": 3,
            "waylist": [{
                "waytype": 2,
                "wayname": "转账到储蓄卡",
                "wayremark": "",
                "minval": "6",
                "maxval": "1000",
                "isvalid": 1
            }, {
                "waytype": 1,
                "wayname": "兑换成礼品卡",
                "wayremark": "任我游：每满100送10；任我行：每满100送5",
                "minval": "0",
                "maxval": "0",
                "isvalid": 1
            }, {
                "waytype": 3,
                "wayname": "兑换成积分",
                "wayremark": "",
                "minval": "0",
                "maxval": "0",
                "isvalid": 1
            }, {
                "waytype": 4,
                "wayname": "转到现金余额",
                "wayremark": "",
                "minval": "0",
                "maxval": "0",
                "isvalid": 1
            }, {
                "waytype": 5,
                "wayname": "转账到储蓄卡",
                "wayremark": "",
                "minval": "0",
                "maxval": "0",
                "isvalid": 1
            }, {
                "waytype": 6,
                "wayname": "兑换手机话费",
                "wayremark": "",
                "minval": "0",
                "maxval": "0",
                "isvalid": 1
            }]
        };
    },
    "ExgOrGainModel": function(reqparams) {
        //console.log('ReCashListModel params:--------------->');
        //console.log($.param(reqparams));
        return {
            "head": {
                "auth": "7C49064056CB26FEFC0D41E6F434957E5DE93802133E0DD3E1F405000F401ED9",
                "errcode": 0
            },
            "rc": 0,
            "riskid": "3124383",
            "rmsg": null
        };
    },
    "GetValidateNumModel": function() {
        return {
            "head": {
                "auth": "7C49064056CB26FEFC0D41E6F434957E5DE93802133E0DD3E1F405000F401ED9",
                "errcode": 0
            },
            "rc": 0,
            "rmsg": ""
        };
    },
    "SetExgMethodModel": function() {
        return {
            "head": {
                "auth": "7C49064056CB26FEFC0D41E6F434957E5DE93802133E0DD3E1F405000F401ED9",
                "errcode": 0
            },
            "rc": 0,
            "rmsg": ""
        };
    },
    "BankListModel": function() {
        return {
            "head": {
                "auth": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9",
                "errcode": 0
            },
            "ResponseStatus": {
                "Timestamp": "/Date(1408527953849+0800)/",
                "Ack": "Success",
                "Errors": [],
                "Extension": [{
                    "Id": "Auth",
                    "Value": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9"
                }, {
                    "Id": "ServiceCode",
                    "Value": "32009507"
                }]
            },
            "rc": 0,
            "banklist": [{
                "cardtype": 0,
                "bankid": 1,
                "bankinit": "Z",
                "shortpy": "zhongguoyinhang",
                "bankkey": 1,
                "bankname": "中国银行"
            }, {
                "cardtype": 0,
                "bankid": 2,
                "bankinit": "G",
                "shortpy": "gongshangyinhang",
                "bankkey": 2,
                "bankname": "工商银行"
            }, {
                "cardtype": 0,
                "bankid": 5,
                "bankinit": "N",
                "shortpy": "nongyeyinhang",
                "bankkey": 3,
                "bankname": "农业银行"
            }]
        };
    },
    "PostPrivinceModel": function() {
        return {
            "head": {
                "auth": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9",
                "errcode": 0
            },
            "ResponseStatus": {
                "Timestamp": "/Date(1408528148796+0800)/",
                "Ack": "Success",
                "Errors": [],
                "Extension": [{
                    "Id": "Auth",
                    "Value": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9"
                }, {
                    "Id": "ServiceCode",
                    "Value": "32009508"
                }]
            },
            "rc": 0,
            "cantonlist": [{
                "treekey": 1000001,
                "parentkey": 0,
                "name": "安徽",
                "prvid": 17,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 1
            }, {
                "treekey": 1000002,
                "parentkey": 0,
                "name": "北京",
                "prvid": 1,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 2
            }, {
                "treekey": 1000003,
                "parentkey": 0,
                "name": "重庆",
                "prvid": 4,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 3
            }, {
                "treekey": 1000004,
                "parentkey": 0,
                "name": "福建",
                "prvid": 19,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 4
            }, {
                "treekey": 1000005,
                "parentkey": 0,
                "name": "甘肃",
                "prvid": 13,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 5
            }, {
                "treekey": 1000006,
                "parentkey": 0,
                "name": "广东",
                "prvid": 23,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 6
            }]
        };
    },
    "PostCityModel": function() {
        return {
            "head": {
                "auth": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9",
                "errcode": 0
            },
            "ResponseStatus": {
                "Timestamp": "/Date(1408528148796+0800)/",
                "Ack": "Success",
                "Errors": [],
                "Extension": [{
                    "Id": "Auth",
                    "Value": "499D912B6349C45F9FDE2B0AEF9D58AC2DC144526F7FAA4D394965FD133B2DA9"
                }, {
                    "Id": "ServiceCode",
                    "Value": "32009508"
                }]
            },
            "rc": 0,
            "cantonlist": [{
                "treekey": 1000001,
                "parentkey": 0,
                "name": "安徽",
                "prvid": 17,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 1
            }, {
                "treekey": 1000002,
                "parentkey": 0,
                "name": "北京",
                "prvid": 1,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 2
            }, {
                "treekey": 1000003,
                "parentkey": 0,
                "name": "重庆",
                "prvid": 4,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 3
            }, {
                "treekey": 1000004,
                "parentkey": 0,
                "name": "福建",
                "prvid": 19,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 4
            }, {
                "treekey": 1000005,
                "parentkey": 0,
                "name": "甘肃",
                "prvid": 13,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 5
            }, {
                "treekey": 1000006,
                "parentkey": 0,
                "name": "广东",
                "prvid": 23,
                "cityid": 0,
                "id": 0,
                "addr": "0",
                "dataver": 1,
                "opr": 1,
                "type": 4,
                "flag": 1,
                "hotflag": 6
            }]
        };
    },
    "BalanceAdsModel": function() {
        return {
            "Ads": [{
                "Index": 1,
                "ADStatus": 1,
                "GlobalBusinessInfo": {
                    "BizType": "40",
                    "PageCode": "8"
                },
                "ADContentLists": {
                    "AdvertisementPosition": 3255,
                    "HasValidAdvertisement": true,
                    "LinkUrl": "http://m.ctrip.com/market/activity/lottery/index.html?from=%252Fwebapp%252Fifinance%252Fbalance%252Findex.html%2523useraccount%253Fcash",
                    "SrcUrl": "http://images3.c-ctrip.com/rk/apph5/b/app_home_ad22_640_100.png",
                    "Width": "640",
                    "Height": "100",
                    "ClickTrackUrl": "http://ztrack.sh.ctriptravel.com/clk/sclk/?a=18325&s=3255&url=http://m.ctrip.com/market/activity/lottery/index.html?from=%252Fwebapp%252Fifinance%252Fbalance%252Findex.html%2523useraccount%253Fcash",
                    "LoadTrackUrl": "http://ztrack.sh.ctriptravel.com/imp/simp/?a=18325&s=3255",
                    "ValidLoadTrackUrl": "http://ztrack.sh.ctriptravel.com/imp/vimp/?a=18325&s=3255"
                }
            }],
            "Result": {
                "ResultCode": 0,
                "ResultMsg": "执行成功"
            },
            "ResponseStatus": {
                "Timestamp": "/Date(1415241513698+0800)/",
                "Ack": "Success",
                "Errors": [],
                "Extension": [{
                    "Id": "CLOGGING_TRACE_ID",
                    "Value": "7254427189108422594"
                }]
            }
        };

    },
    "ExgScratchCardModel": function() {
        return {
            "ResponseStatus": {
                "Timestamp": "/Date(1407838329717+0800)/",
                "Ack": "Success",
                "Errors": [],
                "Version": "1.00",
                "Extension": [{
                    "Id": "CLOGGING_TRACE_ID",
                    "Value": "8677645799589217002"
                }, {
                    "Id": "auth",
                    "Value": "0FB5AA4DF0457D476CD16FC357BCAA42E9097F0FFE66B11C3942B37CCF2F6E69"
                }]
            },
            "ResultCode": 0,
            "Name": "兑换嘉年华刮刮卡",
            "Url": "http://m.ctrip.com/market/activity/lottery/#?from=/webapp/wallet/index.html#useraccount",
            "H5Url": "http://m.ctrip.com/market/activity/lottery/?from=%252Fwebapp%252Fwallet%252Findex.html%2523useraccount",
            "HybridUrl": "http://m.ctrip.com/market/activity/lottery/?from=%252Fwebapp%252Fwallet%252Findex.html%2523useraccount"
        };
    },
    "CustomerCouponListModel": function() {
        return {
            a: b,
            c: d
        }
    },
    "QuerySource": function() {
        return {
            rc: 0,
            srclist: [{
                bankcode: 1,
                bankname: '微信',
                cardtype: '',
                cardname: '',
                cardno: '',
                cur: 1,
                srcamt: '1002.01',
                recvtext: '预计3个工作日'
            }, {
                bankcode: 1,
                bankname: '微信',
                cardtype: '',
                cardname: '',
                cardno: '',
                cur: 1,
                srcamt: '1002.01',
                recvtext: '预计3个工作日'
            }, {
                bankcode: 22222,
                bankname: '工商银行',
                cardtype: '信用卡',
                cardname: '',
                cardno: '222 21****32',
                cur: 1,
                srcamt: '354.11',
                recvtext: '预计3个工作日'
            }, {
                bankcode: 22222,
                bankname: '工商银行',
                cardtype: '信用卡',
                cardname: '',
                cardno: '222 21****32',
                cur: 1,
                srcamt: '354.11',
                recvtext: '预计3个工作日'
            }]
        };
    },
    "SubmitFixed": function() {
        return {
            rc: 0,
            rmsg: "稍后请查询提现记录查看到账情况。",
            fixedlist: [{
                bankcode: 1,
                bankname: '微信',
                cardtype: '',
                cardname: '',
                cardno: '',
                cur: 1,
                srcamt: '1002.01',
                recvtext: '预计3个工作日'
            }, {
                bankcode: 1,
                bankname: '微信',
                cardtype: '',
                cardname: '',
                cardno: '',
                cur: 1,
                srcamt: '1002.01',
                recvtext: '预计3个工作日'
            }, {
                bankcode: 22222,
                bankname: '工商银行',
                cardtype: '信用卡',
                cardname: '',
                cardno: '222 21****32',
                cur: 1,
                srcamt: '354.11',
                recvtext: '预计3个工作日'
            }, {
                bankcode: 22222,
                bankname: '工商银行',
                cardtype: '信用卡',
                cardname: '',
                cardno: '222 21****32',
                cur: 1,
                srcamt: '354.11',
                recvtext: '预计3个工作日'
            }]
        };
    },
    "TouchPaySet": function() {
        return {
            rc: 0,
            pubkey: "aaaaaaaaaaaaaa",
            kguid: "bbbbbbbbbbbbbb",
            dguid: "ccccccccccccccccc"
        };
    },
    "UserGetLoginSession": function() {
        return {
            rc: 1402053,
            rmsg: '系统网络异常，请稍后再试',
            logintype: 'ThirdPart'
        };
    },
    "CreditCardSetDefault": function() {
        return {
            rc: 0
        }
    },
    "UserInfoQueryNotice": function() {
        return {
            rc: 0,
            noticelist: [{
                noticetype: '002',
                noticeinfo: '002 info'
            }, {
                noticetype: 'tag.new.quickpayset',
                noticeinfo: '1'
            }]
        }
    },
    "UserInfoClearNotice": function() {
        return {
            rc: 0
        }
    },
    "CreditCardBind": function(reqparams) {
        //console.log('BindCard params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0,
            collectionid: 1001,
            bindno: 1211
        }
    },
    "CreditCardSave": function(reqparams) {
        //console.log('SaveCard params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0
        }
    },
    "TouchPayQuery": function() {
        return {
            rc: 0,
            requestid: 1000,
            paytoken: "SASNJKDNS",
            tpstatus: 1
        }
    },
    "TouchPayVerify": function() {
        return {
            rc: 0
        }
    },
    "PhoneRechargeModel": function() {
        return {
            rc: 0,
            rmsg: "",
            mobile:'18999999999',
            mobrclist: [{
                rechargamt: 10,
                recashamt: 11
            },{
                rechargamt: 15,
                recashamt: 15
            }, {
                rechargamt: 30,
                recashamt: 31
            }, {
                rechargamt: 50,
                recashamt: 51
            }]
        }
    },
    "QueryCertList": function(reqparams) {
        //console.log('QueryCertList params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0,
            rmsg: "",
            idtypelist: [{
                idtype: 1,
                idname: '身份证'
            }, {
                idtype: 2,
                idname: '护照'
            }, {
                idtype: 4,
                idname: '军官证'
            }, {
                idtype: 7,
                idname: '回乡证'
            }, {
                idtype: 8,
                idname: '台胞证'
            }, {
                idtype: 10,
                idname: '港澳通行证'
            }, {
                idtype: 11,
                idname: '国际海员证'
            }, {
                idtype: 20,
                idname: '外国人永久居留证'
            }, {
                idtype: 22,
                idname: '台湾通行证'
            }, {
                idtype: 23,
                idname: '士兵证'
            }, {
                idtype: 24,
                idname: '临时身份证'
            }, {
                idtype: 25,
                idname: '户口簿'
            }, {
                idtype: 26,
                idname: '警官证'
            }, {
                idtype: 99,
                idname: '其他证件'
            }]
        }
    },
    "PublicCheck": function(reqparams) {
        //console.log('PublicCheck params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0,
            rmsg: '',
            desc: '1'
        }
    },
    "ConsumeRecordsModel": function() {
        return {
            "ResponseStatus": {
                "Timestamp": "/Date(1430376439505+0800)/",
                "Ack": "Failure",
                "Errors": [{
                    "Message": "Request head is null.",
                    "ErrorCode": "MobileRequestFilterException",
                    "SeverityCode": "Error",
                    "ErrorFields": [],
                    "ErrorClassification": "FrameworkError"
                }],
                "Extension": [{
                    "Id": "CLOGGING_TRACE_ID",
                    "Value": "3675442632729384987"
                }]
            },
            "rc": 0,
            "csmlist": [{
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }, {
                "orderid": "123456789012",
                "csmname": "上海浦东四季酒店",
                "csmtime": "2015.08.05",
                "amt": "233334.00"
            }, {
                "orderid": "1148546531",
                "csmname": "富驿时尚酒店（上海外滩南京东路店）",
                "csmtime": "2015.07.30",
                "amt": "2234.00"
            }]

        }
    },
    "AuthVerifyCheck": function(reqparams) {
        //console.log('SendCode params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0, //1321311
            authstatus: 1,
            oldstatus: 2,//0:不满18 1:满18 2:未知
            rmsg: "网络异常，请稍后再试！"
        }
    },
    "PublicQueryListInfo": function(reqparams) {
        //console.log('PublicQueryListInfo params:--------------->');
        //console.log($.param(reqparams));
        return {
            rc: 0,
            rmsg: '',
            "dcbanklist": [{
                "fchar": "G",
                "bname": "工商银行"
            }, {
                "fchar": "G",
                "bname": "光大银行"
            }, {
                "fchar": "G",
                "bname": "广发银行"
            }, {
                "fchar": "J",
                "bname": "建设银行"
            }, {
                "fchar": "N",
                "bname": "农业银行"
            }, {
                "fchar": "P",
                "bname": "平安银行"
            }, {
                "fchar": "X",
                "bname": "兴业银行"
            }, {
                "fchar": "Y",
                "bname": "邮政储蓄银行"
            }, {
                "fchar": "Z",
                "bname": "招商银行"
            }, {
                "fchar": "Z",
                "bname": "中国银行"
            }, {
                "fchar": "Z",
                "bname": "中信银行"
            }],
            "ccbanklist": [{
                "fchar": "B",
                "bname": "包商银行"
            }, {
                "fchar": "B",
                "bname": "北京农商银行"
            }, {
                "fchar": "B",
                "bname": "北京银行"
            }, {
                "fchar": "C",
                "bname": "常熟农村商业银行"
            }, {
                "fchar": "C",
                "bname": "成都农村商业银行"
            }, {
                "fchar": "C",
                "bname": "承德银行"
            }, {
                "fchar": "D",
                "bname": "大连银行"
            }, {
                "fchar": "D",
                "bname": "东亚银行"
            }, {
                "fchar": "D",
                "bname": "东营银行"
            }, {
                "fchar": "E",
                "bname": "鄂尔多斯银行"
            }, {
                "fchar": "F",
                "bname": "福建省农村信用社"
            }, {
                "fchar": "F",
                "bname": "富滇银行"
            }, {
                "fchar": "G",
                "bname": "赣州银行"
            }, {
                "fchar": "G",
                "bname": "工商银行"
            }, {
                "fchar": "G",
                "bname": "工商银行"
            }, {
                "fchar": "G",
                "bname": "光大银行"
            }, {
                "fchar": "G",
                "bname": "广发银行"
            }, {
                "fchar": "G",
                "bname": "广州农村商业银行"
            }, {
                "fchar": "G",
                "bname": "广州银行"
            }, {
                "fchar": "G",
                "bname": "贵阳银行"
            }, {
                "fchar": "H",
                "bname": "哈尔滨银行"
            }, {
                "fchar": "H",
                "bname": "杭州银行"
            }, {
                "fchar": "H",
                "bname": "河北银行"
            }, {
                "fchar": "H",
                "bname": "湖南省农村信用社联合社"
            }, {
                "fchar": "H",
                "bname": "花旗银行"
            }, {
                "fchar": "H",
                "bname": "华夏银行"
            }, {
                "fchar": "H",
                "bname": "徽商银行"
            }, {
                "fchar": "J",
                "bname": "建设银行"
            }, {
                "fchar": "J",
                "bname": "江苏省农村信用社联合社"
            }, {
                "fchar": "J",
                "bname": "江苏银行"
            }, {
                "fchar": "J",
                "bname": "江阴农村商业银行"
            }, {
                "fchar": "J",
                "bname": "交通银行"
            }, {
                "fchar": "J",
                "bname": "金华银行"
            }, {
                "fchar": "J",
                "bname": "锦州银行"
            }, {
                "fchar": "J",
                "bname": "九江银行"
            }, {
                "fchar": "L",
                "bname": "兰州银行"
            }, {
                "fchar": "L",
                "bname": "龙江银行"
            }, {
                "fchar": "M",
                "bname": "民生银行"
            }, {
                "fchar": "N",
                "bname": "南昌银行"
            }, {
                "fchar": "N",
                "bname": "南京银行"
            }, {
                "fchar": "N",
                "bname": "宁波银行"
            }, {
                "fchar": "N",
                "bname": "农业银行"
            }, {
                "fchar": "P",
                "bname": "平安银行"
            }, {
                "fchar": "P",
                "bname": "浦发银行"
            }, {
                "fchar": "Q",
                "bname": "齐鲁银行"
            }, {
                "fchar": "Q",
                "bname": "青岛银行"
            }, {
                "fchar": "Q",
                "bname": "青海银行"
            }, {
                "fchar": "Y",
                "bname": "山西尧都农村商业银行"
            }, {
                "fchar": "S",
                "bname": "上海农商银行"
            }, {
                "fchar": "S",
                "bname": "上海银行"
            }, {
                "fchar": "S",
                "bname": "上饶银行"
            }, {
                "fchar": "S",
                "bname": "顺德农村商业银行"
            }, {
                "fchar": "T",
                "bname": "台州银行"
            }, {
                "fchar": "W",
                "bname": "威海市商业银行"
            }, {
                "fchar": "W",
                "bname": "潍坊银行"
            }, {
                "fchar": "W",
                "bname": "温州银行"
            }, {
                "fchar": "W",
                "bname": "乌鲁木齐市商业银行"
            }, {
                "fchar": "W",
                "bname": "无锡农村商业银行"
            }, {
                "fchar": "W",
                "bname": "吴江农商银行"
            }, {
                "fchar": "X",
                "bname": "兴业银行"
            }, {
                "fchar": "Y",
                "bname": "宜昌市商业银行"
            }, {
                "fchar": "Y",
                "bname": "银川市商业银行"
            }, {
                "fchar": "Y",
                "bname": "鄞州银行"
            }, {
                "fchar": "Y",
                "bname": "邮政储蓄银行"
            }, {
                "fchar": "C",
                "bname": "长沙银行"
            }, {
                "fchar": "Z",
                "bname": "招商银行"
            }, {
                "fchar": "Z",
                "bname": "浙江稠州商业银行"
            }, {
                "fchar": "Z",
                "bname": "浙江民泰商业银行"
            }, {
                "fchar": "Z",
                "bname": "浙江泰隆商业银行"
            }, {
                "fchar": "J",
                "bname": "中国建设银行"
            }, {
                "fchar": "Z",
                "bname": "中国银行"
            }, {
                "fchar": "Z",
                "bname": "中信银行"
            }, {
                "fchar": "C",
                "bname": "重庆农村商业银行"
            }, {
                "fchar": "C",
                "bname": "重庆银行 "
            }]
        }
    },

    "GlobalAdSearchModel": function() {
        var obj = {
            "Ads": [{
                "Index": 1,
                "ADStatus": 1,
                "GlobalBusinessInfo": {
                    "BizType": "11",
                    "PageCode": "600000017"
                },
                "ADContentLists": {
                    "AdvertisementPosition": 3168,
                    "HasValidAdvertisement": true,
                    "LinkUrl": "http://10.32.82.148/webapp/wallet/insrcactivity?from=ad",
                    "SrcUrl": "http://images3.c-ctrip.com/tg/2015/07/app/app_home_ad2201_1536_240.jpg",
                    "Width": "640",
                    "Height": "100",
                    "ClickTrackUrl": "http://ztrack.sh.ctriptravel.com/clk/sclk/?a=54367&s=3168&url=http://pages.ctrip.com/tg/2015/07/mbh5/index.html",
                    "LoadTrackUrl": "http://ztrack.sh.ctriptravel.com/imp/simp/?a=54367&s=3168"
                }
            }, {
                "Index": 2,
                "ADStatus": 1,
                "GlobalBusinessInfo": {
                    "BizType": "11",
                    "PageCode": "600000017"
                },
                "ADContentLists": {
                    "AdvertisementPosition": 3168,
                    "HasValidAdvertisement": true,
                    "LinkUrl": "http://m.ctrip.com/webapp/ElectronicBill/index.html#index",
                    "SrcUrl": "http://images3.c-ctrip.com/tg/2015/07/app/app_home_ad2201_1536_240.jpg",
                    "Width": "640",
                    "Height": "100",
                    "ClickTrackUrl": "http://ztrack.sh.ctriptravel.com/clk/sclk/?a=54367&s=3168&url=http://pages.ctrip.com/tg/2015/07/mbh5/index.html",
                    "LoadTrackUrl": "http://ztrack.sh.ctriptravel.com/imp/simp/?a=54367&s=3168"
                }
            }, {
                "Index": 3,
                "ADStatus": 1,
                "GlobalBusinessInfo": {
                    "BizType": "11",
                    "PageCode": "600000017"
                },
                "ADContentLists": {
                    "AdvertisementPosition": 3169,
                    "HasValidAdvertisement": true,
                    "LinkUrl": "ctrip://wireless/h5?path=ElectronicBill&page=index.html#index",
                    "SrcUrl": "http://images3.c-ctrip.com/tg/2015/07/app/app_home_ad1701_1536_240.jpg",
                    "Width": "640",
                    "Height": "100",
                    "ClickTrackUrl": "http://ztrack.sh.ctriptravel.com/clk/sclk/?a=53959&s=3169&url=http://pages.ctrip.com/tg/2015/07/qzzbyh5/default.html",
                    "LoadTrackUrl": "http://ztrack.sh.ctriptravel.com/imp/simp/?a=53959&s=3169"
                }
            }, {
                "Index": 4,
                "ADStatus": 1,
                "GlobalBusinessInfo": {
                    "BizType": "11",
                    "PageCode": "600000017"
                },
                "ADContentLists": {
                    "AdvertisementPosition": 3170,
                    "HasValidAdvertisement": true,
                    "LinkUrl": "http://pages.ctrip.com/tg/2015/07/ysjfmsh5/index.html",
                    "SrcUrl": "http://images3.c-ctrip.com/tg/2015/07/app/app_home_ad2701_1536_240.jpg",
                    "Width": "640",
                    "Height": "100",
                    "ClickTrackUrl": "http://ztrack.sh.ctriptravel.com/clk/sclk/?a=54593&s=3170&url=http://pages.ctrip.com/tg/2015/07/ysjfmsh5/index.html",
                    "LoadTrackUrl": "http://ztrack.sh.ctriptravel.com/imp/simp/?a=54593&s=3170"
                }
            }],
            "Result": {
                "ResultCode": 0,
                "ResultMsg": "执行成功"
            },
            "ResponseStatus": {
                "Timestamp": "\/Date(1438079358897+0800)\/",
                "Ack": "Success",
                "Errors": [],
                "Extension": [{
                    "Id": "CLOGGING_TRACE_ID",
                    "Value": "2298139393635264370"
                }]
            },
            "Md5List": []
        };
        return obj;
    },
    "UserInfoList": function() {
        return {
            rc: 0,
            rmsg: "",
            uerinfolist: [{
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'bank'
            }, {
                idtype: 1,
                idno: '511702198101111956',
                cname: 'cline'
            }, {
                idtype: 2,
                idno: '511702198101111956',
                cname: 'alice'
            }, {
                idtype: 4,
                idno: '4567895',
                cname: 'alice'
            }, {
                idtype: 7,
                idno: '12233222',
                cname: 'alice'
            }, {
                idtype: 8,
                idno: '321283199405041234',
                cname: 'alice'
            }, {
                idtype: 10,
                idno: '321283199405041234',
                cname: 'alice'
            }, {
                idtype: 11,
                idno: '321283199405041234',
                cname: 'alice'
            }, {
                idtype: 20,
                idno: '321283199405041234',
                cname: 'alice'
            }, {
                idtype: 22,
                idno: '321283199405041234',
                cname: 'alice'
            }]
        }
    },
    "InsrcOrderList": function() {
        return {
            rc: 0,
            insuoderlist: [{
                prdid: 1,
                prdname: '账户安全险',
                prdimgurl: '/webapp/wallet/res/res/img/insrc1.png',
                prddesc: '本保险承保仅限于使用携程提供的“我的钱包”中现金余额、礼品卡支付服务时造成的资金损失。',
                insrctype: 1,
                orderid: 1001,
                orderstatus: 2,//1处理中；2已出保；3已退保；-1未投保
                payamount: 0
            }, {
                prdid: 2,
                prdname: '账户安全险 高级版',
                prdimgurl: '/webapp/wallet/res/res/img/insrc2.png',
                prddesc: '本保险承保仅限于使用携程提供的“我的钱包”中现金余额、礼品卡支付服务时造成的资金损失。',
                insrctype: 2,
                orderid: 2001,
                orderstatus: 2,//1处理中；2已出保；3已退保；-1未投保
                payamount: 160
            }],
            rmsg: "网络异常，请稍后再试！"
        }
    },
    "InsrcOrderDetail": function() {
        return {
            rc: 0,
            orderno: '212132324242442',
            orderstatus: 2,
            insuname: '众安保险',
            insrccomcod: '1000',
            claimhotline: '若您不幸被盗，请拨打众安客服热线',
            claimdesc: '报案时，需了解用户 “姓名、证件类型、证件号、被盗账户ID、资金被盗时间、被盗资金金额、联系电话、联系邮箱”等信息',
            prdname: '账户安全险x',
            prdid: 1001,
            prddesc: '本保险承保仅限于使用携程提供的“我的钱包”中现金余额、礼品卡支付服务时造成的资金损失。',
            uname: '王晓晓',
            idtype: 2,
            idno: '3****************X',
            idname: '身份证',
            clauseaddr: "http://pages.ctrip.com/tour/pdf5/371.pdf",
            complogo: 'zhong_an',
            insoitemlist: [{
                name: '生效日期',
                value: '2015-08-05',
                itemtype: 0
            }, {
                name: '结束日期',
                value: '2016-08-04',
                itemtype: 0
            }, {
                name: '保障金额',
                value: '10000 元',
                itemtype: 0
            }, {
                name: '支付金额',
                value: '免费赠',
                itemtype: 0
            }, {
                name: '理赔次数',
                value: '不限',
                itemtype: 0
            }, {
                name: '服务热线',
                value: '400-999-9595',
                itemtype: 1
            }],
            rmsg: "网络异常，请稍后再试！"
        }
    },
    "InsrcSubmitOrder": function() {
        return {
            rc: 0, //1406001/1406002/1303020
            sbmtstatus: 1,
            prdname: '账户安全险x',
            insuname: '众安保险',
            complogo: 'zhong_an',
            uname: 'yanjj',
            idtype: 2,
            idname: '身份证',
            idno: '3****************X',
            payurl: 'http://m.ctrip.com/webapp/insurance/insurance_pay_check?orderid=123424&productname=美亚万国游踪境外旅行保障钻石计划&Price=123223',
            rmsg: "网络异常，请稍后再试！"
        };
    },
    "InsrcCheck": function() {
        return {
            rc: 0,
            ordstatus:2, //0：未订购(未领取) 1：已订购为出保() 2：已订购已出保()
            authstatus: 1, //0：未认证；1：已认证；2:认证失败 3:认证无结果 (无法认证) 100:认证审核中（reqbmp=1返回）
            insurequalif: 2, //0：年龄不符合(以RC错误码为准)1：年龄符合2：未知
            prdname: '账户安全险x',
            orderno: '212132324242442',
            insuname: '众安保险',
            complogo: 'zhong_an',
            orderid:'11111',
            uname: 'yanjj',
            idtype: 1,
            idno: '3****************X',
            idname: '身份证',
            rmsg: "网络异常，请稍后再试！"
        };
    },
    "InsrcGetPrdInfo": function() {
        return {
            rc: 0,
            notes: "1. xxx<br>2. yyy",
            clauseaddr: "http://pages.ctrip.com/tour/pdf5/371.pdf",
            complogo: 'zhong_an',
            prdname:'账户安全险 高级版',
            prddesc:'保额50万，承保携程“我的钱包”中现金余额支付、礼品卡支付、返现支付，绑定的本人银行卡（主卡）在携程平台被盗刷（消费）造成的资金损失。',
            insoitemlist: [{
                name: '保障期间',
                value: '1',
                itemtype: 0
            }, {
                name: '保障金额',
                value: '50万元',
                itemtype: 0
            }, {
                name: '服务热线',
                value: '400-999-9595',
                itemtype: 0
            }, {
                name: '支付金额',
                value: '免费赠',
                itemtype: 1
            }],
            rmsg: "网络异常，请稍后再试！"
        };
    }
};