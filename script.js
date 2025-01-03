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
            images.push(img);

            // Tilføj billedet til preview
            const container = document.createElement("div");
            container.className = "preview-container";

            const imgElement = document.createElement("img");
            imgElement.src = imgSrc;
            container.appendChild(imgElement);

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
    const pdfName = document.getElementById("pdfName").value.trim() || "GeneratedFile";

    images.forEach((image, index) => {
        const img = new Image();
        img.src = image.src;

        img.onload = () => {
            const imgWidth = img.width * 0.264583; // Konverter pixels til mm
            const imgHeight = img.height * 0.264583;

            // Beregn placering for at sikre margen
            const xOffset = Math.max(margin, (pageWidth - imgWidth) / 2);
            const yOffset = Math.max(margin, (pageHeight - imgHeight) / 2);

            if (index > 0) pdf.addPage();
            pdf.addImage(image.src, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
        };
    });

    setTimeout(() => {
        const text1 = document.getElementById("text1").value.trim();
        const text2 = document.getElementById("text2").value.trim();

        if (text1 || text2) {
            pdf.addPage();

            let yPosition = margin; // Startplacering for teksten på siden

            if (text1) {
                pdf.setFont("helvetica", "bold");
                pdf.text("Overskrift for Tekst 1", margin, yPosition);
                yPosition += 10; // Flyt ned under overskriften
                pdf.setFont("helvetica", "normal");
                pdf.text(text1, margin, yPosition);
                yPosition += 20; // Flyt til næste tekstblok
            }

            if (text2) {
                pdf.setFont("helvetica", "bold");
                pdf.text("Overskrift for Tekst 2", margin, yPosition);
                yPosition += 10; // Flyt ned under overskriften
                pdf.setFont("helvetica", "normal");
                pdf.text(text2, margin, yPosition);
            }
        }

        // Gem PDF med det valgte navn
        pdf.save(`${pdfName}.pdf`);
    }, 1000); // Giv billeder tid til at indlæses
});
