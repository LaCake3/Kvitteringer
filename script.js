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
            images.push(imgSrc);

            // Opret en container til billedet og sletteknappen
            const container = document.createElement("div");
            container.className = "preview-container";

            // Billedet
            const img = document.createElement("img");
            img.src = imgSrc;

            // Sletteknap
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerText = "X";
            deleteBtn.addEventListener("click", () => {
                // Slet billede fra array og DOM
                const index = images.indexOf(imgSrc);
                if (index > -1) images.splice(index, 1);
                preview.removeChild(container);
            });

            container.appendChild(img);
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
    const pdfName = document.getElementById("pdfName").value.trim() || "GeneratedFile"; // Standardnavn hvis feltet er tomt

    images.forEach((image, index) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
            const imgAspectRatio = img.width / img.height;
            let imgWidth = pageWidth - 2 * margin; // Juster for margin
            let imgHeight = imgWidth / imgAspectRatio;

            if (imgHeight > pageHeight - 2 * margin) {
                imgHeight = pageHeight - 2 * margin;
                imgWidth = imgHeight * imgAspectRatio;
            }

            if (index > 0) pdf.addPage();
            pdf.addImage(image, "JPEG", margin + (pageWidth - 2 * margin - imgWidth) / 2, margin, imgWidth, imgHeight);
        };
    });

    // Tilføj tekst med overskrifter, hvis der er tekst indtastet
    setTimeout(() => {
        const text1 = document.getElementById("text1").value.trim();
        const text2 = document.getElementById("text2").value.trim();

        if (text1 || text2) {
            pdf.addPage();

            let yPosition = margin + 10; // Startplacering for teksten efter overskriften

            if (text1) {
                pdf.setFont("helvetica", "bold");
                pdf.text("Overskrift for Tekst 1", margin, margin);
                pdf.setFont("helvetica", "normal");
                pdf.text(text1, margin, yPosition);
                yPosition += 10; // Flyt til næste tekstblok
            }

            if (text2) {
                pdf.setFont("helvetica", "bold");
                pdf.text("Overskrift for Tekst 2", margin, yPosition);
                pdf.setFont("helvetica", "normal");
                pdf.text(text2, margin, yPosition + 10);
            }
        }

        // Gem PDF med det valgte navn
        pdf.save(`${pdfName}.pdf`);
    }, 1000); // Giv billeder tid til at indlæses
});
