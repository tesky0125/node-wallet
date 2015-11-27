/**
 * @author yanjj   Wallet V6.7
 * @description  page map for set pageid, and whether need recreate view.
 */
define([], function () {
    /**
     *  'page_name': {'pageid':['h5_pageid', 'hybrid_pageid'],'recreate':false}
     *  'page_name': {'pageid':    {'path1':['h5_pageid', 'hybrid_pageid'],'path1':xxx...},
     *                'recreate':  {'path1':false,'path2':false}}
     *                recreate:default is false
     **/
    var PageMap = {
        'index': {
            'pageid': ['271022', '272040']
        },
        'transacthistory': {
            'pageid': ['271023', '272041']
        },
        'recharge': {
            'pageid': ['271024', '272042'],
            'recreate': true
        },
        'withdrawback': {
            'pageid': ['271025', '272043'],
            'recreate': true
        },
        'withdraw': {
            'pageid': {
                'default': ['271026', '272044'],
                'transfer': ['', '']
            }
        },
        'addcard': {
            'pageid': {
                'default': ['271027', '272045'],
                'bindcard': ['271054', '272072'],
                'fastpay': ['271062', '272080'],
                'realname': ['', '']
            },
            'recreate': {
                'default': true,
                'bindcard': true,
                'fastpay': true,
                'realname': true
            }
        },
        'withdrawcard': {
            'pageid': {
                'default': ['271028', '272046'],
                'history': ['271029', '272047']
            },
            'recreate': {
                'default': true,
                'history': true
            }
        },
        'result': {
            'pageid': {
                'withdraw': ['271030', '272048'],
                'cashback': ['271039', '272057'],
                'transfer': ['271050', '272068'],
                'recharge': ['271086', '272104'],
                'withdrawback': ['271087', '272105'],
                'addaccountinfo ': ['600001513', '600001516']
            }
        },
        'tranxlist': {
            'pageid': ['271031', '272049']
        },
        'transactdetail': {
            'pageid': ['271032', '272050']
        },
        'rechargelist': {
            'pageid': ['271033', '272051']
        },
        'rechargedetail': {
            'pageid': ['271034', '272052']
        },
        'withdrawlist': {
            'pageid': ['271035', '272053']
        },
        'withdrawdetail': {
            'pageid': ['271036', '272054']
        },
        'useraccount': {
            'pageid': ['271037', '272055']
        },
        'switchcash': {
            'pageid': ['271038', '272056'],
            'recreate': true
        },
        'todebitcard': {
            'pageid': ['271040', '272058'],
            'recreate': true
        },
        'manualtogift': {
            'pageid': ['271041', '272059'],
            'recreate': true
        },
        'autotogift': {
            'pageid': ['271042', '272060']
        },
        'addpostprovince': {
            'pageid': ['271043', '272061']
        },
        'addpostcity': {
            'pageid': ['271044', '272062']
        },
        'selbankcard': {
            'pageid': ['271045', '272063']
        },
        'transferid': {
            'pageid': ['271046', '272064']
        },
        'transfertocardno': {
            'pageid': ['271047', '272065'],
            'recreate': true
        },
        'transfertocard': {
            'pageid': ['271048', '272066'],
            'recreate': true
        },
        'phonevalidate': {
            'pageid': ['271049', '272067'],
            'recreate': true
        },
        'cashcouponlist': {
            'pageid': ['271051', '272069']
        },
        'payoutlist': {
            'pageid': ['271052', '272070']
        },
        'mybankcard': {
            'pageid': ['271053', '272071']
        },
        'bindcard': {
            'pageid': ['271055', '272073'],
            'recreate': true
        },
        'cardvalidity': {
            'pageid': ['271056', '272074']
        },
        'cardidentifying': {
            'pageid': ['271057', '272075']
        },
        'validatepremobile': {
            'pageid': {
                'bindcard': ['271058', '272076'],
                'fastpay': ['271064', '272082']
            },
            'recreate': {
                'bindcard': true,
                'fastpay': true
            }
        },
        'payobligation': {
            'pageid': ['271059', '272077']
        },
        'fastpaywithpsd': {
            'pageid': {
                'default': ['271066', '272084'],
                'guide': ['271060', '272078']
            }
        },
        'fastpaysetting': {
            'pageid': {
                'default': ['271061', '272079'],
                'defaultcredit': ['271070', '272088']
            }
        },
        'fastpaycard': {
            'pageid': ['271063', '272081'],
            'recreate': true
        },
        'fastpaynopsd': {
            'pageid': ['271065', '272083']
        },
        'setpaypassword2': {
            'pageid': {
                'confirm': ['271068', '272086']
            }
        },
        'setsecuritymobile': {
            'pageid': {
                'default': ['271085', '272103'],
                'fastpay': ['271069', '272087']
            }
        },
        'fastpayconfirm': {
            'pageid': ['271071', '272089']
        },
        'securitycenter': {
            'pageid': ['271072', '272090']
        },
        'setpaypsd': {
            'pageid': ['271073', '272091']
        },
        'setpaypsd2': {
            'pageid': ['271074', '272092']
        },
        'resetpaypsd': {
            'pageid': ['271075', '272093']
        },
        'howtosetfinger': {
            'pageid': ['271076', '272094']
        },
        'enablefinger': {
            'pageid': ['271077', '272095']
        },
        'obligation': {
            'pageid': ['271078', '272096']
        },
        'verfiedpsd': {
            'pageid': {
                'finger': ['271079', '272097'],
                'modifysecuritymobile': ['271081', '272099'],
                'withdraw': ['271084', '272102']
            }
        },
        'fingersendcode': {
            'pageid': ['271080', '272098'],
            'recreate': true
        },
        'modifysecuritymobile': {
            'pageid': ['271082', '272100'],
            'recreate': true
        },
        'modifysecuritymobile2': {
            'pageid': ['271083', '272101'],
            'recreate': true
        },
        'accountverified': {
            'pageid': ['600001511', '600001514']
        },
        'addaccountinfo': {
            'pageid': ['600001512', '600001515'],
            'recreate': true
        },
        'userinfolist':{
            'pageid': ['', ''],
            'recreate': true
        }
    };
    return PageMap;
});