const { jsPDF } = window.jspdf;
let images = [];

// Hent gemte data fra sessionStorage ved indlæsning
window.addEventListener("load", () => {
    const savedImages = JSON.parse(sessionStorage.getItem("images")) || [];
    const savedText1 = sessionStorage.getItem("text1") || "";
    const savedText2 = sessionStorage.getItem("text2") || "";
    const savedPdfName = sessionStorage.getItem("pdfName") || "";

    images = savedImages; // Gendan billeder

    // Genindlæs tekstfelterne
    document.getElementById("text1").value = savedText1;
    document.getElementById("text2").value = savedText2;
    document.getElementById("pdfName").value = savedPdfName;

    // Gendan preview for billeder
    const preview = document.getElementById("preview");
    savedImages.forEach((imgSrc) => {
        const img = new Image();
        img.src = imgSrc;

        const container = document.createElement("div");
        container.className = "preview-container";

        const imgElement = document.createElement("img");
        imgElement.src = imgSrc;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerText = "X";
        deleteBtn.onclick = () => {
            // Fjern billedet fra listen og DOM
            const index = images.indexOf(imgSrc);
            if (index > -1) images.splice(index, 1);
            preview.removeChild(container);
            saveData(); // Opdater sessionStorage
        };

        container.appendChild(imgElement);
        container.appendChild(deleteBtn);
        preview.appendChild(container);
    });
});

// Gem data i sessionStorage
function saveData() {
    sessionStorage.setItem("images", JSON.stringify(images));
    sessionStorage.setItem("text1", document.getElementById("text1").value.trim());
    sessionStorage.setItem("text2", document.getElementById("text2").value.trim());
    sessionStorage.setItem("pdfName", document.getElementById("pdfName").value.trim());
}

// Håndter billed-upload
document.getElementById("imageUpload").addEventListener("change", (event) => {
    const files = event.target.files;
    const preview = document.getElementById("preview");

    for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgSrc = e.target.result;
            const img = new Image();
            img.src = imgSrc;

            img.onload = () => {
                EXIF.getData(img, function () {
                    const orientation = EXIF.getTag(this, "Orientation") || 1;
                    const correctedImg = ensureVertical(img, orientation);

                    images.push(correctedImg);

                    // Tilføj billedet til preview med slet-knap
                    const container = document.createElement("div");
                    container.className = "preview-container";

                    const imgElement = document.createElement("img");
                    imgElement.src = correctedImg;

                    const deleteBtn = document.createElement("button");
                    deleteBtn.className = "delete-btn";
                    deleteBtn.innerText = "X";
                    deleteBtn.onclick = () => {
                        // Fjern billedet fra listen og DOM
                        const index = images.indexOf(correctedImg);
                        if (index > -1) images.splice(index, 1);
                        preview.removeChild(container);
                        saveData(); // Opdater sessionStorage
                    };

                    container.appendChild(imgElement);
                    container.appendChild(deleteBtn);
                    preview.appendChild(container);

                    saveData(); // Gem ændringer
                });
            };
        };
        reader.readAsDataURL(file);
    }
});

// Funktion til at sikre vertikal orientering
function ensureVertical(img, orientation) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let width = img.width;
    let height = img.height;

    // Tving rotation, hvis billedet er horisontalt
    if (width > height) {
        canvas.width = height;
        canvas.height = width;
        ctx.transform(0, 1, -1, 0, height, 0); // Roter 90 grader CW
    } else {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg");
}

// Generér PDF
document.getElementById("generatePdfBtn").addEventListener("click", () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = 210; // A4 bredde i mm
    const pageHeight = 297; // A4 højde i mm
    const margin = 10; // 1 cm margin
    const maxImageHeight = (4 / 6) * (pageHeight - 2 * margin); // Max 4/6 af siden til billedet
    const textBoxHeight = (2 / 6) * (pageHeight - 2 * margin); // 2/6 til tekst
    const spaceBetweenBoxes = 5; // Afstand mellem tekstfelter
    const textBoxWidth = (pageWidth - 2 * margin - spaceBetweenBoxes) / 2; // Bredde for hver tekstboks

    images.forEach((image, index) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
            const imgWidth = img.width * 0.264583; // Konverter pixels til mm
            const imgHeight = img.height * 0.264583;

            // Skaler billedet til at passe inden for 4/6 af siden
            const scaleFactor = Math.min((pageWidth - 2 * margin) / imgWidth, maxImageHeight / imgHeight);
            const scaledWidth = imgWidth * scaleFactor;
            const scaledHeight = imgHeight * scaleFactor;

            // Center billedet horisontalt og placer det øverst i den vertikale plads
            const xOffset = (pageWidth - scaledWidth) / 2;
            const yOffset = margin;

            if (index > 0) pdf.addPage();
            pdf.addImage(image, "JPEG", xOffset, yOffset, scaledWidth, scaledHeight);

            // Tekstfelter i den nederste 2/6
            const textYStart = yOffset + scaledHeight + 10;

            // Tekst 1 (venstre side)
            const text1 = document.getElementById("text1").value.trim();
            pdf.setFont("helvetica", "bold");
            pdf.text("Firma/adresse", margin, textYStart);
            pdf.setFont("helvetica", "normal");
            pdf.text(text1, margin, textYStart + 10, { maxWidth: textBoxWidth });

            // Tekst 2 (højre side)
            const text2 = document.getElementById("text2").value.trim();
            const box2XStart = margin + textBoxWidth + spaceBetweenBoxes;
            pdf.setFont("helvetica", "bold");
            pdf.text("Deltagere", box2XStart, textYStart);
            pdf.setFont("helvetica", "normal");
            pdf.text(text2, box2XStart, textYStart + 10, { maxWidth: textBoxWidth });
        };
    });

    setTimeout(() => {
        pdf.save(document.getElementById("pdfName").value.trim() || "GeneratedFile.pdf");
    }, 1000);
});
