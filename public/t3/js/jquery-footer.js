$(document).ready(function(){
    $("#contact-us").click(function(){
        $("#send-msg-form").slideDown();
        $(".footer").css("background-color","#101010");
    });
    
    $("#send-msg-collapse,#send-msg").click(function(){
        $("#send-msg-form").slideUp();
        $(".footer").css("background-color","#000000");
    });
});