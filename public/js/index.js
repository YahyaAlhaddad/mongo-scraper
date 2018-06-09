$(document).ready(function() 
{ //sticky navbar  
 $(window).on("scroll", function () {
    if ($(window).scrollTop()) {
        $("#nb").addClass("sticky")
    } else {
        $("#nb").removeClass("sticky")
    }
});
});