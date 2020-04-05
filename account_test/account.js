const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const mysql = require('mysql');
const express = require('express');
const app = express();
//資料庫設定
const myPool = mysql.createPool({
    connectionLimit: 100,
    host: 'kilincat.servebeer.com',
  port: '5271',
  user: 'firekilin',
  password: '5270', 
  database: 'washing_machine',
});
const session = require('express-session');
var select_account=" SELECT id_account,shop_id,account_time,account_class,account_tradeclass,account_price,account_note,type FROM washing_machine.account_tx ";
var select_tx=" SELECT id_account,shop_id,account_time,account_class,account_tradeclass,account_price,account_note,type From ((SELECT id as id_account,shop_id,time as account_time,'收益' as account_class,'營業收入' as account_tradeclass,amount as account_price,memo as account_note,type FROM washing_machine.tx)as tx ) ";
var select_time=" where account_time BETWEEN DATE_ADD(NOW(), INTERVAL -30 DAY) AND NOW()";
var query = function(sql, values) {
    return new Promise((resolve, reject) => {
        myPool.getConnection(function (err, connection) {
	    if (err) {
		console.log(err);
		reject(err);
	    }
	    else {
		connection.query(sql, values, (err, rows) => {
		    if (err) {
			console.log(err);
			reject(err);
		    }
		    else resolve(rows);
		    connection.release();
		});
	    }
	});
    });
};
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Where I should receive data from JS written in index.html
app.get('/style/account.css',function(req,res){
	res.sendFile(process.cwd()+'/account_test/style/account.css');
});
app.get('/account', function(req, res){	

	res.sendFile(process.cwd()+'/account_test/account.html');
});

var select_filter_shop_id="";
var select_filter_class="";
var select_filter_tradeclass="";
app.post('/queryUser', async function (req, res) {
	var get_filter=req.body.filter;
	var filter_key=req.body.sort_id;
	switch(filter_key){
		case 'shop_id':
			select_filter_shop_id=" and shop_id in(";
			for(var i=0;i<get_filter.length;i++){
				
				select_filter_shop_id+=i==0?"'"+get_filter[i]+"'":",'"+get_filter[i]+"'";
			}
			select_filter_shop_id+=") ";

			break;
		case 'account_class':
			select_filter_class=" and account_class in(";
			for(var i=0;i<get_filter.length;i++){
				
				select_filter_class+=i==0?"'"+get_filter[i]+"'":",'"+get_filter[i]+"'";
			}
			select_filter_class+=") ";
			break;
		case 'account_tradeclasee':
			select_filter_tradeclass=" and account_tradeclass in(";
			for(var i=0;i<get_filter.length;i++){
				
				select_filter_tradeclass+=i==0?"'"+get_filter[i]+"'":",'"+get_filter[i]+"'";
			}
			select_filter_tradeclass+=") ";
			break;		
	}
	//console.log('query');
	//console.log(select_filter_shop_id);
	//console.log(select_account+select_time+select_filter_shop_id+select_filter_class+select_filter_tradeclass+" union all "+select_tx+select_time+select_filter_shop_id+select_filter_class+select_filter_tradeclass);
	let data = await query(select_account+select_time+select_filter_shop_id+select_filter_class+select_filter_tradeclass+" union all "+select_tx+select_time+select_filter_shop_id+select_filter_class+select_filter_tradeclass);

	let account_data=[];
	for(var i=0;i<data.length;i++){
		var id_account=data[i].id_account;
		var type=data[i].type;
		var shop_id=data[i].shop_id;
		var account_time=changeyymmdd(data[i].account_time);

		var account_class=data[i].account_class;
		var account_tradeclass=data[i].account_tradeclass;
		let account_price_debit=data[i].account_class=='收益'?data[i].account_price:null;
		let account_price_credit=data[i].account_class=='支出'?data[i].account_price:null;
		var account_note=data[i].account_note;
		account_data.push({id_account,shop_id,account_time,account_class,account_tradeclass,account_price_debit,account_price_credit,account_note,type})
	}

	var result;
	switch(req.body.sidx){
		case 'shop_id':
			if(req.body.sord=='asc'){
					result = account_data.sort((a, b) => {
						if(a.shop_id==null){
							if(b.shop_id==null){
								return -1;
							}else{
								return 1;
							}
						}else{
							if(b.shop_id==null){
								return -1;
							}else{
								return a.shop_id > b.shop_id? 1: -1;
							}
						}
				  });
				
			}else if(req.body.sord=='desc'){
					result = account_data.sort((a, b) => {
					return a.shop_id < b.shop_id
					  ? 1
					  : -1;
				  });
				
			}
			res.send(result);
		break;
		case 'account_class':
			if(req.body.sord=='asc'){
					result = account_data.sort((a, b) => {
						if(a.account_class==null){
							if(b.account_class==null){
								return -1;
							}else{
								return 1;
							}
						}else{
							if(b.account_class==null){
								return -1;
							}else{
								return a.account_class > b.account_class
								? 1
								: -1;
							}
						}
				  });
				
			}else if(req.body.sord=='desc'){
					result = account_data.sort((a, b) => {
					return a.account_class < b.account_class
					  ? 1
					  : -1;
				  });
				
			}
			res.send(result);
		break;
		case 'account_tradeclass':
			if(req.body.sord=='asc'){
					result = account_data.sort((a, b) => {
						if(a.account_tradeclass==null){
							if(b.account_tradeclass==null){
								return -1;
							}else{
								return 1;
							}
						}else{
							if(b.account_tradeclass==null){
								return -1;
							}else{
								return a.account_tradeclass > b.account_tradeclass
								? 1
								: -1;
							}
						}
				  });
				
			}else if(req.body.sord=='desc'){
					result = account_data.sort((a, b) => {
					return a.account_tradeclass < b.account_tradeclass
					  ? 1
					  : -1;
				  });
				
			}
			res.send(result);
		break;
		case 'account_price_debit':
			if(req.body.sord=='asc'){
					result = account_data.sort((a, b) => {
						if(a.account_price_debit==null){
							if(b.account_price_debit==null){
								return -1;
							}else{
								return 1;
							}
						}else{
							if(b.account_price_debit==null){
								return -1;
							}else{
								return a.account_price_debit > b.account_price_debit
								? 1
								: -1;
							}
						}
				  });
				
			}else if(req.body.sord=='desc'){
					result = account_data.sort((a, b) => {
					return a.account_price_debit < b.account_price_debit
					  ? 1
					  : -1;
				  });
				
			}
			res.send(result);
		break;
		case 'account_price_credit':
			if(req.body.sord=='asc'){
				result = account_data.sort((a, b) => {
				if(a.account_price_credit==null){
					if(b.account_price_credit==null){
						return -1;
					}else{
						return 1;
					}
				}else{
					if(b.account_price_credit==null){
						return -1;
					}else{
						return a.account_price_credit > b.account_price_credit
						? 1
						: -1;
					}
				}
				
			  });
			
			
		}else if(req.body.sord=='desc'){
				result = account_data.sort((a, b) => {
				
				return a.account_price_credit < b.account_price_credit? 1: -1;
			  });
			
		}
			res.send(result);
		break;
		default:
			result = account_data.sort((a, b) => {
				return a.shop_id > b.shop_id
				  ? 1
				  : -1;
			  });
			res.send(result);
		break;
	}
	
	
});

app.post('/queryUser/sort', async function (req, res) {
	
	 
	//console.log(req.query.sort_id);
	let data = await query(`SELECT `+req.query.sort_id+` FROM washing_machine.account_tx `+select_time+` union all SELECT  tx_db.`+req.query.sort_id+` FROM (`+select_tx+select_time+`)as tx_db`);
	let sort_data=[];
	let notrepeat=[];
	switch(req.query.sort_id){
		case 'shop_id':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].shop_id;
				notrepeat.push(sort_list);
			}
		break;
		case 'account_time':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].account_time;
				notrepeat.push(sort_list);
			}
		break;
		case 'account_class':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].account_class;
				notrepeat.push(sort_list);
			}
		break;
		case 'account_tradeclass':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].account_tradeclass;
				notrepeat.push(sort_list);
			}
		break;
		case 'account_price_debit':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].account_price_debit;
				notrepeat.push(sort_list);
			}
		break;
		case 'account_price_credit':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].account_price_credit;
				notrepeat.push(sort_list);
			}
		break;
	}
	
	notrepeat=[...new Set(notrepeat)];
	for(var i=0;i<notrepeat.length;i++){
		var sort_list=notrepeat[i];
		sort_data.push({sort_list});
	}

	//console.log(account_data);
	res.send(sort_data);
});
app.listen(8081, function(){
    console.log('Listen 8081...');

});

// 新增、編輯、刪除功能
app.post('/addPost', async function(req, res){
	let account_price = req.body.account_class=="支出"?req.body.account_price_credit:req.body.account_price_debit;
	var type =  req.body.type;
	var id = req.body.id;
	console.log(req.body.account_time);
	console.log(req.body.account_time);
	var sql = {
		shop_id: req.body.shop_id,
		account_time: req.body.account_time,
		account_class: req.body.account_class,
		account_tradeclass: req.body.account_tradeclass,
		account_note: req.body.account_note,
		account_price
	};
	// 判斷功能狀態
	switch(req.body.oper){
		case 'add':	
			await query('INSERT INTO account_tx SET ?',sql,function(err, rows){
				if (err){
					console.log(err);
				}
			
			});
		break;

		case 'edit':
			if(type=="PAY"){
				
				await query("UPDATE tx SET ? where id_account='"+id+"'",sql,id,function(err, rows){
					if (err){
						console.log(err);
					}
					
				
				});
			}
			else{
				await query("UPDATE account_tx SET ? where id_account='"+id+"'",sql,id,function(err, rows){
					if (err){
						console.log(err);
					}
					
				
				});
			}
		break;

		case 'del':
			if(type=="PAY"){
				await query('DELETE FROM tx WHERE id_account=?',id,function(err, rows){
					if (err){
						console.log(err);
					}
				
				});
	
			}
			else{
				await query('DELETE FROM account_tx WHERE id_account=?',id,function(err, rows){
					if (err){
						console.log(err);
					}
				
				});
	
			}
			
	}
	res.send("200");
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