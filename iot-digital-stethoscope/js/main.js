document.addEventListener('DOMContentLoaded', function() {
    // Initialize classes
    const geminiAPI = new GeminiAPI();
    const chartManager = new ChartManager();
    const reportGenerator = new ReportGenerator();

    // Get DOM elements
    const stethoscopeForm = document.getElementById('stethoscopeForm');
    const resultsDashboard = document.getElementById('resultsDashboard');
    const healthStatus = document.getElementById('healthStatus');
    const riskLevel = document.getElementById('riskLevel');
    const medicalAnalysis = document.getElementById('medicalAnalysis');
    const downloadReportBtn = document.getElementById('downloadReport');
    const exportDataBtn = document.getElementById('exportData');

    // Store latest analysis results
    let currentAnalysis = null;
    let currentReadings = null;

    // Form submission handler
    stethoscopeForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get input values
        const restingBPM = parseFloat(document.getElementById('restingBPM').value);
        const activityBPM = parseFloat(document.getElementById('activityBPM').value);
        const recoveryBPM = parseFloat(document.getElementById('recoveryBPM').value);
        const system = document.getElementById('system').value;

        // Store current readings
        currentReadings = { restingBPM, activityBPM, recoveryBPM, system };

        try {
            // Show loading state
            resultsDashboard.style.display = 'none';
            stethoscopeForm.querySelector('button').disabled = true;
            stethoscopeForm.querySelector('button').textContent = 'Analyzing...';

            // Get analysis from Gemini API
            const analysis = await geminiAPI.analyzeReadings(restingBPM, activityBPM, recoveryBPM, system);
            currentAnalysis = analysis;

            // Update chart
            chartManager.updateChart(restingBPM, activityBPM, recoveryBPM);

            // Update health status
            updateHealthStatus(analysis, currentReadings);

            // Update risk level
            updateRiskLevel(analysis, currentReadings);

            // Update medical analysis
            updateMedicalAnalysis(analysis);

            // Show results
            resultsDashboard.style.display = 'block';

        } catch (error) {
            console.error('Analysis failed:', error);
            const errorMessage = error.message || 'Failed to analyze readings. Please try again.';
            
            // Show error in the UI
            resultsDashboard.style.display = 'block';
            healthStatus.className = 'alert alert-danger';
            healthStatus.textContent = errorMessage;
            
            // Clear other sections
            riskLevel.className = 'alert';
            riskLevel.textContent = '';
            medicalAnalysis.innerHTML = '';
            chartManager.clearChart();
        } finally {
            // Reset form button
            stethoscopeForm.querySelector('button').disabled = false;
            stethoscopeForm.querySelector('button').textContent = 'Analyze';
        }
    });

    // Download report handler
    downloadReportBtn.addEventListener('click', function() {
        if (!currentAnalysis || !currentReadings) {
            alert('Please analyze the readings first before downloading the report.');
            return;
        }
        
        try {
            const doc = reportGenerator.generateReport(currentAnalysis, currentReadings);
            if (doc) {
                reportGenerator.downloadReport(doc);
            } else {
                throw new Error('Failed to generate report');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        }
    });

    // Helper functions for analysis display
    function getHealthAssessment(readings) {
        const { restingBPM, activityBPM, recoveryBPM } = readings;
        
        // Check resting heart rate
        let message = '';
        let className = '';

        if (restingBPM < 60) {
            message = 'Resting heart rate indicates possible bradycardia. Consult a healthcare provider.';
            className = 'alert-warning';
        } else if (restingBPM > 100) {
            message = 'Resting heart rate indicates possible tachycardia. Consult a healthcare provider.';
            className = 'alert-warning';
        } else if (restingBPM >= 60 && restingBPM <= 100) {
            message = 'Resting heart rate is within normal range.';
            className = 'alert-success';
        }

        return { message, class: className };
    }

    function getRiskAssessment(readings) {
        const { restingBPM, activityBPM, recoveryBPM } = readings;
        
        // Calculate heart rate reserve (HRR)
        const hrr = ((restingBPM - recoveryBPM) / (activityBPM - restingBPM)) * 100;
        
        let message = '';
        let className = '';

        if (hrr >= 12) {
            message = 'Good recovery rate. Low cardiovascular risk.';
            className = 'alert-success';
        } else if (hrr >= 9) {
            message = 'Moderate recovery rate. Medium cardiovascular risk.';
            className = 'alert-warning';
        } else {
            message = 'Poor recovery rate. High cardiovascular risk. Consider consulting a healthcare provider.';
            className = 'alert-danger';
        }

        return { message, class: className };
    }

    function updateHealthStatus(analysis, readings) {
        const status = healthStatus;
        const healthAssessment = getHealthAssessment(readings);
        status.textContent = healthAssessment.message;
        status.className = `alert ${healthAssessment.class}`;
    }

    function updateRiskLevel(analysis, readings) {
        const risk = riskLevel;
        const riskAssessment = getRiskAssessment(readings);
        risk.textContent = riskAssessment.message;
        risk.className = `alert ${riskAssessment.class}`;
    }

    function updateMedicalAnalysis(analysis) {
        const analysisDiv = medicalAnalysis;
        let html = '<div class="analysis-details">';
        
        // Add BPM analysis details
        if (currentReadings) {
            const { restingBPM, activityBPM, recoveryBPM } = currentReadings;
            const recoveryRate = ((activityBPM - recoveryBPM) / (activityBPM - restingBPM)) * 100;
            
            html += `
                <h6>BPM Analysis Details:</h6>
                <ul>
                    <li>Resting Heart Rate: ${restingBPM} BPM - ${getRestingBPMStatus(restingBPM)}</li>
                    <li>Peak Activity Heart Rate: ${activityBPM} BPM - ${getActivityBPMStatus(activityBPM)}</li>
                    <li>Recovery Heart Rate: ${recoveryBPM} BPM</li>
                    <li>Recovery Rate: ${recoveryRate.toFixed(1)}%</li>
                </ul>
                <h6>Recommendations:</h6>
                ${getRecommendations(currentReadings)}
            `;
        }

        html += '</div>';
        analysisDiv.innerHTML = html;
    }

    function getRestingBPMStatus(bpm) {
        if (bpm < 60) return 'Below normal range';
        if (bpm > 100) return 'Above normal range';
        return 'Normal range';
    }

    function getActivityBPMStatus(bpm) {
        if (bpm > 220) return 'Exceeds maximum recommended rate';
        if (bpm > 180) return 'High intensity zone';
        if (bpm > 150) return 'Cardio zone';
        return 'Moderate activity zone';
    }

    function getRecommendations(readings) {
        const { restingBPM, activityBPM, recoveryBPM } = readings;
        let recommendations = '<ul>';

        if (restingBPM < 60 || restingBPM > 100) {
            recommendations += '<li>Schedule a check-up with your healthcare provider to evaluate your resting heart rate.</li>';
        }

        const recoveryRate = ((activityBPM - recoveryBPM) / (activityBPM - restingBPM)) * 100;
        if (recoveryRate < 12) {
            recommendations += '<li>Consider improving cardiovascular fitness through regular exercise.</li>';
            recommendations += '<li>Monitor recovery rate trends over time.</li>';
        }

        recommendations += '<li>Maintain regular physical activity within your target heart rate zone.</li>';
        recommendations += '<li>Stay hydrated and maintain a balanced diet.</li>';
        recommendations += '</ul>';

        return recommendations;
    }

    // Export data handler
    exportDataBtn.addEventListener('click', function() {
        if (currentAnalysis && currentReadings) {
            reportGenerator.exportData(currentAnalysis, currentReadings);
        }
    });

    // Helper functions to update UI
    function updateHealthStatus(analysis) {
        let statusClass = '';
        switch (analysis.condition.toLowerCase()) {
            case 'good':
                statusClass = 'status-good';
                break;
            case 'fair':
                statusClass = 'status-bad';
                break;
            case 'poor':
                statusClass = 'status-critical';
                break;
        }

        healthStatus.className = 'alert ' + statusClass;
        healthStatus.textContent = `Overall Health Status: ${analysis.condition}`;
    }

    function updateRiskLevel(analysis) {
        let riskClass = '';
        switch (analysis.riskLevel.toLowerCase()) {
            case 'low':
                riskClass = 'status-good';
                break;
            case 'medium':
                riskClass = 'status-bad';
                break;
            case 'high':
                riskClass = 'status-critical';
                break;
        }

        riskLevel.className = 'alert ' + riskClass;
        riskLevel.textContent = `Risk Level: ${analysis.riskLevel}`;
    }

    function updateMedicalAnalysis(analysis) {
        let html = `
            <div class="alert alert-warning mb-4">
                <strong>⚠️ Disclaimer:</strong><br>
                This analysis is for informational and educational purposes only.<br>
                It is not a medical diagnosis. Please consult with a qualified healthcare provider.
            </div>
        `;

        // Detected Conditions
        if (analysis.diseases && analysis.diseases.length) {
            html += `
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h6 class="fw-bold mb-0">🏥 Detected Conditions</h6>
                    </div>
                    <div class="card-body">
                        <div class="conditions-list">
            `;
            
            analysis.diseases.forEach(disease => {
                if (disease.trim()) {
                    if (disease.includes(':')) {
                        // Handle condition headers
                        const [header, ...content] = disease.split(':');
                        html += `
                            <div class="condition-group mb-3">
                                <h6 class="condition-header fw-bold">${header.trim()}:</h6>
                                <p class="condition-content ps-3 mb-2">${content.join(':').trim()}</p>
                            </div>
                        `;
                    } else {
                        // Handle bullet points
                        html += `
                            <div class="condition-item mb-2">
                                <span class="bullet-point">•</span>
                                <span class="condition-text ps-2">${disease}</span>
                            </div>
                        `;
                    }
                }
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }

        // Risk Level
        if (analysis.riskLevel) {
            html += `
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h6 class="fw-bold mb-0">⚠️ Risk Assessment</h6>
                    </div>
                    <div class="card-body">
                        <div class="alert ${analysis.riskLevel.toLowerCase() === 'high' ? 'alert-danger' : 
                                         analysis.riskLevel.toLowerCase() === 'medium' ? 'alert-warning' : 'alert-success'}">
                            <strong>Risk Level:</strong> ${analysis.riskLevel}
                        </div>
                    </div>
                </div>
            `;
        }

        // Medical Recommendations
        if (analysis.recommendations) {
            html += `
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h6 class="fw-bold mb-0">💉 Medical Recommendations</h6>
                    </div>
                    <div class="card-body">
                        <div class="recommendations-list">
            `;
            
            // Handle both array and string recommendations
            const recommendations = Array.isArray(analysis.recommendations) 
                ? analysis.recommendations 
                : analysis.recommendations.split('\n');

            recommendations.forEach(rec => {
                if (rec && rec.trim()) {
                    html += `
                        <div class="recommendation-item mb-2">
                            <span class="bullet-point">•</span>
                            <span class="recommendation-text ps-2">${rec}</span>
                        </div>
                    `;
                }
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }

        // Urgency Level
        if (analysis.urgency) {
            html += `
                <div class="card mb-4">
                    <div class="card-header bg-light">
                        <h6 class="fw-bold mb-0">🚨 Urgency Level</h6>
                    </div>
                    <div class="card-body">
                        <div class="alert ${analysis.urgency.toLowerCase().includes('immediate') ? 'alert-danger' : 
                                         analysis.urgency.toLowerCase().includes('needed') ? 'alert-warning' : 'alert-info'}">
                            ${analysis.urgency}
                        </div>
                    </div>
                </div>
            `;
        }

        medicalAnalysis.innerHTML = html;
    }
});
