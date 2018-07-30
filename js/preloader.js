var preloaderCanvas = document.getElementById("preloaderCanvas")

preloaderCanvas.width = document.documentElement.clientWidth
preloaderCanvas.height = document.documentElement.clientHeight

var preloaderCtx = preloaderCanvas.getContext('2d')

var preloaderImage = new Image()
preloaderImage.src = 'img/cewe_loading-01.png'

var numCols = 3
var columnWidth = 839 / numCols
var columnHeight = 169

var posX = (preloaderCanvas.width - columnWidth) / 2
var posY = (preloaderCanvas.height - columnHeight) / 2

var currentIndex = 0

var srcX = 0, srcY = 0

var myReq

function updatePreloaderImage() {
    myReq = setTimeout(updatePreloaderImage, 800)
    preloaderCtx.clearRect(posX, posY, columnWidth, columnHeight)
    currentIndex = (currentIndex + 1) % numCols
    srcX = currentIndex * columnWidth
    
    preloaderCtx.drawImage(preloaderImage, srcX, srcY, columnWidth, columnHeight, posX, posY, columnWidth, columnHeight)
}

$(document).ready(function() {
    $('.preloader-wrapper').show()
    $('body').addClass('preloader-site')
    
    updatePreloaderImage()
})

window.addEventListener('load', function(e) {
    
    setTimeout(function() {
        $('#preloaderCanvas').fadeOut()
        clearInterval(myReq)

        setTimeout(function() {
            $('.intro').animate({opacity: '1'}, 800)
            
            setTimeout(function() {
                $('.intro').animate({opacity: '0'}, 1000)
    
                setTimeout(function() {
                    $('.preloader-wrapper').fadeOut()
                    $('body').removeClass('preloader-site')
                }, 2000)
            }, 2000)
        }, 800)


    }, 2000)

})