$(document).ready(function(){

    $("#search-bar").focus(function(){
        $("#search-bar").animate({width: '200%'});
        $("#search-btn").animate({marginLeft:'14em'});
    });


    $("#signup,#login,#lsignup,#mlogin").click(function(){
        $("#username,#password,#name,#email,#spassword,#scpassword").val("");
        $("#invalidcr,#pname,#pemail,#pspassword,#pscpassword,#mismatch").html("");
        $("#cnfPassword").removeClass("has-success has-error");
        $("#cnfEmailOK,#cnfPasswordOK").removeClass("glyphicon-ok glyphicon-remove");
    });

    //Sign up
     $("#signupform").submit(function(event){

         if (($("#name").val()=="")||($("#email").val()=="")||($("#spassword").val()=="")||($("#scpassword").val()=="")){
            if($("#name").val()==""){
                event.preventDefault();
                $("#pname").html("This cannot be empty");
            }

            if($("#email").val()==""){
                event.preventDefault();
                $("#pemail").html("This cannot be empty");
            }

            if($("#spassword").val()==""){
                event.preventDefault();
                $("#pspassword").html("This cannot be empty");
            }

            if($("#scpassword").val()==""){
                event.preventDefault();
                $("#pscpassword").html("This cannot be empty");
            }
         }
         else if ($("#spassword").val()!=$("#scpassword").val()){
              event.preventDefault();
              $("#mismatch").html("Passwords didn't match");
         }
         
    });

    //Signup
    (function(){
        $("#name").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pname").html("This cannot be empty");
            }
            else{
                $("#pname").html("");
            }
        });

        $("#email").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pemail").html("This cannot be empty");
            }
            else{
                $("#pemail").html("");
            }
        });

        $("#spassword").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pspassword").html("This cannot be empty");
            }
            else{
                $("#pspassword").html("");
            }
        });

        $("#scpassword").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pscpassword").html("This cannot be empty");
            }
            else{
                $("#pscpassword").html("");
            }
        });
    })();

    (function(){
        function cnfPassword(){
        if($("#spassword").val()!=$("#scpassword").val()){
            $("#cnfPassword").removeClass("has-success").addClass("has-error");
            $("#cnfPasswordOK").removeClass("glyphicon-ok").addClass("glyphicon-remove");
        }
        else{
            $("#cnfPassword").removeClass("has-error").addClass("has-success");
            $("#cnfPasswordOK").removeClass("glyphicon-remove").addClass("glyphicon-ok");
        }
    }
        $("#spassword,#scpassword").keyup(function(){
            cnfPassword();
        });
    })();


    //Login - made changes
    (function(){
        $("#loginform").submit(function(event){
            if (($("#username").val()=="")||($("#password").val()=="")){
            $("#invalidcr").html("Username or password field cannot be empty");
            event.preventDefault();
            }
            else{
                $("#invalidcr").html("");

            }
        });
    })();

    // Forgot Password
    (function(){
        $("#reset").click(function(){
            $("#fp-email").val("");
            $("#fp-email-form").removeClass("has-error");
            $("#fp-email-gly").removeClass("glyphicon-remove");
        });
    })();

    //run this code when the email is not registered for forgot password, when clicked on submit
    (function(){
        $("#fp-submit").click(function(){
            $("#fp-email-form").addClass("has-error");
            $("#fp-email-gly").addClass("glyphicon-remove");
        });
    })();

    //And this code if email is registered
  //  (function(){
  //      $("#fp-submit").click(function(){
  //      $("#fp-submit").attr('data-dismiss','modal');
  //      });
  //  })();


});
