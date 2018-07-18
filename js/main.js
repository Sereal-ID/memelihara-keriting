let transitionDiv = document.getElementById("transition")
var animationHorizontal = bodymovin.loadAnimation({
    container: transitionDiv, // Required
    path: 'bodymovin/horizontal.json', // Required
    renderer: 'canvas', // Required
    loop: false, // Optional
    autoplay: false, // Optional
    name: "Hello World", // Name for future reference. Optional.
})

var FadeTransition = Barba.BaseTransition.extend({
    start: function() {
        Promise
            .all([this.newContainerLoading])
            .then(this.fadeIn.bind(this))
    },

    fadeIn: function() {
        var _this = this
        var $el = $(this.newContainer)
        var $old_el = $(this.oldContainer)

        // $(this.oldContainer).hide()

        // oldContent.style.position = 'absolute'
        $el.css({
            visibility : 'visible',
            opacity : 0
        })

        transitionDiv.style.visibility = "visible"
        animationHorizontal.stop()

        animationHorizontal.onComplete = function(e) {
            transitionDiv.style.visibility = "hidden"
            _this.done()
        }

        animationHorizontal.onEnterFrame = function(e) {
            if (e.currentTime > 40) {
                this.removeEventListener('enterFrame', animationHorizontal.onEnterFrame)
                
                $old_el.hide()
                window.scrollTo(0,0)
                $el.css({
                    opacity: 1
                })
            }
        }
    
        animationHorizontal.play()
    }
})

Barba.Pjax.getTransition = function() {
    return FadeTransition
}

Barba.Dispatcher.on('newPageReady', function(current, prev, container) {
    history.scrollRestoration = 'manual';
});

var gameView = Barba.BaseView.extend({
    namespace: 'game-container',
    onEnter: function() {
        init()
    }
})

gameView.init()

Barba.Pjax.start();