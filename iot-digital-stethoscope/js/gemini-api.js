// Gemini API Configuration
const GEMINI_API_KEY = ''; // Replace with your actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent';

class GeminiAPI {
    constructor() {
        if (!GEMINI_API_KEY) {
            console.error('Gemini API key is not configured');
        }
    }

    async analyzeReadings(restingBPM, activityBPM, recoveryBPM, system) {
        try {
            console.log('Starting analysis with values:', { restingBPM, activityBPM, recoveryBPM, system });
            
            if (!Number.isFinite(restingBPM) || !Number.isFinite(activityBPM) || !Number.isFinite(recoveryBPM)) {
                throw new Error('Invalid BPM values. Please enter valid numbers.');
            }

            // Calculate key metrics
            const recoveryDrop = activityBPM - recoveryBPM;
            const hrr = ((activityBPM - recoveryBPM) / (activityBPM - restingBPM)) * 100;

            // Build comprehensive analysis based on selected system
            const analysis = system === 'lung' ? 
                this.analyzeLungSystem(restingBPM, activityBPM, recoveryBPM, recoveryDrop, hrr) :
                this.analyzeHeartSystem(restingBPM, activityBPM, recoveryBPM, recoveryDrop, hrr);

            return analysis;

        } catch (error) {
            console.error('Error analyzing readings:', error);
            throw error;
        }
    }

    analyzeHeartSystem(restingBPM, activityBPM, recoveryBPM, recoveryDrop, hrr) {
        return {
            condition: this.determineCondition(restingBPM, recoveryDrop),
            riskLevel: this.determineRiskLevel(restingBPM, recoveryDrop, hrr),
            diseases: this.identifyPotentialIssues(restingBPM, activityBPM, recoveryBPM),
            recommendations: this.generateRecommendations(restingBPM, activityBPM, recoveryBPM, hrr),
            urgency: this.determineUrgency(restingBPM, recoveryDrop, hrr),
            metrics: {
                heartRateReserve: hrr.toFixed(1) + '%',
                recoveryRate: recoveryDrop + ' BPM',
                intensity: this.getIntensityLevel(activityBPM),
                restingStatus: this.assessRestingHeartRate(restingBPM),
                recoveryEfficiency: recoveryDrop >= 15 ? 'Good' : recoveryDrop >= 12 ? 'Fair' : 'Poor'
            }
        };
    }

    analyzeLungSystem(restingBPM, activityBPM, recoveryBPM, recoveryDrop, hrr) {
        const respiratoryRate = this.estimateRespiratoryRate(restingBPM);
        const exerciseCapacity = this.calculateExerciseCapacity(activityBPM, restingBPM);
        const recoveryQuality = this.assessLungRecovery(recoveryDrop, hrr);

        return {
            condition: this.determineLungCondition(respiratoryRate, exerciseCapacity),
            riskLevel: this.determineLungRiskLevel(respiratoryRate, exerciseCapacity, recoveryQuality),
            diseases: this.identifyLungIssues(respiratoryRate, exerciseCapacity, recoveryQuality),
            recommendations: this.generateLungRecommendations(respiratoryRate, exerciseCapacity, recoveryQuality),
            urgency: this.determineLungUrgency(respiratoryRate, exerciseCapacity),
            metrics: {
                respiratoryRate: respiratoryRate.toFixed(1) + ' breaths/min',
                exerciseCapacity: exerciseCapacity.toFixed(1) + '%',
                recoveryQuality: recoveryQuality,
                oxygenEfficiency: this.calculateOxygenEfficiency(activityBPM, recoveryBPM) + '%',
                breathingReserve: this.calculateBreathingReserve(activityBPM, restingBPM) + '%'
            }
        };
    }

    estimateRespiratoryRate(restingBPM) {
        // Estimate respiratory rate from heart rate (typical ratio is 1:4)
        return restingBPM / 4;
    }

    calculateExerciseCapacity(activityBPM, restingBPM) {
        // Calculate as percentage of maximum predicted exercise capacity
        const maxPredicted = 220 - 30; // Assuming average age of 30
        return ((activityBPM - restingBPM) / (maxPredicted - restingBPM)) * 100;
    }

    assessLungRecovery(recoveryDrop, hrr) {
        if (recoveryDrop >= 15 && hrr >= 15) return 'Excellent';
        if (recoveryDrop >= 12 && hrr >= 12) return 'Good';
        if (recoveryDrop >= 8 && hrr >= 8) return 'Fair';
        return 'Poor';
    }

    determineLungCondition(respiratoryRate, exerciseCapacity) {
        if (respiratoryRate > 20) return 'Elevated Respiratory Rate';
        if (respiratoryRate < 12) return 'Low Respiratory Rate';
        if (exerciseCapacity < 50) return 'Reduced Exercise Capacity';
        return 'Normal Lung Function';
    }

    determineLungRiskLevel(respiratoryRate, exerciseCapacity, recoveryQuality) {
        if (respiratoryRate > 24 || exerciseCapacity < 30 || recoveryQuality === 'Poor') return 'High';
        if (respiratoryRate > 20 || exerciseCapacity < 50 || recoveryQuality === 'Fair') return 'Medium';
        return 'Low';
    }

    // Heart Analysis Methods
    determineCondition(restingBPM, recoveryDrop) {
        if (restingBPM < 60) return 'Below Normal Range (Bradycardia)';
        if (restingBPM > 100) return 'Above Normal Range (Tachycardia)';
        if (recoveryDrop < 12) return 'Poor Recovery Pattern';
        if (restingBPM >= 60 && restingBPM <= 80) return 'Optimal Heart Function';
        return 'Normal Heart Function';
    }

    determineRiskLevel(restingBPM, recoveryDrop, hrr) {
        if (restingBPM < 50 || restingBPM > 120 || recoveryDrop < 8 || hrr < 5) return 'High';
        if (restingBPM < 60 || restingBPM > 100 || recoveryDrop < 12 || hrr < 10) return 'Medium';
        return 'Low';
    }

    identifyPotentialIssues(restingBPM, activityBPM, recoveryBPM) {
        const issues = [];
        if (restingBPM < 60) issues.push('Bradycardia (Slow Heart Rate)');
        if (restingBPM > 100) issues.push('Tachycardia (Fast Heart Rate)');
        if (activityBPM > 200) issues.push('Excessive Exercise Response');
        if (recoveryBPM - restingBPM > 30) issues.push('Delayed Recovery Pattern');
        return issues.length > 0 ? issues : ['No specific cardiac conditions identified'];
    }

    generateRecommendations(restingBPM, activityBPM, recoveryBPM, hrr) {
        const recommendations = [];
        
        if (restingBPM < 60) {
            recommendations.push('Consult healthcare provider about low heart rate');
            recommendations.push('Monitor energy levels and dizziness');
        }
        
        if (restingBPM > 100) {
            recommendations.push('Consult healthcare provider about elevated heart rate');
            recommendations.push('Consider stress reduction techniques');
        }
        
        if (activityBPM > 180) {
            recommendations.push('Consider moderating exercise intensity');
            recommendations.push('Ensure proper warm-up and cool-down');
        }
        
        if (hrr < 12) {
            recommendations.push('Focus on improving cardiovascular fitness');
            recommendations.push('Include recovery periods in exercise routine');
        }
        
        recommendations.push('Regular cardiovascular health monitoring');
        recommendations.push('Maintain balanced exercise routine');
        
        return recommendations;
    }

    determineUrgency(restingBPM, recoveryDrop, hrr) {
        if (restingBPM < 50 || restingBPM > 120 || recoveryDrop < 8 || hrr < 5) {
            return 'Immediate consultation recommended';
        }
        return 'No immediate consultation needed';
    }

    identifyLungIssues(respiratoryRate, exerciseCapacity, recoveryQuality) {
        const issues = [];
        if (respiratoryRate > 20) issues.push('Tachypnea (Rapid Breathing)');
        if (respiratoryRate < 12) issues.push('Bradypnea (Slow Breathing)');
        if (exerciseCapacity < 50) issues.push('Reduced Exercise Tolerance');
        if (recoveryQuality === 'Poor') issues.push('Poor Recovery Pattern');
        return issues.length > 0 ? issues : ['No specific respiratory conditions identified'];
    }

    generateLungRecommendations(respiratoryRate, exerciseCapacity, recoveryQuality) {
        const recommendations = [];
        
        if (respiratoryRate > 20) {
            recommendations.push('Practice deep breathing exercises');
            recommendations.push('Consider stress reduction techniques');
        }
        
        if (exerciseCapacity < 50) {
            recommendations.push('Gradually increase activity levels');
            recommendations.push('Consider pulmonary rehabilitation exercises');
        }
        
        if (recoveryQuality === 'Poor' || recoveryQuality === 'Fair') {
            recommendations.push('Focus on breathing techniques during exercise');
            recommendations.push('Include cool-down periods after activity');
        }
        
        recommendations.push('Monitor breathing patterns during rest and activity');
        recommendations.push('Maintain good air quality in living/working environment');
        
        return recommendations;
    }

    determineLungUrgency(respiratoryRate, exerciseCapacity) {
        if (respiratoryRate > 24 || exerciseCapacity < 30) {
            return 'Immediate consultation recommended';
        }
        return 'No immediate consultation needed';
    }

    calculateOxygenEfficiency(activityBPM, recoveryBPM) {
        // Estimate oxygen efficiency based on recovery pattern
        return 100 - ((recoveryBPM / activityBPM) * 100);
    }

    calculateBreathingReserve(activityBPM, restingBPM) {
        // Estimate breathing reserve as percentage
        return ((220 - activityBPM) / (220 - restingBPM)) * 100;
    }

    determineHeartCondition(restingBPM, recoveryDrop) {
        if (restingBPM < 60) return 'Below Normal Range';
        if (restingBPM > 100) return 'Above Normal Range';
        if (recoveryDrop < 12) return 'Poor Recovery';
        if (restingBPM >= 60 && restingBPM <= 80 && recoveryDrop >= 15) return 'Optimal';
        return 'Normal';
    }

    determineRiskLevel(restingBPM, recoveryDrop, hrr) {
        if (restingBPM < 50 || restingBPM > 120 || recoveryDrop < 8 || hrr < 5) return 'High';
        if (restingBPM < 60 || restingBPM > 100 || recoveryDrop < 12 || hrr < 10) return 'Medium';
        return 'Low';
    }

    identifyPotentialIssues(restingBPM, activityBPM, recoveryBPM) {
        const issues = [];
        if (restingBPM < 60) issues.push('Possible Bradycardia');
        if (restingBPM > 100) issues.push('Possible Tachycardia');
        if (activityBPM > 200) issues.push('Excessive Exercise Response');
        if (recoveryBPM - restingBPM > 30) issues.push('Delayed Recovery');
        return issues.length > 0 ? issues : ['No specific conditions identified'];
    }

    generateRecommendations(restingBPM, activityBPM, recoveryBPM, hrr) {
        const recommendations = [];
        
        // Resting heart rate recommendations
        if (restingBPM < 60) {
            recommendations.push('Consult healthcare provider about low resting heart rate');
        } else if (restingBPM > 100) {
            recommendations.push('Consult healthcare provider about elevated resting heart rate');
        }

        // Activity recommendations
        if (activityBPM > 180) {
            recommendations.push('Consider moderating exercise intensity');
        } else if (activityBPM < 120) {
            recommendations.push('Consider gradually increasing exercise intensity for better cardiovascular benefits');
        }

        // Recovery recommendations
        if (hrr < 12) {
            recommendations.push('Focus on improving cardiovascular recovery through structured exercise');
            recommendations.push('Consider consulting a fitness professional');
        }

        // General recommendations
        recommendations.push('Continue regular heart rate monitoring');
        recommendations.push('Maintain proper hydration and rest between activities');

        return recommendations;
    }

    determineUrgency(restingBPM, recoveryDrop, hrr) {
        if (restingBPM < 50 || restingBPM > 120 || recoveryDrop < 8 || hrr < 5) {
            return 'Immediate consultation recommended';
        }
        return 'No immediate consultation needed';
    }

    getIntensityLevel(activityBPM) {
        if (activityBPM > 180) return 'High';
        if (activityBPM > 140) return 'Moderate to High';
        if (activityBPM > 100) return 'Moderate';
        return 'Low';
    }

    assessRestingHeartRate(bpm) {
        if (bpm < 60) return 'Bradycardia Range';
        if (bpm > 100) return 'Tachycardia Range';
        if (bpm >= 60 && bpm <= 80) return 'Optimal Range';
        return 'Normal Range';
    }
}

// Export the GeminiAPI class
window.GeminiAPI = GeminiAPI;
