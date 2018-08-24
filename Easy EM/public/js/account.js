function loginUser() {
  var email = $('#emailIP').val();
  var password = $('#passwordIP').val();
  firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
    var user = firebase.auth().currentUser;
      if(user.emailVerified==false){
        user.updateProfile({
          disabled: true
        });
        $('#modal-verify').modal('show');
      }
      else{
        window.location = "home.html";
    }     
  }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      }
      else {
        alert(errorMessage);
      }
  });
}

function signupUser() {
  var email = $('#emailIP').val();
  var password = $('#passwordIP').val();
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
    var user = firebase.auth().currentUser;
    var database = firebase.database();
    database.ref(user.uid+'/categories/').set({
      "Grocery":"Grocery",
      "Entertainment":"Entertainment",
      "Food":"Food",
      "Vehicles":"Vehicles",
      "Miscellaneous":"Miscellaneous"
    });
    user.sendEmailVerification().then(function() {
      alert('Check your email');
    }).catch(function(error) {
      alert(error);
    });      
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorMessage);
  });
}

function forgotPassword(emailAddress) {
  var auth = firebase.auth();
  auth.sendPasswordResetEmail(emailAddress).then(function() {
    alert('Check your email');
  }).catch(function(error) {
    alert(error);
  });
}

function logoutUser() {
  firebase.auth().signOut().then(function() {
    window.location = "index.html";
  }).catch(function(error) {
    alert(error.message);
  });    
}

function deleteUser(){
  $('#confirmDeleteModal').modal('hide'); 
  var user = firebase.auth().currentUser;
  user.delete().then(function() {
    alert("Account Deleted!");
  }).catch(function(error) {
    alert(error.message);
  });
}

function sendEmail(){
  var user = firebase.auth().currentUser;
  user.sendEmailVerification().then(function() {
    $('#modal-verify').modal('hide');
    alert('Check your email');
  }).catch(function(error) {
    alert(error);
  });      
}

function changePassword(){
  var oldpass = $('#old-pass').val();
  var newpass = $('#new-pass').val();
  var user = firebase.auth().currentUser;
  var user = firebase.auth().currentUser;
  var credential = firebase.auth.EmailAuthProvider.credential(
    user.email, 
    oldpass
 ); 
  user.reauthenticateWithCredential(credential).then(function() {
    user.updatePassword(newpass).then(function() {
      $('#modal-password').modal('hide');
    }).catch(function(error) {
      alert(error.message);
    });
  }).catch(function(error) {
    alert(error.message);
  });
}

function editEmail(){
  var user = firebase.auth().currentUser;
  var email = $('#new-email').val();
  var password = $('#pass').val();
  var credential = firebase.auth.EmailAuthProvider.credential(
    user.email, 
    password
 );
  user.reauthenticateWithCredential(credential).then(function() {
    user.updateEmail(email).then(function() {
      $('#modal-email').modal('hide');
      sendEmail();
    }).catch(function(error) {
      alert(error.message);
    });
  }).catch(function(error) {
    alert(error.message);
  });
}
