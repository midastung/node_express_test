var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var db = req.con;
  var data = "";

  db.query('SELECT * FROM article', function(err, rows){
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
      time: req.body.time,
      class: req.body.class,
      tradeclass: req.body.tradeclass,
      price: req.body.price,
      note: req.body.note
  };

  //console.log(sql);
  var qur = db.query('INSERT INTO article SET ?', sql, function(err, rows) {
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

  db.query('SELECT * FROM article WHERE id = ?', id, function(err, rows) {
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
    time: req.body.time,
    class: req.body.class,
    tradeclass: req.body.tradeclass,
    price: req.body.price,
    note: req.body.note
  };

  var qur = db.query('UPDATE article SET ? WHERE id = ?', [sql, id], function(err, rows) {
      if (err) {
          console.log(err);
      }

      res.setHeader('Content-Type', 'application/json');
      res.redirect('/');
  });

});

module.exports = router;
