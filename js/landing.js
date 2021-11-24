function previewProjects() {
    var items = ['item1', 'item2', 'item3', 'item4'];
    var expandeditems = ['item1expanded', 'item2expanded', 'item3expanded', 'item4expanded'];

    for (i = 0; i < items.length; i++) {

        document.getElementById(items[i]).addEventListener("click", function() {
            /* Toggle between adding and removing the "active" class,
            to highlight the button that controls the panel */

                
            for (var j = 0; j < items.length; j++) {
                if (this.id !== items[j]) {
                    document.getElementById(items[j]).classList.remove("expanded-preview-active");
                    document.getElementById(expandeditems[j]).style.opacity = 1;
                    document.getElementById(expandeditems[j]).style.display = "none";
                    document.getElementById(expandeditems[j]).getElementsByClassName("expanded-inner")[0].style.visibility = "hidden";
                } else {
                    this.classList.add("expanded-preview-active");
                    document.getElementById(expandeditems[j]).style.opacity = 1;
                    document.getElementById(expandeditems[j]).style.display = "block";
                    document.getElementById(expandeditems[j]).getElementsByClassName("expanded-inner")[0].style.visibility = "visible";
                }
            }

            /*var transitionTime = 250;

            setTimeout(() => { 
                for (var j = 0; j < items.length; j++) {
                    if (this.id !== items[j]) {
                        document.getElementById(expandeditems[j]).style.display = "none";
                    } else {
                        document.getElementById(expandeditems[j]).style.display = "block";
                    }
                }
                             }, transitionTime)*/

        });

    
    }
}

function changeCss () {
    var navTitleEl = document.getElementById("pagetitle");
    var maxScroll = 100;
    var minScroll = 15;
    var maxTextSize = 60;
    var textSize = 30;

    
    
    if (this.scrollY < minScroll) {
        textSize = maxTextSize;
    }
    else if (this.scrollY < maxScroll) {
        textSize = maxTextSize - this.scrollY / maxScroll * (maxTextSize - textSize);
    } 
    
    navTitleEl.style.fontSize = textSize+"px";
}

window.addEventListener("scroll", changeCss , false);
changeCss();
previewProjects();