var db3 = require('db3');
var db = db3.connect({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'shop'
});


//db.select(table, condition, field, callback)
//select `name`, `gender` from `person` where `name` = "Bob";
db.select('goods', {p_price:'899'}, function (err, data) {
    console.log(data)
    //[{name: 'Bob', gender: 'male'}, {name: 'Bob', gender: 'male'}, {name: 'Bob', gender: 'female'}, ...]
db.end(function(err){
        console.log('NICE')
}) 
})