var myConfig = {
  "type":"pie",
  "title":{
    "text":"Total Costs"
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
    "max-items":10,
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
};
var database = firebase.database();

$(document).ready(function(){
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      displayAll(user.uid);
    } else {}
  });
});

$(document).on('change','#filter',function () {
  var opt = $('#filter').find(':selected').val();
  $('#table-filter').css('visibility','collapse');
  var cdate = new Date();
  switch (opt) {
    case '1':
      cdate.setDate(cdate.getDate()-1)
      myConfig["title"]["text"]="Last 24 hours";
      break;
    case '2':
      cdate.setDate(cdate.getDate()-7);
      myConfig["title"]["text"]="Last week";
      break;
    case '3':
      cdate.setMonth(cdate.getMonth()-1);
      myConfig["title"]["text"]="Last month";
      break;
    case '4':
      cdate.setFullYear(cdate.getFullYear()-1);
      myConfig["title"]["text"]="Last year";
      break;
    default:
      var user = firebase.auth().currentUser;
  displayAll(user.uid);
      return;
      break;
  }
  var ms = cdate.valueOf();
  var date = ms.toString();
  var user = firebase.auth().currentUser;
  var tbody = document.getElementById('tbody-predef');
  tbody.innerHTML="";
  myConfig["series"]=[];
  var obj={};
  $('#predefChart').css('visibility','collapse');
  database.ref(user.uid+'/data/').orderByKey().startAt(date).on("value",function(snapshot){
    if(snapshot.val()==null){
      $('#row-predef').prepend("<div class='alert alert-danger alert-dismissable fade show'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button><strong>Error!</strong> No data available for this period. Please add your entry using add button in the daily section. </div>");
        return;
      }
    $('#table-filter').css('visibility','visible');
    snapshot.forEach(childSnapshot => {
      childSnapshot.forEach(element => {
        if(!obj.hasOwnProperty(element.key))
          obj[element.key]=0;
        obj[element.key] = obj[element.key]+element.val();
      });
    });
    var colors=[
      "#cc0000","#ffcc00","#339933","#66ccff","#7c13c1","#9bff54","#0a0a70","#073d06","#e57906","#91118a"
    ];
    var i=0;
    for(var key in obj){
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
    $('#predefChart').css('visibility','visible');
    zingchart.render({ 
      id : 'predefChart', 
      data : myConfig, 
      height: 400, 
      width: "100%"
    });
  });
});

function displayAll(uid) {
  var tbody = document.getElementById('tbody-predef');
  tbody.innerHTML="";
  $('#table-filter').css('visibility','collapse');
  myConfig["series"]=[];
  var obj={};  
  $('#predefChart').css('visibility','collapse');
  database.ref(uid+'/data/').on("value",function(snapshot){
    if(snapshot.val()==null){
      $('#row-predef').prepend("<div class='alert alert-danger alert-dismissable fade show'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button><strong>Error!</strong> No data available for this period. Please add your entry using add button in the daily section. </div>");
      return;
    }
    $('#table-filter').css('visibility','visible');
      snapshot.forEach(childSnapshot => {
        childSnapshot.forEach(element => {
        if(!obj.hasOwnProperty(element.key))
          obj[element.key]=0;
        obj[element.key] = obj[element.key]+element.val();
      });
    });
    var colors=[
      "#cc0000","#ffcc00","#339933","#66ccff","#7c13c1","#9bff54","#0a0a70","#073d06","#e57906","#91118a"
    ];
    var i=0;
    for(var key in obj){
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
    $('#predefChart').css('visibility','visible');
    zingchart.render({ 
      id : 'predefChart', 
      data : myConfig, 
      height: 400, 
      width: "100%"
    });
  });
}