const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const mysql = require('mysql');
const express = require('express');
const app = express();
const myPool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'laundry',
    password: 'laundry',
    database: 'laundry'
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
    res.sendFile('userQuery.html');
});
app.post('/queryUser', async function (req, res) {
	console.log('query');
	let data = await query(`SELECT login, name, expense, balance FROM emp WHERE shop_id = 'BT1'`);
	res.send(data);
});
app.listen(8081, function(){
    console.log('Listen 8081...');

});

