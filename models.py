from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    pin = db.Column(db.String(10), nullable=False)
    tabungan = db.Column(db.BigInteger, default=0)
    deposito = db.Column(db.BigInteger, default=0)
    email = db.Column(db.String(120), default="siti.aminah@email.com")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'tabungan': self.tabungan,
            'deposito': self.deposito,
            'email': self.email
        }

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pesan = db.Column(db.Text, nullable=False)
    waktu = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'pesan': self.pesan,
            'waktu': self.waktu.strftime('%Y-%m-%d %H:%M:%S'),
            'is_read': self.is_read
        }

class Popup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    isi = db.Column(db.Text, nullable=False)
    aktif = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'isi': self.isi,
            'aktif': self.aktif,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_user = db.Column(db.String(100), nullable=False)
    to_user = db.Column(db.String(100), nullable=False)
    pesan = db.Column(db.Text, nullable=False)
    waktu = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'from_user': self.from_user,
            'to_user': self.to_user,
            'pesan': self.pesan,
            'waktu': self.waktu.strftime('%Y-%m-%d %H:%M:%S')
        }
