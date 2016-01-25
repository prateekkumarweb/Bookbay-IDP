$(document).ready(function(){
    //Upload
    $("#upload-book").click(function(){
        $("#bk-file").slideUp();
        $("#bk-link").slideDown();
        $("#upbk-name").val("");
        $("#upbk-course").val("");
        $("#upbk-link").val("");
        $("#upbk-file").val("");
    });

    $("#enter-file").click(function(){
        $("#bk-link").slideUp();
        $("#bk-file").slideDown();
    });
    $("#enter-link").click(function(){
        $("#bk-file").slideUp();
        $("#bk-link").slideDown();
    });

    $("#up-bk-submit").click(function(){
        if(($("#upbk-name").val()=="") || ($("#upbk-course").val()=="") || (($("#upbk-link").val()=="") && ($("#upbk-file").val()==""))){
           $("#upbk-error").css('display','block');
           }
        else{
            $("#up-bk-submit").attr({'data-dismiss':"modal",'data-toggle':"modal",'data-target':"#upld-bk-thank"});
        }

    });

    //Request
    $("#request-book").click(function(){
        $("#reqbk-name").val("");
        $("#reqbk-Aname").val("");
        $("#reqbk-course").val("");
    });

    $("#req-bk-submit").click(function(){
        if(($("#reqbk-name").val()=="") || ($("#reqbk-course").val()=="") || ($("#reqbk-Aname").val()=="")){
           $("#reqbk-error").css('display','block');
           }
        else{
            $(this).addClass("disabled").html("Please wait");
            $.post("/u/user/book/request", {name: $("#reqbk-name").val(), course: $("#reqbk-course").val(), author: $("#reqbk-Aname").val()}, function(data, status){
                if (status == "success" && data == true) {
                    $(this).removeClass("disabled").html("Submit");
                    $("#req-bk").modal("hide"); 
                    $("#req-bk-thank").modal("show");
                 } else alert("Error occured.");
            });
        }

    });

});

// $("#up-bk-submit").attr('data-dismiss','modal');
