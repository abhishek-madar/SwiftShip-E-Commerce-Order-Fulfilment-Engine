document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // BACKGROUND EFFECTS
    // ----------------------------------------------------
    const particleContainer = document.querySelector('.background-particles');
    for(let i=0; i<20; i++) {
        const span = document.createElement('span');
        span.style.position = 'absolute';
        span.style.width = Math.random() * 3 + 'px';
        span.style.height = span.style.width;
        span.style.background = Math.random() > 0.5 ? 'rgba(0, 229, 255, 0.5)' : 'rgba(124, 77, 255, 0.5)';
        span.style.borderRadius = '50%';
        span.style.top = Math.random() * 100 + '%';
        span.style.left = Math.random() * 100 + '%';
        span.style.boxShadow = `0 0 10px ${span.style.background}`;
        span.style.opacity = Math.random() * 0.5 + 0.1;
        span.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particleContainer.appendChild(span);
    }
    const style = document.createElement('style');
    style.innerHTML = `@keyframes float { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(10px); } 100% { transform: translateY(0) translateX(0); } }`;
    document.head.appendChild(style);

    // ----------------------------------------------------
    // SPA ROUTING
    // ----------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.getAttribute('data-page');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            pages.forEach(p => {
                p.style.display = p.id === `page-${targetPage}` ? 'block' : 'none';
            });
            
            renderCharts(); // Re-render charts if analytics page is opened
        });
    });

    // ----------------------------------------------------
    // STATE MANAGEMENT (The "Engine")
    // ----------------------------------------------------
    const State = {
        orders: [],
        sjfQueue: [],
        fcfsQueue: [],
        stations: [
            { id: 'Alpha', status: 'green', progress: 0, currentJob: null },
            { id: 'Beta', status: 'green', progress: 0, currentJob: null },
            { id: 'Gamma', status: 'green', progress: 0, currentJob: null }
        ],
        alerts: [],
        time: 0,
        completed: 0,
        throughputHist: [0,0,0,0,0,0,0],
        settings: { speed: 1000, mode: 'hybrid' }
    };
    
    let tickInterval = null;
    let orderCounter = 100;

    // ----------------------------------------------------
    // DATA GENERATION & ACTIONS
    // ----------------------------------------------------
    function generateOrderId() {
        orderCounter++;
        return `ORD-${orderCounter.toString().padStart(3, '0')}`;
    }

    function addOrder(weight, type) {
        const order = {
            id: generateOrderId(),
            weight: parseFloat(weight).toFixed(1),
            type: type, // 'express' or 'standard'
            arrivalTime: State.time,
            processingTime: Math.ceil(weight * 2),
            timeRemaining: Math.ceil(weight * 2),
            status: 'queued'
        };
        State.orders.push(order);
        
        if (State.settings.mode === 'hybrid') {
            if (type === 'express') State.sjfQueue.push(order);
            else State.fcfsQueue.push(order);
        } else if (State.settings.mode === 'sjf') {
            State.sjfQueue.push(order);
        } else {
            State.fcfsQueue.push(order);
        }
        
        addAlert(`New ${type} order ${order.id} received.`, 'success');
        updateUI();
    }

    function generateRandomOrders(count) {
        for(let i=0; i<count; i++) {
            const weight = (Math.random() * 15 + 0.5).toFixed(1);
            const type = Math.random() > 0.4 ? 'standard' : 'express';
            addOrder(weight, type);
        }
    }

    async function loadServerSimulation() {
        const response = await fetch('/api/simulation', { headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
            throw new Error(`Simulation API returned ${response.status}`);
        }
        return response.json();
    }

    function hydrateFromServerSimulation(data) {
        if (!data || !Array.isArray(data.incoming_orders)) return false;

        State.orders = [];
        State.sjfQueue = [];
        State.fcfsQueue = [];

        data.incoming_orders.forEach((item, index) => {
            const weight = Number.parseFloat(item.weight) || 1;
            const order = {
                id: item.id || `ORD-${String(index + 1).padStart(3, '0')}`,
                weight: weight.toFixed(1),
                type: item.type === 'express' ? 'express' : 'standard',
                arrivalTime: Number.isFinite(item.arrival_time) ? item.arrival_time : State.time,
                processingTime: Number.isFinite(item.processing_time) ? item.processing_time : Math.max(1, Math.ceil(weight * 2)),
                timeRemaining: Number.isFinite(item.processing_time) ? item.processing_time : Math.max(1, Math.ceil(weight * 2)),
                status: 'queued'
            };

            State.orders.push(order);
            if (order.type === 'express') State.sjfQueue.push(order);
            else State.fcfsQueue.push(order);
        });

        if (data.metrics && Array.isArray(data.metrics.throughput)) {
            State.throughputHist = data.metrics.throughput.slice(-7);
        }

        addAlert('Serverless simulation snapshot loaded.', 'success');
        return true;
    }

    function addAlert(msg, type='success') {
        State.alerts.unshift({ time: State.time, msg, type });
        if(State.alerts.length > 50) State.alerts.pop();
    }

    // ----------------------------------------------------
    // CORE SCHEDULING TICK LOGIC
    // ----------------------------------------------------
    function engineTick() {
        State.time++;
        document.getElementById('systemStatusText').textContent = `System Live (Tick: ${State.time})`;
        
        // SJF Sort logic
        State.sjfQueue.sort((a, b) => a.timeRemaining - b.timeRemaining);
        
        // Assign jobs to stations
        State.stations.forEach(station => {
            if (station.status === 'red') return; // Broken
            
            // Process active job
            if (station.currentJob) {
                station.currentJob.timeRemaining--;
                station.progress = Math.round(((station.currentJob.processingTime - station.currentJob.timeRemaining) / station.currentJob.processingTime) * 100);
                
                if (station.currentJob.timeRemaining <= 0) {
                    station.currentJob.status = 'completed';
                    addAlert(`Order ${station.currentJob.id} fulfilled by ${station.id}.`, 'success');
                    station.currentJob = null;
                    station.status = 'green';
                    station.progress = 0;
                    State.completed++;
                    State.throughputHist[State.throughputHist.length-1]++;
                }
            }
            
            // Fetch new job if idle
            if (!station.currentJob) {
                let job = null;
                if (State.sjfQueue.length > 0) {
                    job = State.sjfQueue.shift();
                    logTrace('sjfLog', `Assigned ${job.id} to ${station.id}`, 'express');
                } else if (State.fcfsQueue.length > 0) {
                    job = State.fcfsQueue.shift();
                    logTrace('fcfsLog', `Assigned ${job.id} to ${station.id}`, 'standard');
                }
                
                if (job) {
                    job.status = 'processing';
                    station.currentJob = job;
                    station.status = 'yellow';
                }
            }
        });

        // Update historical throughput
        if (State.time % 10 === 0) {
            State.throughputHist.shift();
            State.throughputHist.push(0);
        }

        updateUI();
    }

    function logTrace(containerId, msg, type) {
        const c = document.getElementById(containerId);
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.textContent = `[Tick ${State.time}] ${msg}`;
        c.prepend(div);
    }

    // ----------------------------------------------------
    // UI UPDATER
    // ----------------------------------------------------
    function updateUI() {
        // Dashboard Queues
        const dashOrderQueue = document.getElementById('dashOrderQueue');
        if (dashOrderQueue) {
            dashOrderQueue.innerHTML = '';
            State.orders.filter(o => o.status === 'queued').slice(0, 10).forEach(order => {
                dashOrderQueue.innerHTML += `
                    <div class="order-ticket ${order.type}">
                        <div class="order-info">
                            <span class="order-id">${order.id}</span>
                            <span class="order-weight">${order.weight}kg | ${order.type.toUpperCase()}</span>
                        </div>
                        <div class="order-time" style="font-family: 'JetBrains Mono'; font-size: 12px; color: var(--text-secondary)">T: ${order.arrivalTime}</div>
                    </div>`;
            });
        }

        // Full Orders Table
        const tbody = document.querySelector('#ordersTable tbody');
        if (tbody) {
            tbody.innerHTML = State.orders.map(o => `
                <tr>
                    <td>${o.id}</td>
                    <td><span style="color: ${o.type==='express'?'var(--order-express)':'var(--order-standard)'}">${o.type.toUpperCase()}</span></td>
                    <td>${o.weight} kg</td>
                    <td>${o.arrivalTime}</td>
                    <td>${o.processingTime}s</td>
                    <td>${o.status.toUpperCase()}</td>
                </tr>
            `).join('');
        }

        // Stations
        const stHTML = State.stations.map(st => {
            const isBroken = st.status === 'red';
            const progressValue = isBroken ? 0 : st.progress;
            const offset = 251.2 - (251.2 * progressValue / 100);
            const stationState = isBroken ? 'Offline' : (st.currentJob ? 'Processing' : 'Idle');
            return `
            <div class="station-box ${isBroken ? 'failed error-pulse' : (st.status==='green'?'active':'busy')}">
                <div class="station-status ${st.status}"></div>
                <h4>
                    <span class="station-title">Station ${st.id}</span>
                    <span class="station-subtitle">${st.currentJob ? st.currentJob.id : stationState}</span>
                </h4>
                <div class="ring-container">
                    <svg class="progress-ring" viewBox="0 0 100 100">
                        <circle class="ring-bg" cx="50" cy="50" r="40"></circle>
                        <circle class="ring-progress ${st.status}-ring" cx="50" cy="50" r="40" stroke-dashoffset="${offset}"></circle>
                    </svg>
                    <span class="ring-text">${progressValue}%</span>
                </div>
                <button class="station-power-btn" onclick="toggleStation('${st.id}')" aria-label="Toggle Station ${st.id}"><i class="fa-solid fa-power-off"></i></button>
            </div>`;
        }).join('');
        document.getElementById('dashStationGrid').innerHTML = stHTML;
        document.getElementById('fullStationGrid').innerHTML = stHTML;

        // Alerts
        const alertHTML = State.alerts.map(a => `
            <div class="alert-item ${a.type}">
                <i class="fa-solid ${a.type==='error'?'fa-skull-crossbones':a.type==='warning'?'fa-bolt':'fa-check-double'}"></i>
                <div class="alert-info">
                    <strong>${a.type.toUpperCase()}</strong>
                    <span>${a.msg}</span>
                </div>
                <span class="time">T:${a.time}</span>
            </div>
        `).join('');
        document.getElementById('dashAlerts').innerHTML = alertHTML;
        document.getElementById('fullAlertsList').innerHTML = alertHTML;

        // CPU utilization
        document.getElementById('sjfUtilText').textContent = `Queue Length: ${State.sjfQueue.length}`;
        document.getElementById('sjfUtilBar').style.width = `${Math.min(100, State.sjfQueue.length * 10)}%`;
        document.getElementById('fcfsUtilText').textContent = `Queue Length: ${State.fcfsQueue.length}`;
        document.getElementById('fcfsUtilBar').style.width = `${Math.min(100, State.fcfsQueue.length * 5)}%`;

        renderCharts();
    }

    // Global station toggler hack for inline onclick
    window.toggleStation = (id) => {
        const st = State.stations.find(s => s.id === id);
        if (st) {
            if (st.status === 'red') {
                st.status = 'green';
                addAlert(`Station ${st.id} repaired and online.`, 'success');
            } else {
                if(st.currentJob) {
                    st.currentJob.status = 'queued';
                    if (st.currentJob.type === 'express') State.sjfQueue.unshift(st.currentJob);
                    else State.fcfsQueue.unshift(st.currentJob);
                    st.currentJob = null;
                }
                st.status = 'red';
                st.progress = 0;
                addAlert(`Station ${st.id} BREAKDOWN! Job re-routed.`, 'error');
            }
            updateUI();
        }
    };

    // ----------------------------------------------------
    // CHARTS
    // ----------------------------------------------------
    let throughputChart, orderTypeChart, largeThroughputChart;
    Chart.defaults.color = '#B0BEC5';
    Chart.defaults.font.family = 'Inter';
    Chart.defaults.responsive = true;

    function renderCharts() {
        const expCount = State.orders.filter(o=>o.type==='express').length;
        const stdCount = State.orders.filter(o=>o.type==='standard').length;
        const lineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(11,16,32,0.95)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: 'rgba(255,255,255,0.06)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 0 }
                }
            }
        };

        if (document.getElementById('throughputChart')) {
            if (!throughputChart) {
                const ctx1 = document.getElementById('throughputChart').getContext('2d');
                throughputChart = new Chart(ctx1, { type: 'line', data: { labels: ['-60','-50','-40','-30','-20','-10','Now'], datasets: [{ label: 'Completed', data: State.throughputHist, borderColor: '#00E5FF', backgroundColor: 'rgba(0, 229, 255, 0.12)', borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: '#00E5FF', fill: true, tension: 0.38 }] }, options: lineChartOptions });
            } else {
                throughputChart.data.datasets[0].data = State.throughputHist;
                throughputChart.update();
            }
        }

        if (document.getElementById('largeThroughputChart')) {
            if (!largeThroughputChart) {
                const ctxL = document.getElementById('largeThroughputChart').getContext('2d');
                largeThroughputChart = new Chart(ctxL, { type: 'line', data: { labels: ['-60','-50','-40','-30','-20','-10','Now'], datasets: [{ label: 'Completed', data: State.throughputHist, borderColor: '#00E5FF', backgroundColor: 'rgba(0, 229, 255, 0.12)', borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: '#00E5FF', fill: true, tension: 0.38 }] }, options: lineChartOptions });
            } else {
                largeThroughputChart.data.datasets[0].data = State.throughputHist;
                largeThroughputChart.update();
            }
        }

        if (document.getElementById('orderTypeChart')) {
            if (!orderTypeChart) {
                const ctx2 = document.getElementById('orderTypeChart').getContext('2d');
                orderTypeChart = new Chart(ctx2, { type: 'doughnut', data: { labels: ['Express', 'Standard'], datasets: [{ data: [expCount, stdCount], backgroundColor: ['#FF4081', '#42A5F5'], borderColor: 'rgba(11,16,32,0.9)', borderWidth: 3, hoverOffset: 6 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '68%', layout: { padding: 4 }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 14 } }, tooltip: { backgroundColor: 'rgba(11,16,32,0.95)', padding: 10 } } } });
            } else {
                orderTypeChart.data.datasets[0].data = [expCount, stdCount];
                orderTypeChart.update();
            }
        }
    }

    // ----------------------------------------------------
    // EVENT LISTENERS FOR CONTROLS
    // ----------------------------------------------------
    document.getElementById('btnGenerateOrders').addEventListener('click', () => {
        generateRandomOrders(10);
    });

    document.getElementById('btnAddOrder').addEventListener('click', () => {
        const w = document.getElementById('inputWeight').value || 1.0;
        const t = document.getElementById('inputType').value;
        addOrder(w, t);
    });

    document.getElementById('btnClearOrders').addEventListener('click', () => {
        State.orders = []; State.sjfQueue = []; State.fcfsQueue = []; updateUI();
    });

    document.getElementById('btnTick').addEventListener('click', engineTick);

    document.getElementById('btnRunSort').addEventListener('click', () => {
        const vis = document.getElementById('mergeSortVisualizer');
        const q = State.orders.filter(o=>o.status==='queued').slice(0,4);
        if(q.length < 4) {
            vis.innerHTML = '<div style="color:var(--error);">Not enough queued orders to visualize. Generate more!</div>';
            return;
        }
        
        const rootArr = q.map(o => `<div class="array-box ${o.type}">${o.id}</div>`).join('');
        const split1 = q.slice(0, 2).map(o => `<div class="array-box ${o.type}">${o.id}</div>`).join('');
        const split2 = q.slice(2, 4).map(o => `<div class="array-box ${o.type}">${o.id}</div>`).join('');
        
        q.sort((a,b) => (a.type==='express'?0:1) - (b.type==='express'?0:1));
        const sorted = q.map(o => `<div class="array-box ${o.type} highlight">${o.id}</div>`).join('');
        
        vis.innerHTML = `
            <div class="array-level root-array">${rootArr}</div>
            <div class="split-lines"><i class="fa-solid fa-arrows-split-up-and-left text-cyan"></i></div>
            <div class="array-level split-array"><div class="sub-array">${split1}</div><div class="sub-array">${split2}</div></div>
            <div class="merge-lines"><i class="fa-solid fa-arrow-down text-purple"></i> Priority Merged</div>
            <div class="array-level sorted-array glowing-border">${sorted}</div>
        `;
    });

    document.getElementById('btnClearAlerts').addEventListener('click', () => {
        State.alerts = []; updateUI();
    });

    document.getElementById('setSpeed').addEventListener('change', (e) => {
        State.settings.speed = parseInt(e.target.value);
        if (tickInterval) clearInterval(tickInterval);
        if (State.settings.speed > 0) {
            tickInterval = setInterval(engineTick, State.settings.speed);
        }
    });

    document.getElementById('setScheduler').addEventListener('change', (e) => {
        State.settings.mode = e.target.value;
        addAlert(`Scheduler changed to ${State.settings.mode.toUpperCase()}`, 'warning');
    });

    // ----------------------------------------------------
    // INITIALIZATION
    // ----------------------------------------------------
    async function initializeApp() {
        try {
            const serverState = await loadServerSimulation();
            hydrateFromServerSimulation(serverState);
        } catch (error) {
            generateRandomOrders(5);
            addAlert('Using local browser simulation mode.', 'warning');
        }

        updateUI();
        if (State.settings.speed > 0) {
            tickInterval = setInterval(engineTick, State.settings.speed);
        }
    }

    initializeApp();
});
