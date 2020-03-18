var express = require('express');
var router = express.Router();
var sort = [0, 0, 0, 0];
/* GET home page. */
router.get('/', function(req, res, next) {
	var db = req.con;
	var data = "";
	db.query('SELECT * FROM account_tx', function(err, rows) {
		if (err) {
			console.log(err);
		}
		data = rows;
		var sort_time = [];
		var sort_class = [];
		var sort_tradeclass = [];
		var sort_price = [];
		for (var i = 0; i < data.length; i++) {
			sort_time.push(data[i].account_time);
			sort_class.push(data[i].account_class);
			sort_tradeclass.push(data[i].account_tradeclass);
			sort_price.push(data[i].account_price);
		}
		sort_time = [...new Set(sort_time)];
		sort_class = [...new Set(sort_class)];
		sort_tradeclass = [...new Set(sort_tradeclass)];
		sort_price = [...new Set(sort_price)];
		res.render('index', {
			title: 'Goods Information',
      data: data,
      sort_where_time: "",
      sort_where_class: "",
      sort_where_tradeclass: "",
      sort_where_price: "",
			sort_time: sort_time,
			sort_class: sort_class,
			sort_tradeclass: sort_tradeclass,
      sort_price: sort_price,
      changeyymmdd:changeyymmdd
		});
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
	}; //console.log(sql);
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
		res.render('userEdit', {
			title: 'Edit Account',
			data: data
		});
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
router.post('/sort', function(req, res, next) {
	var db_select = "";
  var db = req.con;
  var data = [];
  //取得篩選資料
	var account_time = req.body.account_time;
	var account_class = req.body.account_class;
	var account_tradeclass = req.body.account_tradeclass;
	var account_price = req.body.account_price;
	var sort_select = "SELECT * FROM account_tx ";
	//設定篩選列
	var sort_where = " where ";
	var sort_where_time = req.body.sort_where_time;
	var sort_where_class = req.body.sort_where_class;
	var sort_where_tradeclass = req.body.sort_where_tradeclass;
  var sort_where_price = req.body.sort_where_price;
  
	if (account_time != undefined) {
    sort_where_time="";
    if (account_time instanceof Array) {
      sort_where_time+="account_time in (";
      for (var i = 0; i < account_time.length; i++) {
        if(i>0){
          sort_where_time +=",'"+account_time[i]+"'";
        }else{
          sort_where_time +="'"+account_time[i]+"'";
        }
      }
      sort_where_time +=") ";
      if (account_time[0] == "全部") {
        sort_where_time ="";
      }
		} else {
				sort_where_time += "account_time='" + account_time + "'";
			if (account_time == "全部") {
				sort_where_time = "";
			}
		}
	}
	if (account_class != undefined) {
    sort_where_class="";
    if (account_class instanceof Array) {
      sort_where_class+="account_class in (";
      for (var i = 0; i < account_class.length; i++) {
        if(i>0){
          sort_where_class +=",'"+account_class[i]+"'";
        }else{
          sort_where_class +="'"+account_class[i]+"'";
        }
      }
      sort_where_class +=") ";
      if (account_class[0] == "全部") {
        sort_where_class ="";
      }
		} else {
				sort_where_class += "account_class='" + account_class + "'";
			if (account_class == "全部") {
				sort_where_class = "";
			}
		}
	}
	if (account_tradeclass != undefined) {
    sort_where_tradeclass="";
    if (account_tradeclass instanceof Array) {
      sort_where_tradeclass+="account_tradeclass in (";
      for (var i = 0; i < account_tradeclass.length; i++) {
        if(i>0){
          sort_where_tradeclass +=",'"+account_tradeclass[i]+"'";
        }else{
          sort_where_tradeclass +="'"+account_tradeclass[i]+"'";
        }
      }
      sort_where_tradeclass +=") ";
      if (account_tradeclass[0] == "全部") {
        sort_where_tradeclass ="";
      }
		} else {
				sort_where_tradeclass += "account_tradeclass='" + account_tradeclass + "'";
			if (account_tradeclass == "全部") {
				sort_where_tradeclass = "";
			}
		}
	}
	if (account_price != undefined) {
    sort_where_price ="";
    
		if (account_price instanceof Array) {
      sort_where_price+="account_price in (";
      for (var i = 0; i < account_price.length; i++) {
        if(i>0){
          sort_where_price +=",'"+account_price[i]+"'";
        }else{
          sort_where_price +="'"+account_price[i]+"'";
        }
      }
      sort_where_price +=") ";
      if (account_price[0] == "全部") {
        sort_where_price ="";
      }
		} else {
				sort_where_price += "account_price='" + account_price + "'";
			if (account_price == "全部") {
				sort_where_price = "";
			}
		}
  }
  
	if(sort_where_time!=""&&sort_where_time!=undefined){
    db_select=sort_select+sort_where+sort_where_time;
    if(sort_where_class!=""&&sort_where_class!=undefined){
      db_select+=" and "+sort_where_class;
      if(sort_where_tradeclass!=""&&sort_where_tradeclass!=undefined){
        db_select+=" and "+sort_where_tradeclass;
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select+=" and "+sort_where_price;
        }
      }else{
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select+=" and "+sort_where_price;
        }
      }
    }else{
      if(sort_where_tradeclass!=""&&sort_where_tradeclass!=undefined){
        db_select+=" and "+sort_where_tradeclass;
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select+=" and "+sort_where_price;
        }
      }else{
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select+=" and "+sort_where_price;
        }
      }
    }
  }else{
    if(sort_where_class!=""&&sort_where_class!=undefined){
      db_select=sort_select+sort_where+sort_where_class;
      if(sort_where_tradeclass!=""&&sort_where_tradeclass!=undefined){
        db_select+=" and "+sort_where_tradeclass;
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select+=" and "+sort_where_price;
        }
      }else{
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select+=" and "+sort_where_price;
        }
      }
    }else{
      if(sort_where_tradeclass!=""&&sort_where_tradeclass!=undefined){
        db_select=sort_select+sort_where+sort_where_tradeclass;
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select+=" and "+sort_where_price;
        }
      }else{
        if(sort_where_price!=""&&sort_where_price!=undefined){
          db_select=sort_select+sort_where+sort_where_price;
        }else{
          db_select=sort_select;
        }
      }
    }
  }
  //設定篩選項目
  var sort_time = [];
	var sort_class = [];
	var sort_tradeclass = [];
	var sort_price = [];
	db.query("SELECT * FROM account_tx", function(err, rows) {
		if (err) {
			console.log(err);
		}
		data = rows;
		
		for (var i = 0; i < data.length; i++) {
			sort_time.push(changeyymmdd(data[i].account_time));
			sort_class.push(data[i].account_class);
			sort_tradeclass.push(data[i].account_tradeclass);
			sort_price.push(data[i].account_price);
		}
		//不重複
		sort_time = [...new Set(sort_time)];
		sort_class = [...new Set(sort_class)];
		sort_tradeclass = [...new Set(sort_tradeclass)];
		sort_price = [...new Set(sort_price)];
  });
 
  //查詢資料庫

	db.query(db_select, function(err, rows) {
		if (err) {
			console.log(err);
		}
    data = rows;
    console.log(sort_price);
    res.render('index', {
      title: 'Goods Information',
      data: data,
      sort_where_time: sort_where_time,
      sort_where_class: sort_where_class,
      sort_where_tradeclass: sort_where_tradeclass,
      sort_where_price: sort_where_price,
      sort_time: sort_time,
      sort_class: sort_class,
      sort_tradeclass: sort_tradeclass,
      sort_price: sort_price,
      changeyymmdd:changeyymmdd
    });
  });
  
  //顯示
	
});
function changeyymmdd(getdate) {
  let nowDate = getdate;
  let year = nowDate.getFullYear();
  let month = nowDate.getMonth() + 1;
  let day = nowDate.getDate();
  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  return year + '-' + month + '-' +day;
}

module.exports = router;
