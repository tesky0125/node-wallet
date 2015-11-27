var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

router.get('/:action',function(req, res, next){
	var action = req.params.action;

    res.render(action, {});
});

module.exports = router;