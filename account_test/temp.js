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
app.get('/userQuery', function(req, res){	
    res.sendFile('/Users/kilin/Documents/GitHub/node_express_test/node_express_test/account_test/userQuery.html');
});
app.get('/account', function(req, res){	
    res.sendFile('/Users/kilin/Documents/GitHub/node_express_test/node_express_test/account_test/account.html');
});
app.post('/queryUser', async function (req, res) {
	console.log('query');
	let data = await query(`SELECT shop_id,account_time,account_class,account_tradeclass,account_price,account_note FROM washing_machine.account_tx union all SELECT  shop_id,time as account_time,'收益' as account_class,'營業收入' account_tradeclass,amount as account_price,memo as account_note FROM washing_machine.tx limit 100;`);
	let account_data=[];
	for(var i=0;i<data.length;i++){
		var shop_id=data[i].shop_id;
		var account_time=data[i].account_time;
		var account_class=data[i].account_class;
		var account_tradeclass=data[i].account_tradeclass;
		var account_price_debit=data[i].account_class=='收益'?data[i].account_price:null;
		var account_price_credit=data[i].account_class=='支出'?data[i].account_price:null;
		var account_note=data[i].account_note;
		account_data.push({shop_id,account_time,account_class,account_tradeclass,account_price_debit,account_price_credit,account_note})
	}
	console.log(data);
	console.log(account_data);
	
	res.send(account_data);
});
app.listen(8081, function(){
    console.log('Listen 8081...');

});

