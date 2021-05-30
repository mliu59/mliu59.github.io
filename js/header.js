function generateHeader(navSize = "20px", titleSize = "45px", width = "55%", margin = "auto", title = "MILES LIU") {
    var header = document.getElementById("sitenav");
    header.innerHTML = `<div style="width: ` + width + `; margin: ` + margin + `;">
    <div id="pagetitle" style="font-size: ` + titleSize + `;">` + title + `</div>
    <div class="nav">
        <a class="nav-link navtext" style="font-size: ` + navSize + `;" href="https://mliu59.github.io/">HOME</a>
        <a class="nav-link navtext" style="font-size: ` + navSize + `;" href="https://mliu59.github.io/projects">PROJECTS</a>
        <a class="nav-link navtext" style="font-size: ` + navSize + `;" href="mailto:mliu59@jhu.edu">CONTACT</a>
    </div>
</div>
    
    `;
}