function previewProjects() {
    var items = ['item1', 'item2', 'item3'];
    var expandeditems = ['item1expanded', 'item2expanded', 'item3expanded'];

    for (i = 0; i < items.length; i++) {

        document.getElementById(items[i]).addEventListener("click", function() {
            /* Toggle between adding and removing the "active" class,
            to highlight the button that controls the panel */

                
            for (var j = 0; j < items.length; j++) {
                if (this.id !== items[j]) {
                    document.getElementById(items[j]).classList.remove("expanded-preview-active");
                    document.getElementById(expandeditems[j]).style.opacity = 1;
                    document.getElementById(expandeditems[j]).style.display = "none";
                    document.getElementById(expandeditems[j]).getElementsByClassName("col-lg")[0].style.visibility = "hidden";
                } else {
                    this.classList.add("expanded-preview-active");
                    document.getElementById(expandeditems[j]).style.opacity = 1;
                    document.getElementById(expandeditems[j]).style.display = "block";
                    document.getElementById(expandeditems[j]).getElementsByClassName("col-lg")[0].style.visibility = "visible";
                }
            }

        });

    
    }
}

previewProjects();