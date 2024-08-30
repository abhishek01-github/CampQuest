const image = document.getElementById("image");
image.addEventListener("change", function (e) {
    const imagePreview = document.getElementById("imagePreview");
    imagePreview.innerHTML = "";
    const files = e.target.files;

    for (let file of files) {
        if (file) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            console.log(img.src);
            imagePreview.appendChild(img);
        }
    }
});
