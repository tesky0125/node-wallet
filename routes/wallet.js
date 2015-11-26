var express = require('express');
var router = express.Router();

router.get('/wallet/:action',function(req, res, next){
	var action = req.params.action;

    res.render(action, {});
});

module.exports = router;