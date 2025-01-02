const { jsPDF } = window.jspdf;
const images = [];

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
                // Læs EXIF-data for rotation
                EXIF.getData(img, function () {
                    const orientation = EXIF.getTag(this, "Orientation") || 1;
                    const rotatedImg = rotateImage(img, orientation);
                    images.push(rotatedImg);

                    // Tilføj billedet til preview
                    const container = document.createElement("div");
                    container.className = "preview-container";

                    const imgElement = document.createElement("img");
                    imgElement.src = rotatedImg;
                    container.appendChild(imgElement);

                    preview.appendChild(container);
                });
            };
        };
        reader.readAsDataURL(file);
    }
});

// Funktion til at rotere billeder
function rotateImage(img, orientation) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let width = img.width;
    let height = img.height;

    if (orientation === 6 || orientation === 8) {
        canvas.width = height;
        canvas.height = width;
    } else {
        canvas.width = width;
        canvas.height = height;
    }

    switch (orientation) {
        case 2:
            ctx.transform(-1, 0, 0, 1, width, 0); // Flip horisontalt
            break;
        case 3:
            ctx.transform(-1, 0, 0, -1, width, height); // 180 grader
            break;
        case 4:
            ctx.transform(1, 0, 0, -1, 0, height); // Flip vertikalt
            break;
        case 5:
            ctx.transform(0, 1, 1, 0, 0, 0); // 90 grader med flip
            break;
        case 6:
            ctx.transform(0, 1, -1, 0, height, 0); // 90 grader CW
            break;
        case 7:
            ctx.transform(0, -1, -1, 0, height, width); // 90 grader CCW med flip
            break;
        case 8:
            ctx.transform(0, -1, 1, 0, 0, width); // 90 grader CCW
            break;
        default:
            break; // Ingen rotation
    }

    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg");
}

// Generér PDF
document.getElementById("generatePdfBtn").addEventListener("click", () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const pdfName = document.getElementById("pdfName").value.trim() || "GeneratedFile";

    images.forEach((image, index) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
            const imgAspectRatio = img.width / img.height;
            let imgWidth = pageWidth - 2 * margin;
            let imgHeight = imgWidth / imgAspectRatio;

            if (imgHeight > pageHeight - 2 * margin) {
                imgHeight = pageHeight - 2 * margin;
                imgWidth = imgHeight * imgAspectRatio;
            }

            if (index > 0) pdf.addPage();
            pdf.addImage(image, "JPEG", margin + (pageWidth - 2 * margin - imgWidth) / 2, margin, imgWidth, imgHeight);
        };
    });

    setTimeout(() => {
        const text1 = document.getElementById("text1").value.trim();
        const text2 = document.getElementById("text2").value.trim();

        if (text1 || text2) {
            pdf.addPage();
            pdf.text("Overskrift for Tekst 1", margin, margin);
            if (text1) pdf.text(text1, margin, margin + 10);

            pdf.text("Overskrift for Tekst 2", margin, margin + 30);
            if (text2) pdf.text(text2, margin, margin + 40);
        }

        pdf.save(`${pdfName}.pdf`);
    }, 1000);
});
