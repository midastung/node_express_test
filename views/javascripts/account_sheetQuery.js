

$(function () {


//會員查詢表格
$('#grid').jqGrid({
url: '/queryUser',
datatype: 'json',
mtype: 'post',
colNames:["編碼",
"日期",
"科目",
"項目",
"現金",
"點數",
"結餘",
"備註"],
colModel: [
{name:'id_set',hidden:true,key:true},
{ name: 'time',sortable:false},
{ name: 'channel',sortable:true},
{ name: 'account_item',sortable:true}, 
{ name: 'money' ,sortable:true},
{ name: 'point' ,sortable:true},
{ name: 'remainder' ,sortable:false},
{ name: 'memo',sortable:false},
],//欄位資訊
rownumbers: true,//是否显示行号。true：显示
rowNum: 11,         //jqGrid預設顯示筆數
rowList:[10,20,1000],	//一頁顯示幾筆資料
rownumWidth: 30,// 行号所在列的宽度
autowidth: true,	//自動調整寬度
pager: '#pager',	//是否開啟分頁
loadonce: false,                 //是否只載入一次
page: 1,			//現在在第幾頁
viewrecords: true,	//是否要看到資料總數
editurl:"/addPost",
onSortCol: function(name,index){
   
 if(name=='money'||name=='point'){
    $('#grid').jqGrid('setGridParam',{url:'/queryUser'}).trigger('reloadGrid');
 } else{
    
    sort_window(name);
 }
 return "stop";
},
ondblClickRow: function(id){ alert("You double click row with id: "+id);},
viewrecords: true, // show the current page, data rang and total records on the toolbar
caption: "Load jqGrid through Javascript Array",
gridComplete: function(){
}


});
$('#grid').jqGrid('navGrid','#pager',
{
edit:false,
add:true, addtitle: "Add Post", width: 500,
del:false,
search:false,
refresh:false,
},
{closeAfterEdit: true,reloadAfterSubmit: true},
{closeAfterAdd: true,reloadAfterSubmit: true},{},)

});




$('#sort_table').jqGrid({
url: '/queryUser/sort?sort_id=shop_id',
datatype: 'json',
mtype: 'post',
colNames:["篩選項目"],
colModel: [
{ name: 'sort_list' ,key:true,sortable:false}
],//欄位資訊
multiselect: true,
rownumbers: true,//是否显示行号。true：显示
rowNum:10,
rowList:[10,20,30],	//一頁顯示幾筆資料
rownumWidth: 30,// 行号所在列的宽度
autowidth: true,	//自動調整寬度
pager: false,	//是否開啟分頁
page: 1,			//現在在第幾頁
viewrecords: true,	//是否要看到資料總數

});
function sort_window(sort_id) {
    $("#sort_content")[0].innerHTML="<button onclick='sort_sord(`asc`,`"+sort_id+"`)'>A-Z排序</button><button onclick='sort_sord(`desc`,`"+sort_id+"`)'>Z-A排序</button>";
    $("#sort_table").jqGrid('setGridParam', {
        url: '/queryUser/sort?sort_id='+sort_id
    }
    ).trigger('reloadGrid');
    $("#sortModal")[0].style.display="block";
    $(".sort_close")[0].onclick=function() {
        $("#sortModal")[0].style.display="none";
    }
    var filter=[];
    $("#sort_table_btn")[0].onclick=function() {
        $("#sortModal")[0].style.display="none";
        //alert( $("#sort_table").jqGrid('getGridParam','selarrrow'));
        filter.length=0;
        filter=$("#sort_table").jqGrid('getGridParam', 'selarrrow');
        $('#grid').jqGrid('setGridParam', {
            url:'/queryUser', delData:filter, postData: {
                filter, sort_id
            }
        }
        ).trigger('reloadGrid');
        $('#grid').jqGrid('clearGridData'); //清空表格  数据
        /*
     * 先清空条件
     * jqgrid postData setGridParam 调用多次时查询条件会累加
     */
        var postData=$('#grid').jqGrid("getGridParam", "postData");
        $.each(postData, function (k, v) {
     
            if(k!='shopID'&&k!='startDate'&&k!='endDate'){
                delete postData[k];
            }
           
        }
        );
    }
}

function sort_sord(sort_order, sort_id) {
    $('#grid').jqGrid('setGridParam', {
        sortname: sort_id, sortorder:sort_order, onSelectAll:function(aRowids, status) {}
    }
    ).trigger('reloadGrid');
}

//按下選擇商店
var shop = $('#shop').kendoDropDownList({
    dataTextField: 'name',
    dataValueField: 'id',
    dataSource: {
        transport: {
            read: {
                url: '/queryShop',
                type: 'post'
            }
        }
    },
    change: function () {
        //setCookie('shop',shop.value());
       // $('#errMsg').hide();
        
        //切換商店時以該商店名稱重新載入該店設備
        $('#grid').setGridParam({
            postData: {
                shopId: shop.value()
            }
        }).trigger('reloadGrid');
        flag=0;
    },
    dataBound: function () {
        //先清空後再建 grid，防止第二次建以後會壞掉
        $('#grid').GridUnload();
        $('#grid').jqGrid({
            url: '/queryUser',
            datatype: 'json',
            mtype: 'post',
            colNames:["編碼",
            "日期",
            "科目",
            "項目",
            "現金",
            "點數",
            "結餘",
            "備註"],
            colModel: [
            {name:'id_set',hidden:true,key:true},
            { name: 'time',sortable:false},
            { name: 'channel',sortable:true},
            { name: 'account_item',sortable:true}, 
            { name: 'money' ,sortable:true},
            { name: 'point' ,sortable:true},
            { name: 'remainder' ,sortable:false},
            { name: 'memo',sortable:false},
            ],//欄位資訊
            rownumbers: true,//是否显示行号。true：显示
            rowNum: 11,         //jqGrid預設顯示筆數
            rowList:[10,20,1000],	//一頁顯示幾筆資料
            rownumWidth: 30,// 行号所在列的宽度
            autowidth: true,	//自動調整寬度
            pager: '#pager',	//是否開啟分頁
                        //是否只載入一次
            page: 1,
            postData: shop.value(),			//現在在第幾頁
            viewrecords: true,	//是否要看到資料總數
            editurl:"/addPost",
            onSortCol: function(name,index){
               
             if(name=='money'||name=='point'){
                $('#grid').jqGrid('setGridParam',{url:'/queryUser'}).trigger('reloadGrid');
             } else{
                
                sort_window(name);
             }
             return "stop";
            },
            ondblClickRow: function(id){ alert("You double click row with id: "+id);},
            viewrecords: true, // show the current page, data rang and total records on the toolbar
            caption: "Load jqGrid through Javascript Array",
            gridComplete: function(){
            }
            
            
            });
    }
}).data('kendoDropDownList');

	//日期區間控制項
	$('#startDate, #endDate').kendoDatePicker({
		format: 'yyyy/MM/dd',
		value: new Date()
	});
	var startDate = $('#startDate').data('kendoDatePicker');
	var endDate = $('#endDate').data('kendoDatePicker');
	var today;
	//去撈 cookie 紀錄的商店條件
	//var cookieShop = getCookie('shop');
	var shopId = $('#shopId').val();
	if(shopId != null && shopId != ''){
		$('#shop').data('kendoDropDownList').value(shopId);
		$('#shop').data('kendoDropDownList').trigger('change');
	}
	//日期區間設為今日
	$('#today').click(function () {
		today = new Date();
		startDate.value(today);
		endDate.value(today);
	});

	//日期區間設為昨日
	$('#yesterday').click(function () {
		today = new Date();
		startDate.value(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
		endDate.value(new Date(today.getFullYear(), today.getMonth(), today.getDate() ));
	});
    //日期區間設為這禮拜
    $('#thisWeek').click(function () {
      today = new Date();
       startDate.value(new Date(today.getFullYear(), today.getMonth(), today.getDate()-7));
     endDate.value(new Date(today.getFullYear(), today.getMonth(),today.getDate()));
    }); 
	//日期區間設為這個月
	$('#thisMonth').click(function () {
		today = new Date();
		startDate.value(new Date(today.getFullYear(), today.getMonth(), 1));
		//月份的第一天減 1 就是上個月最後一天
		endDate.value(new Date(today.getFullYear(), today.getMonth() + 1, 0));
	});

	//日期區間設為季
	$('#thisSeason').click(function () {
		today = new Date();
		startDate.value(new Date(today.getFullYear(), today.getMonth()-4, 1));
		//月份的第一天減 1 就是上個月最後一天
		endDate.value(new Date(today.getFullYear(), today.getMonth() + 1, 0));
	});
//日期區間設為年
$('#thisYear').click(function () {
    today = new Date();
    startDate.value(new Date(today.getFullYear(), 0, 1));
    //月份的第一天減 1 就是上個月最後一天
    endDate.value(new Date(today.getFullYear(), today.getMonth() + 1, 0));
});

	
$('#query').click(function () {
      //先清空後再建 grid，防止第二次建以後會壞掉
      $('#grid').GridUnload();
      $('#grid').jqGrid({
          url: '/queryUser',
          datatype: 'json',
          mtype: 'post',
          colNames:["編碼",
          "日期",
          "科目",
          "項目",
          "現金",
          "點數",
          "結餘",
          "備註"],
          colModel: [
          {name:'id_set',hidden:true,key:true},
          { name: 'time',sortable:false},
          { name: 'channel',sortable:true},
          { name: 'account_item',sortable:true}, 
          { name: 'money' ,sortable:true},
          { name: 'point' ,sortable:true},
          { name: 'remainder' ,sortable:false},
          { name: 'memo',sortable:false},
          ],//欄位資訊
          rownumbers: true,//是否显示行号。true：显示
          rowNum: 11,         //jqGrid預設顯示筆數
          rowList:[10,20,1000],	//一頁顯示幾筆資料
          rownumWidth: 30,// 行号所在列的宽度
          autowidth: true,	//自動調整寬度
          pager: '#pager',	//是否開啟分頁
                      //是否只載入一次
          page: 1,
          postData: {shopId:shop.value(),startDate: $('#startDate').val(),
          endDate: $('#endDate').val(),
        },			//現在在第幾頁
          viewrecords: true,	//是否要看到資料總數
          editurl:"/addPost",
          onSortCol: function(name,index){
             
           if(name=='money'||name=='point'){
              $('#grid').jqGrid('setGridParam',{url:'/queryUser'}).trigger('reloadGrid');
           } else{
              
              sort_window(name);
           }
           return "stop";
          },
          ondblClickRow: function(id){ alert("You double click row with id: "+id);},
          viewrecords: true, // show the current page, data rang and total records on the toolbar
          caption: "Load jqGrid through Javascript Array",
          gridComplete: function(){
          }
          
          
          });
});