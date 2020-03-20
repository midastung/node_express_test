const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const mysql = require('mysql');
const express = require('express');
const app = express();
const myPool = mysql.createPool({
    connectionLimit: 100,
    host: 'kilincat.servebeer.com',
  port: '5271',
  user: 'firekilin',
  password: '5270', 
  database: 'washing_machine',
});
const session = require('express-session');
var select_account=" SELECT shop_id,account_time,account_class,account_tradeclass,account_price,account_note FROM washing_machine.account_tx ";
var select_tx=" SELECT shop_id,time as account_time,'收益' as account_class,'營業收入' as account_tradeclass,amount as account_price,memo as account_note FROM washing_machine.tx ";
var select_account_time=" where account_time BETWEEN DATE_ADD(NOW(), INTERVAL -15 DAY) AND NOW()";
var select_tx_time=" where time BETWEEN DATE_ADD(NOW(), INTERVAL -15 DAY) AND NOW()";
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
app.post('/queryUser', async function (req, res) {
	//console.log('query');
	console.log();
	console.log(req.body.sord);
	let data = await query(select_account+select_account_time+" union all "+select_tx+select_tx_time);
	let account_data=[];
	for(var i=0;i<data.length;i++){
		var shop_id=data[i].shop_id;
		var account_time=data[i].account_time;
		var account_class=data[i].account_class;
		var account_tradeclass=data[i].account_tradeclass;
		let account_price_debit=data[i].account_class=='收益'?data[i].account_price:null;
		let account_price_credit=data[i].account_class=='支出'?data[i].account_price:null;
		var account_note=data[i].account_note;
		account_data.push({shop_id,account_time,account_class,account_tradeclass,account_price_debit,account_price_credit,account_note})
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
								return a.shop_id > b.shop_id
								? 1
								: -1;
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
	
	 
	console.log(req.query.sort_id);
	let data = await query(`SELECT `+req.query.sort_id+` FROM washing_machine.account_tx `+select_account_time+` union all SELECT  tx_db.`+req.query.sort_id+` FROM (`+select_tx+select_tx_time+`)as tx_db`);
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

