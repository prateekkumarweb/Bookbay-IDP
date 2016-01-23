$(document).ready(function(){
    
    $("#comment").focus(function(){
        $(this).attr("disabled","disabled");
        $("#first").css("display","block");
        $("#aa").attr("href","#first");
    });
    $("#cname").focus(function(){
        $("#second").slideDown();
    });
    
    // For Login
    (function(){
        $("#clogin").click(function(){
            var c=0;
            if (($("#cusername").val()=="")||($("#cpassword").val()=="")){
            $("#cinvalidcr").html("Invalid Credentials");
            }
            else{
                $("#cinvalidcr").html("");
                c=1;
            }
            
            if (c==1){
                window.open("book.html","_self");
            }
        })
    })();
    
    // For Signup
    (function(){
        $("#cname").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pcname").html("This cannot be empty");    
            }
            else{
                $("#pcname").html("");
            }
        });
        
        $("#cemail").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pcemail").html("This cannot be empty");    
            }
            else{
                $("#pcemail").html("");
            }
        });
        
        $("#cspassword").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pcspassword").html("This cannot be empty");    
            }
            else{
                $("#pcspassword").html("");
            }
        });
        
        $("#cscpassword").on("blur keyup",function(){
            if ($(this).val()==""){
                $("#pcscpassword").html("This cannot be empty");    
            }
            else{
                $("#pcscpassword").html("");
            }
        });
        
        $("#csignup").click(function(){
         if (($("#cname").val()=="")||($("#cemail").val()=="")||($("#cspassword").val()=="")||($("#cscpassword").val()=="")){
            if($("#cname").val()==""){
                $("#pcname").html("This cannot be empty");
            }
         
            if($("#cemail").val()==""){
                $("#pcemail").html("This cannot be empty");
            }
         
            if($("#cspassword").val()==""){
                $("#pcspassword").html("This cannot be empty");
            }
         
            if($("#cscpassword").val()==""){
                $("#pcscpassword").html("This cannot be empty");
            }
         }
         else if ($("#cspassword").val()!=$("#cscpassword").val()){
                $("#cmismatch").html("Passwords didn't match");
         }
         else{
            $(this).attr({"data-toggle":"modal", "data-target":"#csignup-note"});
         }
    });
    })();
    
    
    (function(){
        function cnfPassword(){
        if($("#cspassword").val()!=$("#cscpassword").val()){
            $("#ccnfPassword").removeClass("has-success").addClass("has-error");
            $("#ccnfPasswordOK").removeClass("glyphicon-ok").addClass("glyphicon-remove");
        }
        else{
            $("#ccnfPassword").removeClass("has-error").addClass("has-success");
            $("#ccnfPasswordOK").removeClass("glyphicon-remove").addClass("glyphicon-ok");
        }
    }
        $("#cspassword,#cscpassword").keyup(function(){
            cnfPassword();
        });
    })();
    
    // rating of the comments
    (function(){
        $("#comment-up").click(function(){
            if($("#comment-up").hasClass("comment-up")){
                var x=Number($("#rev-green").html()),y=Number($("#rev-red").html());
                if($("#comment-down").hasClass("comment-rev-click")){
                    $("#rev-green").html(x+1);    
                    $("#rev-red").html(y+1); 
                }
                else{
                    $("#rev-green").html(x+1);
                }
                $("#comment-up").removeClass("comment-up").addClass("comment-rev-click");
                $("#comment-down").removeClass("comment-rev-click").addClass("comment-down");
                revcolor();
            }
        });
        $("#comment-down").click(function(){
            if($("#comment-down").hasClass("comment-down")){
                var x=Number($("#rev-green").html()),y=Number($("#rev-red").html());
                if($("#comment-up").hasClass("comment-rev-click")){
                    $("#rev-red").html(y-1);    
                    $("#rev-green").html(x-1); 
                }
                else{
                    $("#rev-red").html(y-1);
                }
                $("#comment-down").removeClass("comment-down").addClass("comment-rev-click");
                $("#comment-up").removeClass("comment-rev-click").addClass("comment-up");
                revcolor();
            }
        });
        
    })();
    
    
});    