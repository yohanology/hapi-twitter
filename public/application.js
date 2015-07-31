$(document).ready(function(){

  var Jokrr = function(){

  };

  Jokrr.prototype.signUp = function(username, email, password){
    $.ajax({
      context: this,
      type: 'POST',
      url: '/users',
      data: {
          user: {
            username: username,
            email: email,
            password: password
          }
      },
      dataType: 'json',
      success: function(response){
        console.log('successssss');
      }
    });
  };


  var jokrr = new Jokrr();

  $('#signup-form').submit(function(){
    event.preventDefault();

    var username = $('#username-signup').val();
    var email = $('#email-signup').val();
    var password = $('#password-signup').val();

    jokrr.signUp(username, email, password);

  });


});