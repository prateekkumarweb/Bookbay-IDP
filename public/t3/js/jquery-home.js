$(document).ready(function(){
    
    $("#scrollDown").click(function(event){     
        event.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top}, 1000);
    });
    
   //Sign Up request 
   $(".signupreq-btn").mouseover(function(){
       $(".signupreq-btn-box").css({"background": "white",'transition':'background 0.5s'});
        $(".signupreq-btn").css({"background-color":"#006680" , "color":"white",'transition':'background-color 0.5s,color 0.5s'});
        $(".signupreq").css({"background": "linear-gradient(to left, white , #006680)" , "color":"white",'text-shadow': '0 0 0, 0 0 5px #006680','transition':'background 0.5s,color 0.5s'});
    });
    $(".signupreq-btn").mouseout(function(){
        $(".signupreq-btn-box").css({"background": "linear-gradient(to right, white , #006680)",'transition':'background 0.5s'});
        $(".signupreq-btn").css({"background-color":"white" , "color":"#006680",'transition':'background-color 0.5s,color 0.5s'});
        $(".signupreq").css({"background":"white" , "color":"#006680",'text-shadow': '0 0 0, 0 0 2px #006680','transition':'background 0.5s,color 0.5s'});
    });
    
    //Select Course
    /*$(".selectcourse,.selectcourse-text").mouseover(function(){
        $(".selectcourse").css({"background-color":"darkmagenta",transition:'background-color 0.5s'});
        $(".selectcourse-text").css({"background-color":"darkmagenta" , "color":"navajowhite",transition:'background-color 0.5s,color 0.5s'});
    });
    
    $(".selectcourse,.selectcourse-text").mouseout(function(){
        $(".selectcourse").css({"background-color":"navajowhite",transition:'background-color 0.5s'});
        $(".selectcourse-text").css({"background-color":"navajowhite" , "color":"darkmagenta",transition:'background-color 0.5s,color 0.5s'});
    }); */   
    
    //Recommended Books
    /*$(".recbook,.recbook-text").mouseover(function(){
        $(".recbook").css({"background-color":"#55f6f6",transition:'background-color 0.5s'});
        $(".recbook-text").css({"background-color":"#0c43e9" , "color":"#55f6f6",transition:'background-color 0.5s,color 0.5s'});
    });
    
    $(".recbook,.recbook-text").mouseout(function(){
        $(".recbook").css({"background-color":"#0c43e9",transition:'background-color 0.5s'});
        $(".recbook-text").css({"background-color":"#55f6f6" , "color":"#0c43e9",transition:'background-color 0.5s,color 0.5s'});
    });*/
});