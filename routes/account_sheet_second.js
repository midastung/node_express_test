const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const mysql = require('mysql');
const app=require('../services/server')
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
	res.sendFile(process.cwd()+'/views/style/account.css');
});
app.get('/javascripts/account_sheetQuery.js',function(req,res){
	res.sendFile(process.cwd()+'/views/javascripts/account_sheetQuery.js');
});
app.get('/account', function(req, res){	
	res.sendFile(process.cwd()+'/views/account.html');
});

today = new Date();
//設定資料庫select
var select_account="SELECT date_format(time,'%Y-%m-%d') as time,shop_id, '' as emp_login,'' as equipment_id,name,channel,type,sum(amount) as amount,memo FROM washing_machine.account_tx";
var select_tx="select date_format(time,'%Y-%m-%d') as time,shop_id,emp_login,equipment_id,name,channel,type,sum(amount) as amount,memo from (SELECT time,tx.shop_id,tx.emp_login,tx.equipment_id,equipment.name,tx.channel,tx.type,tx.amount,tx.memo FROM washing_machine.tx LEFT JOIN washing_machine.equipment on tx.equipment_id=equipment.id or tx.emp_login=equipment.id) as tx_account";
var select_time=" where time BETWEEN '2020-04-04' AND '2020-04-04'";
var select_shop=" and shop_id='BD1'";
var select_order=" group by date_format(time,'%Y-%m-%d'),equipment_id order by time desc";
//設定多重篩選
var select_filter_channel="";
var select_filter_account_item="";

app.post('/queryShop', async function (req, res) {
    let data = await query("SELECT id,name FROM washing_machine.shop;");
    let shopvalue=[];
    for(var i=0;i<data.length;i++){
        let id=data[i].id;
        let name=data[i].name;
        shopvalue.push({id,name});
    }
   
    res.send(shopvalue);
});

app.post('/queryUser', async function (req, res) {
    var startDate=req.body.startDate;
    var endDate=req.body.endDate;
    if(startDate!=null&&endDate!=null&&endDate!=""&&startDate!=""){
        select_time=" where time between '"+startDate+"' and '"+endDate+"'";
    }
	var get_filter=req.body.filter;
    var filter_key=req.body.sort_id;
    if(req.body.shopId!=undefined){
        select_shop=" and shop_id='"+req.body.shopId+"'";
    }

    //做篩選
	switch(filter_key){
		case 'channel':
			select_filter_channel=" and channel in(";
			for(var i=0;i<get_filter.length;i++){
				select_filter_channel+=i==0?"'"+get_filter[i]+"'":",'"+get_filter[i]+"'";
			}
			select_filter_channel+=") ";
			break;
		case 'account_item':
			select_filter_account_item=" and name in(";
			for(var i=0;i<get_filter.length;i++){
				select_filter_account_item+=i==0?"'"+get_filter[i]+"'":",'"+get_filter[i]+"'";
			}
			select_filter_account_item+=") ";
			break;
    }
    
    //select資料庫
    let data = await query(select_account+select_time+select_shop+select_filter_channel+select_filter_account_item+" union all "+select_tx+select_time+select_shop+select_filter_channel+select_filter_account_item+select_order);
    console.log(select_account+select_time+select_shop+select_filter_channel+select_filter_account_item+" union all "+select_tx+select_time+select_shop+select_filter_channel+select_filter_account_item+select_order);
    let account_data=[];
    let remainding=0;
    let remainder_list=[];
    for(var i=data.length-1;i>=0;i--){
        if(data[i].channel=='POINT' && data[i].type==null){
            remainding-=data[i].amount;
        }else{
            remainding+=data[i].amount;
            
        }
        remainder_list.push(remainding);
    }
    let money_total=0;
    let point_total=0;
    let subpoint_total=0;
    let bill_total=0;
	for(var i=0;i<data.length-1;i++){
		var id_set=i+1;
		var time=data[i].time;
		var channel=data[i].channel;
		var account_item=data[i].name;
        let money;
        if(data[i].channel=='POINT'){
            money="";
        }else{
            money=data[i].amount;
            
        }
        let point="";
        let subpoint="";
        if(data[i].channel=='POINT'){
           
            if(data[i].type==null){
                point=-data[i].amount;
                subpoint=-data[i].amount;
            }else{
                point=data[i].amount;
            }
        }
        let bill="";
        if(data[i].channel=='BILL'){
           bill=data[i].amount;
        }
        let remainder=remainder_list[data.length-(i+1)];
		let memo=data[i].memo!=null?data[i].memo:data[i].name;
        account_data.push({id_set,time,channel,account_item,money,point,remainder,memo})
        money_total+= isNaN(parseInt(money))?0:parseInt(money);
        point_total+=isNaN(parseInt(point))?0:parseInt(point);
        subpoint_total+=isNaN(parseInt(subpoint))?0:parseInt(subpoint);
        bill_total+=isNaN(parseInt(bill))?0:parseInt(bill);
     
    }
    var id_set=0;
        var channel="結算  ";
        var account_item="兌幣或修改:"+bill_total;
        var money="金額總計:"+money_total;
        var point="點數總計:"+point_total;
        var remainder="抵銷點數:"+subpoint_total;
       
       
        
            var result=account_data;

            switch(req.body.sidx){
                case 'time':
                    if(req.body.sord=='asc'){
                            result = account_data.sort((a, b) => {
                                
                                        return date(a.time) > date(b.time)? 1: -1;
                                    
                                });
                        
                    }else if(req.body.sord=='desc'){
                            result = account_data.sort((a, b) => {
                            return date(a.time) < date(b.time)
                              ? 1
                              : -1;
                          });
                        
                    }
                 
                break;
                case 'money':
                    if(req.body.sord=='asc'){
                            result = account_data.sort((a, b) => {
                                if(a.money==""||a.money==null){
                                    if(b.money==""){
                                        return -1;
                                    }else{
                                        return 1;
                                    }
                                }else{
                                    if(b.money==""||a.money==null){
                                        return -1;
                                    }else{
                                        return a.money > b.money? 1: -1;
                                    }
                                }
                          });
                        
                    }else if(req.body.sord=='desc'){
                            result = account_data.sort((a, b) => {
                            return a.money < b.money
                              ? 1
                              : -1;
                          });
                        
                    }
                 
                break;
                case 'point':
                    if(req.body.sord=='asc'){
                            result = account_data.sort((a, b) => {
                                if(a.point==null||a.point==""){
                                    if(b.point==null||b.point==""){
                                        return -1;
                                    }else{
                                        return 1;
                                    }
                                }else{
                                    if(b.point==null||b.point==""){
                                        return -1;
                                    }else{
                                        return a.point > b.point
                                        ? 1
                                        : -1;
                                    }
                                }
                          });
                        
                    }else if(req.body.sord=='desc'){
                            result = account_data.sort((a, b) => {
                            return a.point < b.point
                              ? 1
                              : -1;
                          });
                        
                    }
                
                break;
                default:
                   
                break;

            }
            result.unshift({id_set,channel,account_item,money,remainder,point})
            res.send(result);
});


app.post('/queryUser/sort', async function (req, res) {
    console.log(select_time);
    console.log(select_shop);
    
    let sort_select=req.query.sort_id=="account_item"?"name":req.query.sort_id;
    console.log(sort_select);
	let data = await query(`SELECT `+sort_select+` FROM washing_machine.account_tx `+select_time+select_shop+` union all SELECT  `+sort_select+` FROM (`+select_tx+select_time+select_shop+select_order+`)as tx_db`);
    let sort_data=[];
	let notrepeat=[];
	switch(req.query.sort_id){
		case 'channel':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].channel;
				notrepeat.push(sort_list);
			}
		break;
		case 'account_item':
			for(var i=0;i<data.length;i++){
				var sort_list=data[i].name;
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



app.post('/addPost', async function(req, res){
	let account_price = req.body.account_class=="支出"?req.body.account_price_credit:req.body.account_price_debit;
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
	switch(req.body.oper){
		case 'add':
			await query('INSERT INTO account_tx SET ?',sql,function(err, rows){
				if (err){
					console.log(err);
				}
			
			});
		break;

		case 'edit':
			await query("UPDATE account_tx SET ? where id_account='"+id+"'",sql,id,function(err, rows){
				if (err){
					console.log(err);
				}
				
			
			});
		break;

		case 'del':
			await query('DELETE FROM account_tx WHERE id_account=?',id,function(err, rows){
				if (err){
					console.log(err);
				}
			
			});

	}
	res.send("200");
});


//設定日期型態
function changeyymmdd(getdate) {
	let nowDate = getdate;
	let year = nowDate.getFullYear();
	let month = nowDate.getMonth() + 1;
	let day = nowDate.getDate();
	if (month < 10) month = '0' + month;
	if (day < 10) day = '0' + day;
	return year + '-' + month + '-' +day;
  }