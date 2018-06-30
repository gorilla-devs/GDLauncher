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
