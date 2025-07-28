import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Enable CORS for API calls
CORS(app)

# Configure the database - Use Neon Database online
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

with app.app_context():
    # Import models to ensure tables are created
    import models  # noqa: F401
    
    # Create all tables
    db.create_all()
    
    # Initialize default user if not exists
    from models import User, Notification, Popup, Chat
    
    default_user = User.query.filter_by(username="Siti Aminah").first()
    if not default_user:
        default_user = User(
            username="Siti Aminah",
            pin="112233",
            tabungan=1100000,
            deposito=200350000,
            email="siti.aminah@email.com"
        )
        db.session.add(default_user)
        
        # Add sample notifications
        sample_notifications = [
            Notification(pesan="Selamat datang di Deposit BRI! Akun Anda telah aktif."),
            Notification(pesan="Promo bunga deposito 6% untuk nasabah baru. Berlaku hingga akhir bulan."),
            Notification(pesan="Jangan lupa untuk menjaga keamanan PIN Anda.")
        ]
        
        for notif in sample_notifications:
            db.session.add(notif)
        
        # Add sample popup message
        welcome_popup = Popup(
            isi="Selamat datang di aplikasi mobile banking Deposit BRI! Nikmati kemudahan bertransaksi dengan aman.",
            aktif=True
        )
        db.session.add(welcome_popup)
        
        db.session.commit()
        logging.info("Default user and sample data created")

# Import routes
import routes  # noqa: F401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
