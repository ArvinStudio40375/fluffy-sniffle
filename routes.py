from flask import render_template, request, jsonify, session, redirect, url_for
from app import app, db
from models import User, Notification, Popup, Chat
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from datetime import datetime

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('dashboard.html')

@app.route('/dashboard-admin')
def dashboard_admin():
    if 'admin_access' not in session:
        return redirect(url_for('dashboard'))
    return render_template('dashboard-admin.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    pin = data.get('pin')
    
    user = User.query.filter_by(username=username, pin=pin).first()
    
    if user:
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({'success': True, 'message': 'Login berhasil'})
    else:
        return jsonify({'success': False, 'message': 'Username atau PIN salah'})

@app.route('/api/admin-access', methods=['POST'])
def api_admin_access():
    data = request.get_json()
    code = data.get('code')
    
    if code == '011090':
        session['admin_access'] = True
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Kode admin salah'})

@app.route('/api/user-data')
def api_user_data():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(session['user_id'])
    if user:
        return jsonify(user.to_dict())
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/balance-validation')
def api_balance_validation():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(session['user_id'])
    if user:
        required_savings = user.deposito * 0.015  # 1.5% of deposit
        current_savings = user.tabungan
        
        can_withdraw = current_savings >= required_savings
        shortage = max(0, required_savings - current_savings)
        
        return jsonify({
            'can_withdraw': can_withdraw,
            'required_savings': required_savings,
            'current_savings': current_savings,
            'shortage': shortage,
            'percentage': min(100, (current_savings / required_savings * 100)) if required_savings > 0 else 100
        })
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/notifications')
def api_notifications():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    notifications = Notification.query.order_by(Notification.waktu.desc()).limit(10).all()
    return jsonify([notif.to_dict() for notif in notifications])

@app.route('/api/popup')
def api_popup():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    popup = Popup.query.filter_by(aktif=True).first()
    if popup:
        return jsonify(popup.to_dict())
    else:
        return jsonify(None)

@app.route('/api/admin/add-tabungan', methods=['POST'])
def api_admin_add_tabungan():
    if 'admin_access' not in session:
        return jsonify({'error': 'Not authorized'}), 403
    
    data = request.get_json()
    amount = data.get('amount', 0)
    
    user = User.query.filter_by(username="Siti Aminah").first()
    if user:
        user.tabungan += amount
        db.session.commit()
        return jsonify({'success': True, 'new_balance': user.tabungan})
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/admin/add-deposito', methods=['POST'])
def api_admin_add_deposito():
    if 'admin_access' not in session:
        return jsonify({'error': 'Not authorized'}), 403
    
    data = request.get_json()
    amount = data.get('amount', 0)
    
    user = User.query.filter_by(username="Siti Aminah").first()
    if user:
        user.deposito += amount
        db.session.commit()
        return jsonify({'success': True, 'new_balance': user.deposito})
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/admin/send-notification', methods=['POST'])
def api_admin_send_notification():
    if 'admin_access' not in session:
        return jsonify({'error': 'Not authorized'}), 403
    
    data = request.get_json()
    message = data.get('message')
    
    notification = Notification(pesan=message)
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/admin/send-popup', methods=['POST'])
def api_admin_send_popup():
    if 'admin_access' not in session:
        return jsonify({'error': 'Not authorized'}), 403
    
    data = request.get_json()
    message = data.get('message')
    
    # Deactivate existing popups
    Popup.query.update({'aktif': False})
    
    # Create new popup
    popup = Popup(isi=message, aktif=True)
    db.session.add(popup)
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/chat/messages')
def api_chat_messages():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    messages = Chat.query.order_by(Chat.waktu.asc()).limit(50).all()
    return jsonify([msg.to_dict() for msg in messages])

@app.route('/api/chat/send', methods=['POST'])
def api_chat_send():
    if 'user_id' not in session and 'admin_access' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    message = data.get('message')
    
    from_user = "Admin" if 'admin_access' in session else session.get('username', 'User')
    to_user = "User" if 'admin_access' in session else "Admin"
    
    chat = Chat(from_user=from_user, to_user=to_user, pesan=message)
    db.session.add(chat)
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/admin/send-invoice', methods=['POST'])
def api_admin_send_invoice():
    if 'admin_access' not in session:
        return jsonify({'error': 'Not authorized'}), 403
    
    try:
        user = User.query.filter_by(username="Siti Aminah").first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create invoice content
        invoice_content = f"""
        <html>
        <body>
            <h2>Invoice Bank BRI - Deposit</h2>
            <p>Kepada: {user.username}</p>
            <p>Email: {user.email}</p>
            <hr>
            <p>Saldo Deposito: Rp {user.deposito:,}</p>
            <p>Saldo Tabungan: Rp {user.tabungan:,}</p>
            <hr>
            <p>Tanggal: {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
            <p>Terima kasih telah menggunakan layanan BRI.</p>
        </body>
        </html>
        """
        
        # Note: In production, you would implement actual email sending
        # For now, we'll just log the action
        logging.info(f"Invoice would be sent to {user.email}")
        logging.info(f"Invoice content: {invoice_content}")
        
        return jsonify({'success': True, 'message': 'Invoice berhasil dikirim'})
    
    except Exception as e:
        logging.error(f"Error sending invoice: {str(e)}")
        return jsonify({'error': 'Gagal mengirim invoice'}), 500

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})
