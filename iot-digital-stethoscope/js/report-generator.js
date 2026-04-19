class ReportGenerator {
    constructor() {
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF library not loaded');
            return;
        }
        this.jsPDF = window.jspdf.jsPDF;
    }

    generateReport(analysisData, readings) {
        const doc = new this.jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        let yPosition = 20;

        // Add title
        doc.setFontSize(24);
        doc.setTextColor(44, 62, 80);
        doc.text('Digital Stethoscope Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Add date and time
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
        yPosition += 15;

        // Add disclaimer
        doc.setFillColor(255, 243, 205);
        doc.rect(20, yPosition, pageWidth - 40, 25, 'F');
        doc.setTextColor(133, 100, 4);
        yPosition += 10;
        doc.text('DISCLAIMER:', 25, yPosition);
        yPosition += 7;
        doc.setFontSize(10);
        doc.text('This report is for informational purposes only and is not a medical diagnosis.', 25, yPosition);
        yPosition += 5;
        doc.text('Please consult with a qualified healthcare provider.', 25, yPosition);
        yPosition += 15;

        // Add readings section
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Sound Value Readings', 20, yPosition);
        yPosition += 10;
        
        // Create readings table
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        const readings_data = [
            ['Measurement', 'Value'],
            ['Value 1', readings.value1.toString()],
            ['Value 2', readings.value2.toString()],
            ['Value 3', readings.value3.toString()]
        ];
        doc.autoTable({
            startY: yPosition,
            head: [readings_data[0]],
            body: readings_data.slice(1),
            margin: { left: 20 },
            theme: 'grid'
        });
        yPosition = doc.lastAutoTable.finalY + 15;

        // Analysis Results Section
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Analysis Results', 20, yPosition);
        yPosition += 10;

        // Risk Level & Overall Condition
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        const statusColor = this.getStatusColor(analysisData.riskLevel);
        doc.setFillColor(...statusColor);
        doc.rect(20, yPosition, pageWidth - 40, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`Risk Level: ${analysisData.riskLevel}`, 25, yPosition + 10);
        yPosition += 25;

        // Detected Conditions
        doc.setTextColor(44, 62, 80);
        doc.text('Detected Conditions:', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(11);
        doc.setTextColor(52, 73, 94);

        analysisData.diseases.forEach(disease => {
            if (disease.trim()) {
                const lines = doc.splitTextToSize(disease, pageWidth - 50);
                lines.forEach(line => {
                    if (yPosition > doc.internal.pageSize.height - 20) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`• ${line}`, 25, yPosition);
                    yPosition += 7;
                });
            }
        });
        yPosition += 5;

        // Medical Recommendations
        if (yPosition > doc.internal.pageSize.height - 60) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Medical Recommendations', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(11);
        doc.setTextColor(52, 73, 94);
        const recommendations = analysisData.recommendations.split('\n');
        recommendations.forEach(rec => {
            if (rec.trim()) {
                const lines = doc.splitTextToSize(rec, pageWidth - 50);
                lines.forEach(line => {
                    if (yPosition > doc.internal.pageSize.height - 20) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`• ${line}`, 25, yPosition);
                    yPosition += 7;
                });
            }
        });
        yPosition += 5;

        // Urgency Level
        if (yPosition > doc.internal.pageSize.height - 40) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Urgency Level', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(11);
        const urgencyColor = this.getUrgencyColor(analysisData.urgency);
        doc.setFillColor(...urgencyColor);
        doc.rect(20, yPosition, pageWidth - 40, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(analysisData.urgency, 25, yPosition + 10);
        yPosition += 25;

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(127, 140, 141);
        const footerText = 'This report was generated automatically by Digital Stethoscope Analysis System.';
        const footerText2 = 'Please consult with a healthcare professional for accurate medical advice.';
        doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });
        doc.text(footerText2, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

        return doc;
    }

    getStatusColor(riskLevel) {
        switch (riskLevel.toLowerCase()) {
            case 'high':
                return [231, 76, 60]; // Red
            case 'medium':
                return [243, 156, 18]; // Orange
            default:
                return [46, 204, 113]; // Green
        }
    }

    getUrgencyColor(urgency) {
        if (urgency.toLowerCase().includes('immediate')) {
            return [231, 76, 60]; // Red
        } else if (urgency.toLowerCase().includes('needed')) {
            return [243, 156, 18]; // Orange
        } else {
            return [52, 152, 219]; // Blue
        }
    }

    addWrappedText(doc, text, x, y, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        words.forEach(word => {
            const testLine = line + word + ' ';
            const testWidth = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize();

            if (testWidth > maxWidth) {
                doc.text(line, x, currentY);
                line = word + ' ';
                currentY += 10;
            } else {
                line = testLine;
            }
        });

        if (line.trim() !== '') {
            doc.text(line, x, currentY);
        }

        return currentY;
    }

    downloadReport(doc) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `medical-report-${timestamp}.pdf`;
            doc.save(filename);
        } catch (error) {
            console.error('Error downloading report:', error);
            throw new Error('Failed to download report');
        }
    }

    exportData(analysisData, readings) {
        const exportData = {
            timestamp: new Date().toISOString(),
            readings: readings,
            analysis: analysisData
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Export the ReportGenerator class
window.ReportGenerator = ReportGenerator;
