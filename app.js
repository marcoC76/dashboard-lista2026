// Dashboard App - Logica Principal con JSONP
let studentsData = [];
let gamesChart = null;
let extraPointsChart = null;
let jsonpCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    const savedApiUrl = localStorage.getItem('apiUrl');
    if (savedApiUrl) {
        document.getElementById('apiUrl').value = savedApiUrl;
    }
    
    const savedSpreadsheetId = localStorage.getItem('spreadsheetId');
    if (savedSpreadsheetId) {
        document.getElementById('spreadsheetId').value = savedSpreadsheetId;
    }
    
    document.getElementById('loadData').addEventListener('click', loadData);
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
});

function jsonpRequest(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_cb_' + (++jsonpCounter) + '_' + Date.now();
        const script = document.createElement('script');
        
        window[callbackName] = function(data) {
            delete window[callbackName];
            script.remove();
            resolve(data);
        };
        
        script.src = url + '&callback=' + callbackName;
        script.onerror = function() {
            delete window[callbackName];
            script.remove();
            reject(new Error('Error de conexion JSONP'));
        };
        
        document.head.appendChild(script);
        
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                script.remove();
                reject(new Error('Timeout JSONP'));
            }
        }, 15000);
    });
}

async function loadData() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    
    if (!apiUrl) {
        alert('Por favor, ingresa la URL de Google Apps Script');
        return;
    }
    
    if (!spreadsheetId) {
        alert('Por favor, ingresa el Spreadsheet ID');
        return;
    }
    
    localStorage.setItem('apiUrl', apiUrl);
    localStorage.setItem('spreadsheetId', spreadsheetId);
    
    try {
        const url = apiUrl + '?spreadsheetId=' + encodeURIComponent(spreadsheetId);
        const result = await jsonpRequest(url);
        
        if (result.success) {
            studentsData = result.data;
            updateStats();
            updateCharts();
            updateTable();
        } else {
            alert('Error al cargar datos: ' + result.error);
        }
    } catch (error) {
        alert('Error de conexion: ' + error.message);
    }
}

function applyFilters() {
    updateTable();
    updateCharts();
}

function getFilteredData() {
    const groupFilter = document.getElementById('groupFilter').value;
    let filtered = [...studentsData];
    
    if (groupFilter !== 'all') {
        filtered = filtered.filter(s => s['Grupo'] === groupFilter);
    }
    
    return filtered;
}

function updateStats() {
    const filtered = getFilteredData();
    
    document.getElementById('totalStudents').textContent = filtered.length;
    
    const game1Delivered = filtered.filter(s => 
        s['🎮 Juego 1 Estado'] === '✅ Entregado'
    ).length;
    
    const game2Delivered = filtered.filter(s => 
        s['🎮 Juego 2 Estado'] === '✅ Entregado'
    ).length;
    
    const game3Delivered = filtered.filter(s => 
        s['🎮 Juego 3 Estado'] === '✅ Entregado'
    ).length;
    
    const totalDelivered = game1Delivered + game2Delivered + game3Delivered;
    const totalPending = (filtered.length * 3) - totalDelivered;
    
    document.getElementById('gamesDelivered').textContent = totalDelivered;
    document.getElementById('gamesPending').textContent = totalPending;
    
    const totalExtraPoints = filtered.reduce((sum, s) => {
        const points = parseFloat(s['⭐ Puntos Extra']) || 0;
        return sum + points;
    }, 0);
    
    const avgPoints = filtered.length > 0 ? (totalExtraPoints / filtered.length).toFixed(2) : 0;
    document.getElementById('avgExtraPoints').textContent = avgPoints;
}

function updateCharts() {
    const filtered = getFilteredData();
    
    updateGamesChart(filtered);
    updateExtraPointsChart(filtered);
}

function updateGamesChart(filtered) {
    const ctx = document.getElementById('gamesChart').getContext('2d');
    
    const game1Delivered = filtered.filter(s => s['🎮 Juego 1 Estado'] === '✅ Entregado').length;
    const game1Pending = filtered.length - game1Delivered;
    
    const game2Delivered = filtered.filter(s => s['🎮 Juego 2 Estado'] === '✅ Entregado').length;
    const game2Pending = filtered.length - game2Delivered;
    
    const game3Delivered = filtered.filter(s => s['🎮 Juego 3 Estado'] === '✅ Entregado').length;
    const game3Pending = filtered.length - game3Delivered;
    
    if (gamesChart) {
        gamesChart.destroy();
    }
    
    gamesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Juego 1', 'Juego 2', 'Juego 3'],
            datasets: [
                {
                    label: 'Entregados',
                    data: [game1Delivered, game2Delivered, game3Delivered],
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pendientes',
                    data: [game1Pending, game2Pending, game3Pending],
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Progreso de Entregas por Juego',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function updateExtraPointsChart(filtered) {
    const ctx = document.getElementById('extraPointsChart').getContext('2d');
    
    const pointsRanges = {
        '0 puntos': 0,
        '1-2 puntos': 0,
        '3-4 puntos': 0,
        '5+ puntos': 0
    };
    
    filtered.forEach(s => {
        const points = parseFloat(s['⭐ Puntos Extra']) || 0;
        if (points === 0) pointsRanges['0 puntos']++;
        else if (points <= 2) pointsRanges['1-2 puntos']++;
        else if (points <= 4) pointsRanges['3-4 puntos']++;
        else pointsRanges['5+ puntos']++;
    });
    
    if (extraPointsChart) {
        extraPointsChart.destroy();
    }
    
    extraPointsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(pointsRanges),
            datasets: [{
                data: Object.values(pointsRanges),
                backgroundColor: [
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(102, 126, 234, 0.8)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribucion de Puntos Extra',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTable() {
    const filtered = getFilteredData();
    const tbody = document.getElementById('tableBody');
    
    tbody.innerHTML = '';
    
    filtered.forEach(student => {
        const row = document.createElement('tr');
        
        const game1Status = student['🎮 Juego 1 Estado'] === '✅ Entregado' 
            ? '<span class="status-delivered">✅ Entregado</span>' 
            : '<span class="status-pending">❌ No entregado</span>';
        
        const game2Status = student['🎮 Juego 2 Estado'] === '✅ Entregado' 
            ? '<span class="status-delivered">✅ Entregado</span>' 
            : '<span class="status-pending">❌ No entregado</span>';
        
        const game3Status = student['🎮 Juego 3 Estado'] === '✅ Entregado' 
            ? '<span class="status-delivered">✅ Entregado</span>' 
            : '<span class="status-pending">❌ No entregado</span>';
        
        const extraPoints = student['⭐ Puntos Extra'] || 0;
        
        row.innerHTML = `
            <td>${student['Numero de Lista']}</td>
            <td>${student['Nombre Completo']}</td>
            <td>${student['Grupo']}</td>
            <td>${game1Status}</td>
            <td>${game2Status}</td>
            <td>${game3Status}</td>
            <td>${extraPoints}</td>
            <td>
                <button class="btn-update" onclick="toggleDelivery('${student['ID Unico']}', '🎮 Juego 1 Estado')">
                    Toggle J1
                </button>
                <button class="btn-update" onclick="toggleDelivery('${student['ID Unico']}', '🎮 Juego 2 Estado')">
                    Toggle J2
                </button>
                <button class="btn-update" onclick="toggleDelivery('${student['ID Unico']}', '🎮 Juego 3 Estado')">
                    Toggle J3
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

async function toggleDelivery(studentId, field) {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    
    if (!apiUrl || !spreadsheetId) {
        alert('Primero carga los datos con una URL y Spreadsheet ID validos');
        return;
    }
    
    const student = studentsData.find(s => s['ID Unico'] === studentId);
    if (!student) return;
    
    const currentStatus = student[field];
    const newStatus = currentStatus === '✅ Entregado' ? '' : '✅ Entregado';
    
    try {
        const params = new URLSearchParams({
            action: 'updateDelivery',
            spreadsheetId: spreadsheetId,
            studentId: studentId,
            field: field,
            status: newStatus
        });
        
        const url = apiUrl + '?' + params.toString();
        const result = await jsonpRequest(url);
        
        if (result.success) {
            student[field] = newStatus;
            updateStats();
            updateCharts();
            updateTable();
        } else {
            alert('Error al actualizar: ' + result.error);
        }
    } catch (error) {
        alert('Error de conexion: ' + error.message);
    }
}
