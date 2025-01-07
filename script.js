const { jsPDF } = window.jspdf;
let images = [];

// Hent gemte data fra sessionStorage ved indlæsning
window.addEventListener("load", () => {
    const savedImages = JSON.parse(sessionStorage.getItem("images")) || [];
    const savedText1 = sessionStorage.getItem("text1") || "";
    const savedText2 = sessionStorage.getItem("text2") || "";
    const savedPdfName = sessionStorage.getItem("pdfName") || "";

    images = savedImages;

    document.getElementById("text1").value = savedText1;
    document.getElementById("text2").value = savedText2;
    document.getElementById("pdfName").value = savedPdfName;

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
            const index = images.indexOf(imgSrc);
            if (index > -1) images.splice(index, 1);
            preview.removeChild(container);
            saveData();
        };

        container.appendChild(imgElement);
        container.appendChild(deleteBtn);
        preview.appendChild(container);
    });
});

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

                    const container = document.createElement("div");
                    container.className = "preview-container";

                    const imgElement = document.createElement("img");
                    imgElement.src = correctedImg;

                    const deleteBtn = document.createElement("button");
                    deleteBtn.className = "delete-btn";
                    deleteBtn.innerText = "X";
                    deleteBtn.onclick = () => {
                        const index = images.indexOf(correctedImg);
                        if (index > -1) images.splice(index, 1);
                        preview.removeChild(container);
                        saveData();
                    };

                    container.appendChild(imgElement);
                    container.appendChild(deleteBtn);
                    preview.appendChild(container);

                    saveData();
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

    if (width > height) {
        canvas.width = height;
        canvas.height = width;
        ctx.transform(0, 1, -1, 0, height, 0);
    } else {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg");
}

// Funktion til sideskift for tekst
function addTextWithPageBreak(pdf, title, text, x, y, maxWidth, lineHeight, pageHeight, margin) {
    pdf.setFont("helvetica", "bold");
    pdf.text(title, x, y);
    y += lineHeight; // Flyt ned under overskriften

    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line) => {
        if (y + lineHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
            pdf.setFont("helvetica", "bold");
            pdf.text(title, x, y); // Gentag overskriften på ny side
            y += lineHeight;
        }
        pdf.setFont("helvetica", "normal");
        pdf.text(line, x, y);
        y += lineHeight;
    });
}

document.getElementById("generatePdfBtn").addEventListener("click", () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const maxImageHeight = (4 / 6) * (pageHeight - 2 * margin);
    const spaceBetweenBoxes = 5;
    const textBoxWidth = (pageWidth - 2 * margin - spaceBetweenBoxes) / 2;

    images.forEach((image, index) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
            const imgWidth = img.width * 0.264583;
            const imgHeight = img.height * 0.264583;

            const scaleFactor = Math.min((pageWidth - 2 * margin) / imgWidth, maxImageHeight / imgHeight);
            const scaledWidth = imgWidth * scaleFactor;
            const scaledHeight = imgHeight * scaleFactor;

            const xOffset = (pageWidth - scaledWidth) / 2;
            const yOffset = margin;

            if (index > 0) pdf.addPage();
            pdf.addImage(image, "JPEG", xOffset, yOffset, scaledWidth, scaledHeight);

            const textYStart = yOffset + scaledHeight + 10;

            const text1 = document.getElementById("text1").value.trim();
            addTextWithPageBreak(pdf, "Firma/adresse", text1, margin, textYStart, textBoxWidth, 10, pageHeight, margin);

            const text2 = document.getElementById("text2").value.trim();
            const box2XStart = margin + textBoxWidth + spaceBetweenBoxes;
            addTextWithPageBreak(pdf, "Deltagere", text2, box2XStart, textYStart, textBoxWidth, 10, pageHeight, margin);
        };
    });

    setTimeout(() => {
        pdf.save(document.getElementById("pdfName").value.trim() || "GeneratedFile.pdf");
    }, 1000);
});

document.getElementById("text2").addEventListener("focus", function () {
    this.style.overflowY = "scroll"; // Aktivér scroll, når feltet får fokus
});

document.getElementById("text2").addEventListener("blur", function () {
    this.style.overflowY = "hidden"; // Skjul scroll-bar, når feltet mister fokus
});
