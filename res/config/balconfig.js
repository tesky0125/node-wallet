/**
* @author xzh
* @desc:  wallet--cash
*/

define(['Config'], function (Config) {
    var exports = _.clone(Config);

    _.extend(exports, {
        //Secure.ctrip.com堡垒内网IP：10.8.5.10
        //Wpg.ctrip.com堡垒内网IP：10.8.5.25公网IP：101.226.248.102
        //m.ctrip.com堡垒内网IP：10.8.2.111
        DOMAINARR: {//刮刮卡使用，由于刮刮卡没有部署堡垒，故连接pro
            "local": { "domain": 'gateway.m.fws.qa.nt.ctripcorp.com', "path": "restapi5" },
            "test": { "domain": "gateway.m.fws.qa.nt.ctripcorp.com", "path": "restapi5" },
            "uat": { "domain": "gateway.m.uat.qa.nt.ctripcorp.com", "path": "restapi" },
            "baolei": { "domain": "m.ctrip.com", "path": "restapi" },//10.8.2.111
            "pro": { "domain": "m.ctrip.com", "path": "restapi" }
        },
        DOMAINARR_Ads: {//广告使用，由于刮刮卡没有部署堡垒，故连接pro
            "local": { "domain": 'gateway.m.fws.qa.nt.ctripcorp.com', "path": "restapi" },
            "test": { "domain": "gateway.m.fws.qa.nt.ctripcorp.com", "path": "restapi" },
            "uat": { "domain": "gateway.m.uat.qa.nt.ctripcorp.com", "path": "restapi" },
            "baolei": { "domain": "m.ctrip.com", "path": "restapi" },
            "pro": { "domain": "m.ctrip.com", "path": "restapi" }
        },
        DOMAINARR_INCREMENT: {//银行列表，城市列表用到
            "local": { "domain": 'secure.fws.qa.nt.ctripcorp.com', "path": "restapi" },
            "test": { "domain": "secure.fws.qa.nt.ctripcorp.com", "path": "restapi" },
            "uat": { "domain": "wpg.uat.qa.nt.ctripcorp.com", "path": "restapi" },
            "baolei": { "domain": "10.8.5.25", "path": "restapi" },
            "pro": { "domain": "wpg.ctrip.com", "path": "restapi" }
        },
        DOMAINARR_COUPON: {//原银行列表，城市服务
            "local": { "domain": 'm.fat19.qa.nt.ctripcorp.com', "path": "restapi5" },
            "test": { "domain": "m.fat19.qa.nt.ctripcorp.com", "path": "restapi5" },
            "uat": { "domain": "m.uat.qa.nt.ctripcorp.com", "path": "restapi" },
            "baolei": { "domain": "10.8.2.111", "path": "restapi" },
            "pro": { "domain": "m.ctrip.com", "path": "restapi" }
        }
    });

    return exports;
});