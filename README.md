🔐 IoT-Enabled Digital Stethoscope

An IoT-enabled digital stethoscope designed for real-time acquisition, visualization, and analysis of heart and lung sounds. The system integrates embedded hardware with a web-based dashboard to enable remote monitoring and intelligent healthcare support.

✨ Features

🎧 Physiological Sound Acquisition – Captures heart and lung sounds using MAX9814 microphone with AGC

📊 Real-Time Visualization – Displays waveform on LCD and web dashboard

🌐 IoT Connectivity – Transmits data wirelessly using ESP8266 (NodeMCU)

🔍 Signal Processing – Applies filtering and smoothing for noise reduction

🤖 Machine Learning Integration – Detects abnormalities with >90% accuracy using CNN

⚡ Low Latency System – Real-time response under 600 ms


🛠️ Tech Stack

Hardware: MAX9814 Microphone, ESP8266 (NodeMCU), 16×2 LCD

Software: Embedded C / Arduino

Web: HTML, CSS, JavaScript (Chart.js)

Machine Learning: CNN, SVM models

🚀 System Architecture

The system consists of three main layers:

Signal Acquisition Layer – Captures physiological sounds using MAX9814

Processing Layer – ESP8266 digitizes and processes signals

Visualization Layer – Displays data on LCD and web dashboard

👉 This layered design ensures scalability and real-time performance

📸 How It Works

🎧 Stethoscope captures heart/lung sounds

⚙️ MAX9814 amplifies signals using AGC

📡 ESP8266 converts analog signals to digital (ADC)

📟 LCD displays real-time signal intensity

🌐 Data is transmitted via Wi-Fi

📊 Web dashboard visualizes waveform using Chart.js

🤖 ML model predicts abnormalities

📂 Project Structure

iot-digital-stethoscope/

│-- hardware/

│-- firmware/

│-- web/

│-- models/

│-- README.md

📊 Results & Observations

Clear detection of S1 and S2 heart sounds

Accurate capture of lung breathing patterns

Real-time waveform visualization with <500 ms latency

Operates for ~6 hours on battery power

Stable performance in both lab and real-world conditions

🎯 Applications

🏥 Remote patient monitoring

🌍 Telemedicine (especially rural areas)

🎓 Biomedical education

🏠 Home-based health tracking

⚠️ Limitations

Noise interference in open environments

Limited ADC resolution (ESP8266 – 10-bit)

No audio playback (only waveform visualization)

Requires stable Wi-Fi for dashboard


📌 Future Enhancements

Upgrade to ESP32 (better ADC & performance)

Mobile app integration

Audio recording & playback

Advanced AI-based diagnosis

Cloud-based patient history tracking


