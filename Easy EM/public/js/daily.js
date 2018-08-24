$(document).ready(function(){
  var myConfig = {
    "type":"pie",
    "title":{
      "text":"Daily Expense"
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
  };

  var obj={};
  var database = firebase.database();
  var cnt=0;
  
  $('#modal-daily').on('shown.bs.modal', function (e) {
    var date = $('#dp-day').val();
    cnt=0;
    if(date==""){
      alert('Please select a day');
      $('#modal-daily').modal('hide');
    }
  });

  $('#additem').click(function (event) {
    if(cnt>0)
      obj[$('#'+'list'+(cnt-1)).val()]=$('#'+'amount'+(cnt-1)).val();
      event.preventDefault();
      var tbody = document.getElementById('tbody-modal-daily');
      var row = tbody.insertRow();
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var list = document.createElement("select");
      list.classList.add("custom-select");
      list.id="list"+cnt;
      var input = document.createElement("input");
      input.setAttribute("type","number");
      input.setAttribute("step","0.01");
      input.classList.add("form-control");
      input.id="amount"+cnt;
      cell2.appendChild(input); 
      var user = firebase.auth().currentUser;
      database.ref(user.uid+'/categories/').on('value',function(snapshot) {
        list.innerHTML="";
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          var opt = document.createElement("option");
          opt.value=childData;
          opt.innerHTML=childData;
          if(obj[childData]!=null){
            opt.disabled=true;
          }
          list.appendChild(opt);
        });
        cell1.appendChild(list);
      });
      cnt++;
  });

  $('#viewtotal').click(function () {
    var total=0;
      for(var i=0;i<cnt;i++){
        var id="amount"+i;
        var v = $("#"+id).val();
        total = +total + +v;
      }
      $('#daily-total').val(total);
  });

  $('#modal-save').click(function () {
    $('#viewtotal').click();
      myConfig["series"]=[];
      var keyList = new Array();
      var amtList = new Array();
      for(var i=0;i<cnt;i++){
        var id="amount"+i;
        var id2="list"+i;
        keyList.push($('#'+id2).val());
        amtList.push($("#"+id).val());          
      }
      var d = document.getElementById('dp-day').value;
      var de = new Date(d);
      var date = de.valueOf();
      for(var i=0;i<cnt;i++){
        var key = keyList[i];
        obj[key]= +amtList[i];
        if(obj[key]<=0){
          alert("Please enter amount greater than zero");
          return;
        }
      }
      var user = firebase.auth().currentUser;
      database.ref(user.uid+'/data/'+date+'/').set(obj).then(function(){
        var tbody = document.getElementById("tbody-modal-daily");
        tbody.innerHTML="";
        $('#daily-total').val('');
        $('#modal-daily').modal('hide');
      }).catch(function(error){
        alert(error);
      });
  });
  
  $("#dp-day").on("change",function(){
    obj={};
    $('#table-day').css('visibility','collapse');
    var d = $(this).val();
    var dt = new Date(d);
    var date = dt.valueOf();
    myConfig["title"]["text"]=dt.toDateString();
    $('#myChart').css('visibility','collapse');
    myConfig["series"]=[];
    if(isNaN(date))
      return;
    var user = firebase.auth().currentUser;
    database.ref(user.uid+'/data/'+date+'/').on("value",function(snapshot){
      myConfig["series"]=[];
      var tbody = document.getElementById('tbody-day');
      tbody.innerHTML="";
      if(snapshot.val()==null){
        $('#row-daily').prepend('<div id="alert-msg" class="alert alert-danger alert-dismissable fade show"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error!</strong> No data available for this day.</div>');
        return;
      }
      var colors=[
        "#cc0000","#ffcc00","#339933","#66ccff","#7c13c1","#9bff54","#0a0a70","#073d06","#e57906","#91118a"
      ]
      var i=0;
      snapshot.forEach(childSnapshot => {
        var row = tbody.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = childSnapshot.key;
        var cell2 = row.insertCell(1);
        cell2.innerHTML = childSnapshot.val();
        var cell3 = row.insertCell(2);
        var delbtn = document.createElement("button");
        delbtn.id="btn-del"+i;
        delbtn.classList.add("btn");
        delbtn.innerHTML="<i class='fa fa-trash-o' aria-hidden='true'></i>";
        delbtn.classList.add("btn-danger");
        delbtn.setAttribute('data-toggle','modal');
        delbtn.setAttribute('data-target','#modal-delete-entry');
        delbtn.setAttribute('data-whatever',childSnapshot.key);
        var editbtn = document.createElement("button");
        editbtn.id="btn-edit"+i;
        editbtn.classList.add("btn");
        editbtn.innerHTML="<i class='fa fa-pencil-square-o' aria-hidden='true'></i>";
        editbtn.classList.add("btn-warning");
        editbtn.setAttribute('data-toggle','modal');
        editbtn.setAttribute('data-target','#modal-edit-entry');
        editbtn.setAttribute('data-whatever',childSnapshot.key);
        $(editbtn).css('margin-right','20px')
        cell3.appendChild(editbtn);
        cell3.appendChild(delbtn);
        obj[childSnapshot.key]=childSnapshot.val();
        myConfig["series"].push({"values":[childSnapshot.val()], "background-color":[colors[i]], "text":childSnapshot.key});
        i++;
      });
      $('#table-day').css('visibility','visible');
      $('#myChart').css('visibility','visible');
      zingchart.render({ 
        id : 'myChart', 
        data : myConfig, 
        height: 400, 
        width: "100%"
    });
    },function(error){
      if(error)
      alert(error);
    });
  });

  var key;
  $('#modal-delete-entry').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    key = button.data('whatever');
  });

  $('#btn-del-entry').click(function(){
    var user = firebase.auth().currentUser;
    var d = $('#dp-day').val();
    var dt = new Date(d);
    var date = dt.valueOf();
    database.ref(user.uid+'/data/'+date+'/'+key).remove(function (error) {
      if(error){
        alert(error);
      }
      else{
        delete obj[key];
        $('#modal-delete-entry').modal('hide');
      }
    });
  });

  $('#modal-edit-entry').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); 
    key = button.data('whatever');
    $(this).find('.modal-title').text('Edit '+key);
  });

  $('#btn-append').click(function () {
    obj[key] = obj[key] + +$('#amount').val();
    var user = firebase.auth().currentUser;
    var d = $('#dp-day').val();
    var dt = new Date(d);
    var date = dt.valueOf();
    database.ref(user.uid+'/data/'+date+'/').set(obj).then(function(){
      $('#modal-edit-entry').modal('hide');
      $('#amount').val('');
    }).catch(function(error){
      alert(error);
    });
  });

  $('#btn-replace').click(function (){
    obj[key] = +$('#amount').val();
    var user = firebase.auth().currentUser;
    var d = $('#dp-day').val();
    var dt = new Date(d);
    var date = dt.valueOf();
    database.ref(user.uid+'/data/'+date+'/').set(obj).then(function(){
      $('#modal-edit-entry').modal('hide');
      $('#amount').val('');
    }).catch(function(error){
      alert(error);
    });
  });

  $('#addc-btn').click(function(){
    var cat = $('#new-cat').val();
    var user = firebase.auth().currentUser;
    database.ref(user.uid+'/categories/').push(cat).catch(function(error){
      alert(error);
    });
    $('#modal-add-cat').modal('hide');
  });
});
    