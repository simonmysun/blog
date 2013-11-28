$(window).scroll(function(){
    var s = $(window).scrollTop(),
    d = $(document).height(),
    c = $(window).height();
    scrollPercent = (s / (d-c)) * 100;
    console.log("Current scroll percent: " + scrollPercent);
    $("#bc-post").append("Current scroll percent: " + scrollPercent+ "<br>");
});
