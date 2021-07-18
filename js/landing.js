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
                    document.getElementById(expandeditems[j]).style.opacity = 0;
                    document.getElementById(expandeditems[j]).getElementsByClassName("expanded-inner")[0].style.display = "none";
                } else {
                    this.classList.add("expanded-preview-active");
                    document.getElementById(expandeditems[j]).style.opacity = 1;
                    document.getElementById(expandeditems[j]).getElementsByClassName("expanded-inner")[0].style.display = "block";
                }
            }

        });

    
    }
}

function changeCss () {
    var navTitleEl = document.getElementById("pagetitle");
    var navblock = document.getElementById("navblock");
    var maxScroll = 100;
    var minScroll = 25;
    var maxTextSize = 80;
    var minTextSize = 45;
    var textSize = 80;
    var marginMax = 45;
    var marginMin = 0;
    var margin = 45;

    
    
    if (this.scrollY <= minScroll) {
        textSize = maxTextSize;
        margin = marginMax;
    }
    else if (this.scrollY < maxScroll) {
        textSize = maxTextSize - this.scrollY / maxScroll * (maxTextSize - textSize);
        margin = marginMax - this.scrollY / maxScroll * (marginMax - marginMin);
    } else if (this.scrollY >= maxScroll) {
        textSize = minTextSize;
        margin = marginMin;

    }
    
    navTitleEl.style.fontSize = textSize+"px";
    navblock.style.marginTop = margin+"px";
    navblock.style.marginBottom = margin+"px";
}

window.addEventListener("scroll", changeCss , false);
changeCss();
previewProjects();