/**
* @module mockmodel
* @author wxm, lzx, wwg
* @description wallet local storage store classes
*/

define(['cCoreInherit', 'cLocalStore', 'cModel', 'cUtilCryptBase64'], function (cBase, cLocalStore, cModel, cUtilCryptBase64) {

	var S = {};
	//abstract store
	var AbstractStore = new cBase.Class(cLocalStore, {
	    __propertys__: function () {
	        this.isUserData = true;
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    },
	    setObject: function (obj) {
	        for (var i in obj) {
	            this.setAttr(i, obj[i]);
	        }
	    },
	    setBase64: function (obj, val) {
	        if (val) {
	            val = this._formatBase64Val(val);
	            this.setAttr(obj, val);
	        } else {
	            for (var i in obj) {
	                var val = this._formatBase64Val(obj[i]);
	                this.setAttr(i, val);
	            }
	        }
	    },
	    getBase64: function (val) {
	        if (val) {
	        	var rt = this.getAttr(val);
	        	if(rt){
	        		return cUtilCryptBase64.Base64.decode(this.getAttr(val));
	        	}
	        	return;
	        }
	        var obj = this.get();
	        for (var i in obj) {
                if (!this._isEmpty(obj[i])) {
                    obj[i] = cUtilCryptBase64.Base64.decode(obj[i]);
                }
	        }
	        return obj;
	    },
	    _formatBase64Val: function (input) {
	        if (_.isNumber(input)) {
	            input += '';
	        }

	        if (_.isString(input)) {
	            return cUtilCryptBase64.Base64.encode(input);
	        } else {
	            return input;
	        }
	    },
        _isEmpty: function(str) {
            return _.isUndefined(str) || _.isNull(str) || _.isNaN(str) || _.isEmpty(str);
        }
	});
	S.PageManagerStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_PAGE_MANAGER';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	//business store
    /******************************************
    * @description:  钱包UserInfoStore, 含auth等安全或登录信息
    * @author     :  wxm
    * @date       :  2014-5-19
    */
	S.UserInfoStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_USERINFO';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    },
	    hasUserData: function () {
			return this.getAttr('uid') != undefined;
		},
		hasPwdData: function () {
			return this.getAttr('haspwd') != undefined;
		},
	    hasUsedCardData: function () {
	        return this.getAttr('cardcnt') != undefined;
	    }
	});

	S.UserAccountStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_USER_ACCOUNT_INFO';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    },
	    hasAccountData: function () {
	        return this.getAttr('uid') != undefined;
	    },
	    hasCtripUserData: function () {
	        return this.getAttr('rtcash') != undefined;
	    },
	    hasLipinCardData: function () {
	        return this.getAttr('lipincard') != undefined;
	    }
	});

	S.CheckBin = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_CHECK_BIN';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.DebugOptStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_DEBUGOPT';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.DebugOptStore2 = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_DEBUGOPT2';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.Verification = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_VERIFICATION_INFO';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.WithdrawResultStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_WITHDRAW_RESULT';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.UrlTokenStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_URLTOKEN';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.RetPageStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_RETPAGE';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.LoginRetryStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_RETRYTIMES';
	        this.lifeTime = '30M';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.WithdrawDetailStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_WITHDRAW_DETAIL';
	        this.lifeTime = '30M';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.RechargeDetailStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_RECHARGE_DETAIL';
	        this.lifeTime = '30M';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.HisCardItemStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_HISCARD_ITEM';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.WithdrawLimit = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_WITHDRAW_LIMIT';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.WithdrawCard = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_WITHDRAW_CARD';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /*
    *@auth:xzh
    *@desc: 返现账户列表
    */
	S.ReCashListStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_RECASH_LIST';
	        this.lifeTime = '3M';
	        this.isUserData = true; //切换账户，自动清除
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /**
     * @desc 刮刮卡
     */
	S.ScratchCardStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'EXG_SCRATCH_CARD';
	        this.lifeTime = '1D';
	        this.isUserData = true; //若用户更换帐号后，自动清除
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /**
    *@desc: 返现--提现储蓄卡相关信息
    *@auth: zh.xu
    */
	S.TransferStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'BALANCE_ACCOUNT_TRANSFER';
	        this.lifeTime = '1D';
	        this.isUserData = true; //若用户更换帐号后，自动清除
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	/**
	*@desc: 返现--提现储蓄卡相关信息 转出到银行卡 add by wallet 6.1.
	*@auth: wwg
	*/
	S.Transfer2Store = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'BALANCE_ACCOUNT_TRANSFER2';
	        this.lifeTime = '1D';
	        this.isUserData = true; //若用户更换帐号后，自动清除
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	/**
	*@desc: 返现--recash way list store
	*@auth: wwg
	*/
	S.ReCashWayListStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'RECASH_WAY_LIST_STORE';
	        this.lifeTime = '1D';
	        this.isUserData = true; //若用户更换帐号后，自动清除
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /**
    *@desc: 返现--银行地址信息
    */
	S.SelectAddrStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'BANK_SELECT_ADDR';
	        this.lifeTime = '30M';
	        this.rollbackEnabled = true;
	        this.defaultData = {
	            "addr": "",
	            "addrId": 1,
	            "cty": "",
	            "destCtyId": 1,
	            "dstr": "",
	            "dstrId": 1,
	            "edTime": "",
	            "fee": 0,
	            "gua": false,
	            "ldTime": "",
	            "mphone": "",
	            "phone": "",
	            "port": "",
	            "prvn": "",
	            "recipient": "",
	            "rmk": "",
	            "type": 1,
	            "zip": "",
	            'prvnId': '',
	            'inforId': 0,
	            "ctyName": "",
	            "dstrName": "",
	            "prvnName": ""
	        };
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /**
    *@desc: 返现--银行列表
    */
	S.BankListStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'BALANCE_BANK_LIST';
	        this.lifeTime = '15D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /**
    *@desc: 返现--省份列表
    */
	S.CityPrivinceStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'BALANCE_PRIVINCE_LIST';
	        this.lifeTime = '15D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /**
    *@desc: 返现--城市列表
    */
	S.CityListStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'BALANCE_CITY_LIST';
	        this.lifeTime = '15D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.TransWalletStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_TRANSFER_WALLET';
	        this.lifeTime = '3M';
	        this.isUserData = true; //若用户更换帐号后，自动清除
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.QuerySource = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_QUERYSOURCE_WALLET';
	        this.lifeTime = '1D';
	        this.isUserData = true;
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.WithDrawBack = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_WITHDRAWBACK_WALLET';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.SubmitFixed = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_SUBMITFIXED_WALLET';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.GetLoginSession = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_GETLOGINSESSION_WALLET';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.FingerMark = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_FINGER';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.FastPayStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_FAST_PAY';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.CardBinStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_CARD_BIN';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.BindCardStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_BIND_CARD';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.TipsFlagStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_TIPS_FLAG';
	        this.lifeTime = '999D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

	S.BindCardTempStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_BIND_CARD_TEMP';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});
    /*
    *@description: message shown on result page
    */
	S.ExchgPhoneMsgStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_EXCHG_PHONE_MSG';
	        this.lifeTime = '5M';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});
    /*
    *@description: amount list which are recharged
    */
	S.PhoneRechargeStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_PHONE_AMT_RECHARGE';
	        this.lifeTime = '0.5D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    /**
    *@description: choose amount which is recharged
    */
	S.InfoRechargedPhoneStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_PHONE_RECHARGE_INFO';
            this.lifeTime = '30M';
        },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    S.CertListStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_CERT_LIST';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
    });
    S.RealCertListStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'WALLET_REALCERT_LIST';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });

    S.CacheStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'WALLET_CACHE';
            this.lifeTime = '999D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
	/*
	 *@description: store data for realname verify with idcard or bankcard
	 */
	S.RealNameStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_REAL_NAME';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	/*
	 *@description: store data for realname verify with idcard
	 */
	S.RealNameVerifyStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_REAL_NAME_VERIFY';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});
	/*
	 *@description: store data for realname verify with bankcard
	 */
	S.RealNameCardStore = new cBase.Class(AbstractStore, {
	    __propertys__: function () {
	        this.key = 'WALLET_REAL_NAME_CARD';
	        this.lifeTime = '1D';
	    },
	    initialize: function ($super, options) {
	        $super(options);
	    }
	});

    S.AdStore = new cBase.Class(AbstractStore, {
        __propertys__: function () {
            this.key = 'WALLET_AD';
            this.lifeTime = '1D';
        },
        initialize: function ($super, options) {
            $super(options);
        }
    });
	S.MoblieCodeStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_MOBLIECODE';
			this.lifeTime = '1M';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.UserInfoList = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_USERINFOLIST';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.SltInfoList = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_SLTINFOLIST';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.SelectInfo = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_SELECTINFO';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.PublicCheckStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_PUBLIC_CHECK';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.InsrcDetailStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_INS_DETAIL';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.InsrcAddInfoStore = new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_INS_AddInfo';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.ShareInfoStore= new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_WX_SHARE';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.InsrcRetStore=new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_INS_RET';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.InsrcSubmitStore= new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_INSRC_SUBMIT';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.InsrcCheckStore= new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_INSRC_CHECK';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.AuthVerifyStore=new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_Auth_Verify';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.SetPsdStore=new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_PSD_RETINFO';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.SetPageStore=new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_FROM_PAGE';
			this.lifeTime = '1D';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	S.SmStore=new cBase.Class(AbstractStore, {
		__propertys__: function () {
			this.key = 'WALLET_SM';
			this.lifeTime = '40M';
		},
		initialize: function ($super, options) {
			$super(options);
		}
	});
	return S;
});
