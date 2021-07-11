function changeCss () {
    var navElement = document.querySelector("header");
    var footerEl = document.querySelector("footer");
    var navTitleEl = document.getElementById("pagetitle");
    var maxScroll = 100;
    var minScroll = 15;
    var opacity = 0.92;
    var maxTextSize = 45;
    var textSize = 28;
    if (this.scrollY < minScroll) {
        opacity = 1;
        textSize = maxTextSize;
    }
    else if (this.scrollY < maxScroll) {
        opacity = 1 - this.scrollY / maxScroll * 0.15;
        textSize = maxTextSize - this.scrollY / maxScroll * (maxTextSize - textSize);
    }

    navElement.style.opacity = opacity;
    footerEl.style.opacity = opacity;
    navTitleEl.style.fontSize = textSize+"px";
}

function addButton() {

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
    });
    }
}


window.addEventListener("scroll", changeCss , false);
changeCss();
addButton();
