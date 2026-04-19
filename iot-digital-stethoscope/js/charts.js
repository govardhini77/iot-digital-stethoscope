class ChartManager {
    constructor() {
        this.chart = null;
    }

    initializeChart() {
        const ctx = document.getElementById('soundWaveChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Resting', 'Activity', 'Recovery'],
                datasets: [{
                    label: 'BPM Measurements',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateChart(restingBPM, activityBPM, recoveryBPM) {
        if (!this.chart) {
            this.initializeChart();
        }

        this.chart.data.datasets[0].data = [restingBPM, activityBPM, recoveryBPM];
        this.chart.update();
    }

    clearChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Export the ChartManager class
window.ChartManager = ChartManager;
