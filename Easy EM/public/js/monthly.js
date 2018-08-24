$(document).ready(function(){
  var myConfig = {
    "type":"pie",
    "title":{
      "text":"Monthly Expense"
    },
    "legend":{
      "x":"75%",
      "y":"25%",
      "border-width":1,
      "border-color":"gray",
      "border-radius":"5px",
      "header":{
        "text":"Legend",
        "font-family":"Georgia",
        "font-size":12,
        "font-color":"#3333cc",
        "font-weight":"normal"
      },
      "marker":{
        "type":"circle"
      },
      "toggle-action":"remove",
      "minimize":true,
      "icon":{
        "line-color":"#9999ff"
      },
      "max-items":8,
      "overflow":"scroll"
    },
    "plotarea":{
      "margin-right":"30%",
      "margin-top":"15%"
    },
    "plot":{
      "animation":{
           "on-legend-toggle": true, //set to true to show animation and false to turn off
           "effect": 5,
           "method": 1,
           "sequence": 1,
           "speed": 1
      },
      "value-box":{
        "text":"%v",
        "font-size":12,
        "font-family":"Georgia",
        "font-weight":"normal",
            "placement":"out",
            "font-color":"gray",
      },
      "tooltip":{
        "text":"%t: %v (%npv%)",
        "font-color":"black",
        "font-family":"Georgia",
        "text-alpha":1,
        "background-color":"white",
        "alpha":0.7,
        "border-width":1,
        "border-color":"#cccccc",
        "line-style":"dotted",
        "border-radius":"10px",
        "padding":"10%",
        "placement":"node:center"
      },
      "border-width":1,
      "border-color":"#cccccc",
      "line-style":"dotted"
    },
    "series":[  
    ]
  }

  var obj={};
  var database = firebase.database();
  var cnt=0;

  $("#dp-monthly").on("change",function(){
    obj={
    };
    $('#table-monthly').css('visibility','collapse');
    var d = $(this).val();
    var dt = new Date(d);
    var str = dt.toDateString().split(" ");
    myConfig["title"]["text"]=str[1]+" "+str[3];
    var date = dt.valueOf().toString();
    var e = new Date(d);
    e.setMonth(dt.getMonth()+1);
    var edate = e.valueOf().toString();
    $('#monthlyChart').css('visibility','collapse');
    myConfig["series"]=[];
    if(isNaN(date))
      return;
    var user = firebase.auth().currentUser;
    database.ref(user.uid+'/data/').orderByKey().startAt(date).endAt(edate).on("value",function(snapshot){
      var tbody = document.getElementById('tbody-monthly');
      tbody.innerHTML="";
      if(snapshot.val()==null){
        $('#row-monthly').prepend("<div class='alert alert-danger alert-dismissable fade show'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button><strong>Error!</strong> No data available for this month. Please add your entry in the daily section. </div>");
        return;
      }
      var colors=[
        "#cc0000","#ffcc00","#339933","#66ccff","#7c13c1","#9bff54","#0a0a70","#073d06","#e57906","#91118a"
      ]
      var i=0;
      snapshot.forEach(cs => {
        cs.forEach(childSnapshot => {
          if(!obj.hasOwnProperty(childSnapshot.key)){
            obj[childSnapshot.key]=0;
          }
          obj[childSnapshot.key]= obj[childSnapshot.key] + childSnapshot.val();
        });
      });
      for (var key in obj) {
        if(obj[key]==0)
          continue;
        var row = tbody.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = key;
        var cell2 = row.insertCell(1);
        cell2.innerHTML = obj[key];
        myConfig["series"].push({"values":[obj[key]], "background-color":[colors[i]], "text":key});
        i++; 
      }
      $('#table-monthly').css('visibility','visible');
      $('#monthlyChart').css('visibility','visible');
      zingchart.render({ 
        id : 'monthlyChart', 
        data : myConfig, 
        height: 400, 
        width: "100%"
    });
    },function(error){
      if(error)
      alert(error);
    });
  });
});