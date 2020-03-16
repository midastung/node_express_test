var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var db = req.con;
  var data = "";

  db.query('SELECT * FROM account_tx', function(err, rows){
    if(err){
      console.log(err);
    }
    data = rows;
    res.render('index', {title:'Goods Information', data:data});
  });
});

//新增資料
router.post('/userAdd', function(req, res, next) {

  var db = req.con;
  var sql = {
    account_time: req.body.time,
    account_class: req.body.class,
    account_tradeclass: req.body.tradeclass,
    account_price: req.body.price,
    account_note: req.body.note
  };

  //console.log(sql);
  var qur = db.query('INSERT INTO account_tx SET ?', sql, function(err, rows) {
      if (err) {
          console.log(err);
      }
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/');
  });
});


// 編輯資料
router.get('/userEdit', function(req, res, next) {

  var id = req.query.id;
  var db = req.con;
  var data = "";

  db.query('SELECT * FROM account_tx WHERE id_account = ?', id, function(err, rows) {
      if (err) {
          console.log(err);
      }

      var data = rows;
      res.render('userEdit', { title: 'Edit Account', data: data });
  });

});

router.post('/userEdit', function(req, res, next) {

  var db = req.con;
  var id = req.body.id;

  var sql = {
    account_time: req.body.time,
    account_class: req.body.class,
    account_tradeclass: req.body.tradeclass,
    account_price: req.body.price,
    account_note: req.body.note
  };

  var qur = db.query('UPDATE account_tx SET ? WHERE id_account = ?', [sql, id], function(err, rows) {
      if (err) {
          console.log(err);
      }

      res.setHeader('Content-Type', 'application/json');
      res.redirect('/');
  });

});

module.exports = router;
