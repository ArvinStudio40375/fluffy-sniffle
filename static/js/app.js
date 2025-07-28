// Global variables
let currentUser = null;
let isAdmin = false;
let balanceVisible = true;

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showAlert(message, type = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.login-container, .dashboard-content');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        setTimeout(() => alertDiv.remove(), 5000);
    }
}

function showModal(title, message, onConfirm = null) {
    const modal = document.getElementById('messageModal');
    if (!modal) {
        createModal();
        return showModal(title, message, onConfirm);
    }
    
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-message').textContent = message;
    
    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');
    
    if (onConfirm) {
        confirmBtn.style.display = 'inline-block';
        confirmBtn.onclick = () => {
            modal.classList.remove('show');
            onConfirm();
        };
    } else {
        confirmBtn.style.display = 'none';
    }
    
    cancelBtn.onclick = () => modal.classList.remove('show');
    modal.classList.add('show');
}

function createModal() {
    const modal = document.createElement('div');
    modal.id = 'messageModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="modal-title"></h3>
            <p class="modal-message"></p>
            <button class="btn btn-primary modal-confirm">Ya</button>
            <button class="btn btn-secondary modal-cancel">Tutup</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// API functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Login functionality
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const pin = document.getElementById('pin').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!username || !pin) {
        showAlert('Mohon isi username dan PIN');
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Masuk...';
    
    try {
        const result = await apiCall('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, pin })
        });
        
        if (result.success) {
            window.location.href = '/dashboard';
        } else {
            showAlert(result.message);
        }
    } catch (error) {
        showAlert('Terjadi kesalahan saat login');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Masuk';
    }
}

// Dashboard functionality
async function loadDashboard() {
    try {
        // Load user data
        const userData = await apiCall('/api/user-data');
        currentUser = userData;
        
        // Update separate balance displays
        document.getElementById('tabunganAmount').textContent = formatCurrency(userData.tabungan);
        document.getElementById('depositoAmount').textContent = formatCurrency(userData.deposito);
        
        // Load balance validation
        await loadBalanceValidation();
        
        // Load notifications
        await loadNotifications();
        
        // Check for popup
        await checkPopup();
        
        // Update financial summary with sample data
        updateFinancialSummary();
        
        // Update greeting time
        updateGreeting();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Terjadi kesalahan saat memuat data');
    }
}

async function loadBalanceValidation() {
    try {
        const validation = await apiCall('/api/balance-validation');
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        const progressInfo = document.querySelector('.progress-info');
        
        if (progressBar && progressInfo) {
            progressBar.style.width = `${validation.percentage}%`;
            
            let infoText = `Agar bisa tarik deposito, saldo tabungan minimal 1,5% dari total saldo deposito.<br>`;
            infoText += `Target minimal: ${formatCurrency(validation.required_savings)}<br>`;
            
            if (!validation.can_withdraw) {
                infoText += `<strong>Kekurangan saldo: ${formatCurrency(validation.shortage)}</strong>`;
                progressInfo.style.background = '#ffebee';
                progressInfo.style.color = '#c62828';
            } else {
                infoText += `<strong>✓ Syarat sudah terpenuhi</strong>`;
                progressInfo.style.background = '#e8f5e8';
                progressInfo.style.color = '#2e7d32';
            }
            
            progressInfo.innerHTML = infoText;
        }
        
    } catch (error) {
        console.error('Error loading balance validation:', error);
    }
}

async function loadNotifications() {
    try {
        const notifications = await apiCall('/api/notifications');
        // Store notifications for later use in showNotifications function
        window.userNotifications = notifications;
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function checkPopup() {
    try {
        const popup = await apiCall('/api/popup');
        
        if (popup && popup.aktif) {
            showModal('Informasi', popup.isi);
        }
        
    } catch (error) {
        console.error('Error checking popup:', error);
    }
}

// Admin modal functions
function showAdminModal() {
    const adminModal = new bootstrap.Modal(document.getElementById('adminModal'));
    adminModal.show();
}

// Admin access
async function handleAdminAccess(event) {
    event.preventDefault();
    
    const code = document.getElementById('adminCode').value;
    
    if (!code) {
        showAlert('Masukkan kode admin');
        return;
    }
    
    try {
        const result = await apiCall('/api/admin-access', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
        
        if (result.success) {
            // Close modal
            const adminModal = bootstrap.Modal.getInstance(document.getElementById('adminModal'));
            adminModal.hide();
            
            // Redirect to admin dashboard
            window.location.href = '/dashboard-admin';
        } else {
            showAlert(result.message);
        }
    } catch (error) {
        showAlert('Terjadi kesalahan');
    }
}

// Admin functionality
async function addTabungan() {
    const amount = parseInt(document.getElementById('tabunganAmount').value);
    
    if (!amount || amount <= 0) {
        showAlert('Masukkan jumlah yang valid');
        return;
    }
    
    try {
        const result = await apiCall('/api/admin/add-tabungan', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
        
        if (result.success) {
            showAlert(`Saldo tabungan berhasil ditambah. Saldo baru: ${formatCurrency(result.new_balance)}`, 'success');
            document.getElementById('tabunganAmount').value = '';
        }
    } catch (error) {
        showAlert('Terjadi kesalahan saat menambah saldo');
    }
}

async function addDeposito() {
    const amount = parseInt(document.getElementById('depositoAmount').value);
    
    if (!amount || amount <= 0) {
        showAlert('Masukkan jumlah yang valid');
        return;
    }
    
    try {
        const result = await apiCall('/api/admin/add-deposito', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
        
        if (result.success) {
            showAlert(`Saldo deposito berhasil ditambah. Saldo baru: ${formatCurrency(result.new_balance)}`, 'success');
            document.getElementById('depositoAmount').value = '';
        }
    } catch (error) {
        showAlert('Terjadi kesalahan saat menambah saldo');
    }
}

async function sendNotification() {
    const message = document.getElementById('notificationMessage').value;
    
    if (!message.trim()) {
        showAlert('Masukkan pesan notifikasi');
        return;
    }
    
    try {
        const result = await apiCall('/api/admin/send-notification', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        if (result.success) {
            showAlert('Notifikasi berhasil dikirim', 'success');
            document.getElementById('notificationMessage').value = '';
        }
    } catch (error) {
        showAlert('Terjadi kesalahan saat mengirim notifikasi');
    }
}

async function sendPopup() {
    const message = document.getElementById('popupMessage').value;
    
    if (!message.trim()) {
        showAlert('Masukkan pesan popup');
        return;
    }
    
    try {
        const result = await apiCall('/api/admin/send-popup', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        if (result.success) {
            showAlert('Popup berhasil dikirim', 'success');
            document.getElementById('popupMessage').value = '';
        }
    } catch (error) {
        showAlert('Terjadi kesalahan saat mengirim popup');
    }
}

async function sendInvoice() {
    try {
        const result = await apiCall('/api/admin/send-invoice', {
            method: 'POST'
        });
        
        if (result.success) {
            showAlert(result.message, 'success');
        }
    } catch (error) {
        showAlert('Terjadi kesalahan saat mengirim invoice');
    }
}

// Chat functionality
let chatInterval;

async function loadChat() {
    try {
        const messages = await apiCall('/api/chat/messages');
        const container = document.getElementById('chatMessages');
        
        container.innerHTML = messages.map(msg => `
            <div class="chat-message ${msg.from_user === 'Admin' ? 'admin' : 'user'}">
                <div class="chat-sender">${msg.from_user}</div>
                <div class="chat-text">${msg.pesan}</div>
                <div class="chat-time">${msg.waktu}</div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
        
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
        const result = await apiCall('/api/chat/send', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        if (result.success) {
            input.value = '';
            await loadChat();
        }
    } catch (error) {
        showAlert('Terjadi kesalahan saat mengirim pesan');
    }
}

function startChatPolling() {
    chatInterval = setInterval(loadChat, 3000);
}

function stopChatPolling() {
    if (chatInterval) {
        clearInterval(chatInterval);
    }
}

// Logout functionality
async function logout() {
    try {
        await apiCall('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        window.location.href = '/';
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path === '/dashboard') {
        loadDashboard();
    } else if (path === '/dashboard-admin') {
        loadChat();
        startChatPolling();
    }
});

// Event listeners for enter key
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        
        if (activeElement.id === 'chatInput') {
            sendChatMessage();
        }
    }
});

// BRImo Style Functions
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Selamat Pagi';
    } else if (hour >= 12 && hour < 15) {
        greeting = 'Selamat Siang';
    } else if (hour >= 15 && hour < 18) {
        greeting = 'Selamat Sore';
    } else {
        greeting = 'Selamat Malam';
    }
    
    const greetingElement = document.querySelector('.greeting');
    if (greetingElement && currentUser) {
        greetingElement.innerHTML = `${greeting}, <span id="userName">${currentUser.username}</span>`;
    }
}

function showNotifications() {
    if (window.userNotifications && window.userNotifications.length > 0) {
        let notifText = 'Notifikasi Terbaru:\n\n';
        window.userNotifications.slice(0, 5).forEach((notif, index) => {
            notifText += `${index + 1}. ${notif.pesan}\n   ${notif.waktu}\n\n`;
        });
        showModal('Notifikasi', notifText);
    } else {
        showModal('Notifikasi', 'Tidak ada notifikasi baru.');
    }
}

function showHelpCenter() {
    showModal('Pusat Bantuan', 'Pusat bantuan akan segera tersedia.');
}

function showFeatureNotReady(featureName) {
    showModal('Fitur Tidak Tersedia', `Fitur ${featureName} akan segera tersedia.`);
}

function checkWithdrawEligibility() {
    // This will use the existing balance validation logic
    if (currentUser) {
        const required = currentUser.deposito * 0.015;
        const current = currentUser.tabungan;
        
        if (current >= required) {
            showModal('Setor & Tarik Tunai', 'Fitur setor dan tarik tunai akan segera tersedia.');
        } else {
            const shortage = required - current;
            showModal(
                'Syarat Belum Terpenuhi',
                `Saldo tabungan Anda belum mencukupi untuk menarik dana deposito.\n\nKekurangan: ${formatCurrency(shortage)}`
            );
        }
    }
}

function showAccountMenu() {
    showModal('Menu Akun', 'Pilihan:\n\n1. Pengaturan\n2. Keamanan\n3. Logout', () => {
        logout();
    });
}

function toggleFinancialSummary() {
    const content = document.getElementById('summaryContent');
    const button = document.querySelector('.hide-button');
    
    if (content.style.display === 'none') {
        content.style.display = 'grid';
        button.textContent = 'Sembunyikan';
    } else {
        content.style.display = 'none';
        button.textContent = 'Tampilkan';
    }
}

function updateFinancialSummary() {
    // Generate sample data based on current balance
    if (currentUser) {
        const income = Math.floor(currentUser.tabungan * 0.1);
        const expense = Math.floor(currentUser.tabungan * 0.05);
        
        document.getElementById('incomeAmount').textContent = formatCurrency(income);
        document.getElementById('expenseAmount').textContent = `-${formatCurrency(expense)}`;
    }
    
    // Update date period to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    document.getElementById('datePeriod').textContent = 
        `${formatDate(startOfMonth)} - ${formatDate(endOfMonth)}`;
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopChatPolling();
});
