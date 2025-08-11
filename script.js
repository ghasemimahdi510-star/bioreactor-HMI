document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const dom = {
        tempValue: document.getElementById('temp-value'),
        phValue: document.getElementById('ph-value'),
        doValue: document.getElementById('do-value'),
        rpmValue: document.getElementById('rpm-value'),
        tempCard: document.getElementById('temp-card'),
        phCard: document.getElementById('ph-card'),
        doCard: document.getElementById('do-card'),
        rpmCard: document.getElementById('rpm-card'),
        agitatorSlider: document.getElementById('agitator-slider'),
        sliderValueSpan: document.getElementById('slider-value'),
        connectBtn: document.getElementById('connect-btn'),
        connectionIndicator: document.getElementById('connection-indicator'),
        tempChartCtx: document.getElementById('temp-chart').getContext('2d'),
    };

    // --- State Variables ---
    let isConnected = false;
    let dataInterval;
    let tempChart;

    // --- Chart.js Configuration ---
    const chartConfig = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#00ffc8',
                backgroundColor: 'rgba(0, 255, 200, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#e0e0e0', maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#e0e0e0' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    };
    tempChart = new Chart(dom.tempChartCtx, chartConfig);

    // --- Utility Functions ---
    const updateCardColor = (element, value, normal, warning) => {
        if (value >= normal.min && value <= normal.max) {
            element.className = 'data-card normal';
        } else if (value >= warning.min && value <= warning.max) {
            element.className = 'data-card warning';
        } else {
            element.className = 'data-card danger';
        }
    };

    const updateReadouts = (data) => {
        // Update DOM with new values
        dom.tempValue.textContent = `${data.temp.toFixed(1)} °C`;
        dom.phValue.textContent = `${data.ph.toFixed(2)} pH`;
        dom.doValue.textContent = `${data.dissolvedOxygen.toFixed(1)} %`;
        dom.rpmValue.textContent = `${data.rpm} RPM`;

        // Update card status colors
        updateCardColor(dom.tempCard, data.temp, { min: 22, max: 28 }, { min: 20, max: 30 });
        updateCardColor(dom.phCard, data.ph, { min: 6.8, max: 7.2 }, { min: 6.5, max: 7.5 });
        updateCardColor(dom.doCard, data.dissolvedOxygen, { min: 90, max: 100 }, { min: 80, max: 100 });
        updateCardColor(dom.rpmCard, data.rpm, { min: 400, max: 800 }, { min: 300, max: 1000 });

        // Update chart
        const now = new Date();
        tempChart.data.labels.push(now.toLocaleTimeString());
        tempChart.data.datasets[0].data.push(data.temp);

        // Keep chart data clean
        const maxDataPoints = 20;
        if (tempChart.data.labels.length > maxDataPoints) {
            tempChart.data.labels.shift();
            tempChart.data.datasets[0].data.shift();
        }
        tempChart.update();
    };

    // --- Data Simulation Function (to be replaced by WebSocket) ---
    const simulateData = () => {
        if (!isConnected) return;
        const dummyData = {
            temp: Math.random() * (28 - 22) + 22,
            ph: Math.random() * (7.2 - 6.8) + 6.8,
            dissolvedOxygen: Math.random() * (100 - 90) + 90,
            rpm: Math.floor(Math.random() * (800 - 400 + 1)) + 400,
        };
        updateReadouts(dummyData);
    };

    // --- WebSocket Connection Management ---
    const connect = () => {
        // This is a placeholder for actual WebSocket logic
        isConnected = true;
        dom.connectionIndicator.className = 'status-indicator connected';
        dom.connectBtn.textContent = 'Disconnect';
        console.log('Simulating connection to ESP32...');

        // Start data simulation
        dataInterval = setInterval(simulateData, 2000);
    };

    const disconnect = () => {
        // Placeholder for WebSocket disconnect logic
        isConnected = false;
        dom.connectionIndicator.className = 'status-indicator disconnected';
        dom.connectBtn.textContent = 'Connect';
        console.log('Simulating disconnection.');

        // Stop data simulation
        clearInterval(dataInterval);
    };

    // --- Event Listeners ---
    dom.connectBtn.addEventListener('click', () => {
        if (isConnected) {
            disconnect();
        } else {
            connect();
        }
    });

    dom.agitatorSlider.addEventListener('input', (event) => {
        dom.sliderValueSpan.textContent = `${event.target.value}%`;
        // In a real application, send this value to the ESP32 via WebSocket
        // e.g., websocket.send(`AGITATOR_SPEED:${event.target.value}`);
    });

    // --- Initial State ---
    disconnect();
});
