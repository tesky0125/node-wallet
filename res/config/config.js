/**
 * @module config
 * @author luzx,wxm
 * @description wallet config
 * @version since Wallet V5.7
 */

define(['cUtilHybrid'], function(cUtility) {
    var exports = {
        /**
         * @description version
         */
        VER: 'V6.12 B20151126b',
        /**
         * @description debug option
         */
        DEBUG: 1,
        /**
         * @description log request info for debug
         */
        LOG_REQUEST_INFO: 1,
        /**
         * @description log request info for debug
         */
        LOG_RESPONSE_INFO: 0,
        /**
         * @description use local data instead of actual service call
         */
        MOCK_SERVICE_CALL: 0,
        /**
         * @description set async delay for mock service,unit ms
         */
        MOCK_SERVICE_DELAY: 300,
        /**
         * @description set mock service response sucess or fail
         */
        MOCK_SERVICE_SUCESS: 1,
        /**
         * @description mock finger print capabilty
         */
        MOCK_FINGER_SUPPORT: 0,
        /**
         * @description mock user has records
         */
        MOCK_HAS_CONSUMERECORDS: 0,
        /**
         * @description mock plugin update test
         */
        MOCK_PLUGIN_TEST: 0,
        //
        //stable variables bellow
        //
        BUSTYPE_PAYMENT: '888',
        /**
         * @description used for hybrid model contract
         */
        CVER_HEAD_Hybrid: '693', //TODO
        /**
         * @description used for h5 model contract
         */
        CVER_HEAD_H5: '6.12',
        /**
         * @description used for model contract
         */
        CVER: '6.12',
        /**
         * @description auth retry times
         */
        AUTH_RETRY_TIMES: 5,
        /**
         * @description wallet recharge: if in app, go native pay or hybrid pay
         */
        PAY_METHOD_NATIVE: true,
        /**
         *@ paymchid set all paymchid to '9998' in front-end, CBU transfer it by reqtype.
         */
        PAYMCHIDS:{
            BINDCARD:'9998',
            FASTPAY:'9998',
            REALNAME:'9998',
            DEFAULT:'9998'
        },
        /**
         * @description result code define
         */
        RC_CODE: {
            SUCCESS: 0,
            TIMEOUT: 1301002, //CBU timeout with its backend service provider
            IDENTIFIED_CODE_LIMIT: 1403040,
            AUTH_NONE: 1402003,
            AUTH_INVALID: 1402004,
            AUTH_EXP: 1402005,
            ACCNT_NOT_SUP_WLT: 1302001,
            ACCNT_NOT_SUP_WITHDRAW: 1321330,
            ACCNT_NOT_HAVE_PAYPWD: 1321311,
            PSD_ERROR: 1321302,
            WITHDRAW_PROCESSING: 1504789, //提现处理中
            WITHDRAW_PROCESSING2: 1504761, //人工处理中
            WITHDRAW_NEED_MOBILE: 1504765, //需要手机验证
            WITHDRAW_DAILY_LIMIT: 1504792, //超日限
            WITHDRAW_OTHER: 1504799,
            BIND_CARD_ERROR: 1405003, // 卡信息错误，请核对并修改,
            BIND_CARD_CHANGE: 1405006, //银行卡异常，请联系银行或更换方式
            BIND_CARD_TEL: 1405005 //手机号与银行预留手机不一致

        },
        /**
         * @description lizard framework UI status definitions
         */
        FRW_UI_STATUS: {
            SHOW: 'show'
        },
        /**
         * @description model cache data status
         */
        MDL_CBK_STATUS: {
            CACHE: 0,                 //cache data
            REALTIME_NOT_EQUAL: 1,     //realtime data, and not equal with cache data
            REALTIME_EQUAL: 2          //realtime data, and equal with cache data
        },
        SERVICE_TEL_NUMBER: 10106666,
        /**
         * @description
         * Secure.ctrip.com堡垒内网IP：10.8.5.10
         * Wpg.ctrip.com堡垒内网IP：10.8.5.25公网IP：101.226.248.102
         * m.ctrip.com堡垒内网IP：10.8.2.111
         */
        DOMAINARR: {
            "local": {
                "domain": 'gateway.secure.fws.qa.nt.ctripcorp.com',
                "path": "restful/soa2/10193"
            },
            "test": {
                "domain": "gateway.secure.fws.qa.nt.ctripcorp.com",
                "path": "restful/soa2/10193"
            },
            "uat": {
                "domain": "gateway.secure.uat.qa.nt.ctripcorp.com",
                "path": "restful/soa2/10193"
            },
            "baolei": {
                "domain": "gateway.secure.ctrip.com",
                "path": "restful/soa2/10193"
            },
            "pro": {
                "domain": "gateway.secure.ctrip.com",
                "path": "restful/soa2/10193"
            }
        },
        DOMAIN_HOME_ARR: {
            'local': 'm.fat19.qa.nt.ctripcorp.com',
            'test': 'm.fat19.qa.nt.ctripcorp.com',
            'uat': 'm.uat.qa.nt.ctripcorp.com',
            'baolei': '10.8.2.111',
            'pro': 'm.ctrip.com'
        },
        DOMAIN_LOGIN_ARR: {
            'local': 'accounts.fat49.qa.nt.ctripcorp.com',
            'test': 'accounts.fat49.qa.nt.ctripcorp.com',
            'uat': 'accounts.uat.qa.nt.ctripcorp.com',
            'baolei': 'accounts.ctrip.com',
            'pro': 'accounts.ctrip.com'
        },
        //Wallet H5 service addresses:
        DOMAIN_H5_ARR: {
            'local': 'http://127.0.0.1',
            'test': 'https://secure.fws.qa.nt.ctripcorp.com',
            'uat': 'https://secure.uat.qa.nt.ctripcorp.com',
            'baolei': 'https://10.8.5.10',
            'pro': 'https://secure.ctrip.com'
        },
        /**
         * @description verify id code immediately
         */
        VERIFY_ID_CODE: false,
        //local api bellow
        _env: function() {
            if (this.IS_HYBRID) { //
                if (cUtility.isPreProduction() == '1') { // 定义堡垒环境
                    return "baolei";
                } else if (cUtility.isPreProduction() == '0') { // 定义测试环境
                    return "test";
                } else if (cUtility.isPreProduction() == '2') { // 定义UAT环境
                    return "uat";
                } else {
                    return "pro";
                }
            } else {
                var host = location.host;
                if (host.match(/^(localhost|172\.16|127\.0|10\.32)/i)) {
                    return "local";
                } else if (host.match(/^secure\.fat/i) || host.match(/^secure\.fws/i)) {
                    return "test";
                } else if (host.match(/^secure\.uat/i)) {
                    return "uat";
                } else if (host.match(/^10\.8\.2\.111/i) || host.match(/^10\.8\.5\.10/i)) {
                    return "baolei";
                } else {
                    return "pro";
                }
            }
        }
    };

    /**
     * @description is in web-h5/app-h5/hybrid
     */
    //三种互斥状态，有限采用互斥状态判断
    exports.IS_WEBH5 = !Lizard.isInCtripApp && !Lizard.isHybrid;
    exports.IS_APPH5 = Lizard.isInCtripApp;
    exports.IS_HYBRID = Lizard.isHybrid;
    //两种组合状态，为兼容代码
    exports.IS_INAPP = exports.IS_APPH5 || exports.IS_HYBRID; //直连 or Hybrid
    exports.IS_H5 = exports.IS_WEBH5 || exports.IS_APPH5; //web h5 or 直连

    exports.LOGIN_RET_URL = '/wallet/index.html#index';

    if (!exports.IS_HYBRID) { //
        exports.LOGIN_RET_URL = location.protocol + '//' + location.host + '/webapp' + exports.LOGIN_RET_URL;
    }

    exports.ENV = exports._env();

    exports.H5_MAIN_HOME_URL = 'http://' + exports.DOMAIN_HOME_ARR[exports.ENV] + '/webapp/myctrip/';

    exports.H5_MAIN_HOME_APP_URL = 'http://' + exports.DOMAIN_HOME_ARR[exports.ENV] + '/webapp';

    exports.H5_LOGIN_URL = 'https://' + exports.DOMAIN_LOGIN_ARR[exports.ENV] + '/H5Login';
    exports.H5_URL_LOGIN_JUMP = exports.H5_LOGIN_URL + '/#login?from=' + encodeURIComponent(exports.LOGIN_RET_URL);
    exports.H5_WALLET_URL_INDEX_PI = exports.DOMAIN_H5_ARR[exports.ENV] + '/webapp/wallet/svc/plugin/index/' + exports.CVER_HEAD_Hybrid;
    exports.H5_WALLET_URL_CSR_PI = exports.DOMAIN_H5_ARR[exports.ENV] + '/webapp/wallet/svc/plugin/consumerecords/' + exports.CVER_HEAD_Hybrid;
    exports.H5_DOMAIN_URL = exports.DOMAIN_H5_ARR[exports.ENV] + '/webapp';

    //for wxm hybrid test////////
    /*if (exports.MOCK_PLUGIN_TEST) {
        exports.H5_DOMAIN_URL = 'http://172.16.150.111' + '/webapp';
        exports.H5_WALLET_URL_INDEX_PI = 'http://172.16.150.111' + '/webapp/wallet/svc/plugin/index/' + exports.CVER_HEAD_Hybrid;
        exports.H5_WALLET_URL_CSR_PI = 'http://172.16.150.111' + '/webapp/wallet/svc/plugin/consumerecords/' + exports.CVER_HEAD_Hybrid;
    }*/
    //test end//////////////////

    return exports;
});
