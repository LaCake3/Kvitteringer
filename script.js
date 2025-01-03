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

            // Tilføj billedet til listen
            images.push(imgSrc);

            // Tilføj billedet til preview med sletteknap
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
            };

            container.appendChild(imgElement);
            container.appendChild(deleteBtn);
            preview.appendChild(container);
        };
        reader.readAsDataURL(file);
    }
});

// Generér PDF
document.getElementById("generatePdfBtn").addEventListener("click", () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = 210; // A4 bredde i mm
    const pageHeight = 297; // A4 højde i mm
    const margin = 10; // 1 cm margin
    const maxImageHeight = (2 / 3) * (pageHeight - 2 * margin); // Max 2/3 af siden til billedet
    const pdfName = document.getElementById("pdfName").value.trim() || "GeneratedFile";

    images.forEach((image, index) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
            let imgWidth = img.width * 0.264583; // Konverter pixels til mm
            let imgHeight = img.height * 0.264583;

            // Roter billedet, hvis det er liggende
            if (imgWidth > imgHeight) {
                const temp = imgWidth;
                imgWidth = imgHeight;
                imgHeight = temp;
            }

            // Skalér billedet til at passe inden for 2/3 af siden
            const scaleFactor = Math.min((pageWidth - 2 * margin) / imgWidth, maxImageHeight / imgHeight);
            const scaledWidth = imgWidth * scaleFactor;
            const scaledHeight = imgHeight * scaleFactor;

            // Center billedet horisontalt
            const xOffset = (pageWidth - scaledWidth) / 2;
            const yOffset = margin;

            if (index > 0) pdf.addPage();
            pdf.addImage(image, "JPEG", xOffset, yOffset, scaledWidth, scaledHeight);

            // Placer tekst i den nederste 1/3
            const textYStart = yOffset + scaledHeight + 10; // Start lige under billedet
            const textBoxWidth = (pageWidth - 3 * margin) / 2; // 2 tekstbokse ved siden af hinanden

            // Tekst 1
            const text1 = document.getElementById("text1").value.trim();
            pdf.setFont("helvetica", "bold");
            pdf.text("Tekst 1", margin, textYStart);
            pdf.setFont("helvetica", "normal");
            pdf.text(text1, margin, textYStart + 10, { maxWidth: textBoxWidth });

            // Tekst 2
            const text2 = document.getElementById("text2").value.trim();
            pdf.setFont("helvetica", "bold");
            pdf.text("Tekst 2", margin + textBoxWidth + margin, textYStart);
            pdf.setFont("helvetica", "normal");
            pdf.text(text2, margin + textBoxWidth + margin, textYStart + 10, { maxWidth: textBoxWidth });
        };
    });

    setTimeout(() => {
        pdf.save(`${pdfName}.pdf`);
    }, 1000);
});
