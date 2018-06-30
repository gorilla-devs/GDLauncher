------------------------------------ */

$(window).load(function(){
    "use strict";

    setTimeout(function(){
        $('#preloader').velocity({

            opacity: "0",

            complete: function(){
                $("#loading").velocity("transition.shrinkOut", {
                    duration: 3000,
                    easing: [0.7,0,0.3,1],
                }); 
            }
        });

    },1000);

    setTimeout(function(){
        $('#home-wrap').velocity("transition.fadeIn", {

            opacity : "1",

            complete: function(){

            setTimeout(function() {
                $('.text-intro').each(function(i) {
                    (function(self) {
                        setTimeout(function() {
                            $(self).addClass('animated-middle fadeInUp').removeClass('opacity-0');
                        },(i*150)+150);
                        })(this);
                    });
                }, 1200);
            }

        },

        {
            duration: 1000,
            easing: [0.7,0,0.3,1],
        });
        
    },0);

});

$(document).ready(function(){
    "use strict";

    /* ------------------------------------- */
    /* 2. Parallax Mouse ................... */
    /* ------------------------------------- */

    // var mouseX, mouseY;
    // var traX, traY;

    // $(document).mousemove(function(e){
    //     mouseX = e.pageX;
    //     mouseY = e.pageY;

    //     traX = (e.pageX * -1 / 20);
    //     traY = (e.pageY * -1 / 20);

    //     console.log(traX);

    //     $(".overlay").css({
    //         '-webkit-transform': 'translate3d(' + traX + 'px,' + traY + 'px, 0) scale(1)',
    //         '-moz-transform': 'translate3d(' + traX + 'px,' + traY + 'px, 0) scale(1)',
    //         '-ms-transform': 'translate3d(' + traX + 'px,' + traY + 'px, 0) scale(1)',
    //         '-o-transform': 'translate3d(' + traX + 'px,' + traY + 'px, 0) scale(1)',
    //         'transform': 'translate3d(' + traX + 'px,' + traY + 'px, 0) scale(1)'
    //     });
    // });

    /* ------------------------------------- */
    /* 3. Action Buttons ................... */
    /* ------------------------------------- */

    // Actions when user clicks on More Informations
    $('#open-more-info').on( "click", function() {

                $("#info-wrap").toggleClass("show-info");
                $("#home-wrap").toggleClass("hide-left");
           $(".global-overlay").toggleClass("hide-overlay");
             $("#first-inside").toggleClass("hide-top");
            $("#second-inside").toggleClass("hide-bottom");
                $("#back-side").toggleClass("show-side");
             $(".hide-content").toggleClass("open-hide");
          $("#close-more-info").toggleClass("hide-close");
        $('.command-info-wrap').toggleClass('show-command');
         $('.mCSB_scrollTools').toggleClass('mCSB_scrollTools-left');

        setTimeout(function() {
            $("#mcs_container").mCustomScrollbar("scrollTo", "#info-wrap",{
                scrollInertia:500,
                callbacks:false
            });
        }, 350);
    });

    // Actions when user clicks on the closing button
    $('.to-close').on( "click", function() {

                $("#info-wrap").removeClass("show-info");
                $("#home-wrap").removeClass("hide-left");
           $(".global-overlay").removeClass("hide-overlay");
             $("#first-inside").toggleClass("hide-top");
            $("#second-inside").toggleClass("hide-bottom");
                $("#back-side").toggleClass("show-side");
             $(".hide-content").toggleClass("open-hide");
          $("#close-more-info").toggleClass("hide-close");
        $('.command-info-wrap').toggleClass('show-command');
         $('.mCSB_scrollTools').toggleClass('mCSB_scrollTools-left');

        setTimeout(function() {
            $("#mcs_container").mCustomScrollbar("scrollTo", "#info-wrap",{
                scrollInertia:500,
                callbacks:false
            });
        }, 350);
    });

