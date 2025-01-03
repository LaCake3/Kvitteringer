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

            // Tilføj billedet til listen og preview
            const img = new Image();
            img.src = imgSrc;

            img.onload = () => {
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

// Funktion til at rotere billedet baseret på EXIF-orientering
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
    const maxImageHeight = (2 / 3) * (pageHeight - 2 * margin);
    const pdfName = document.getElementById("pdfName").value.trim() || "GeneratedFile";

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
        };
    });

    setTimeout(() => {
        pdf.save(`${pdfName}.pdf`);
    }, 1000);
});
