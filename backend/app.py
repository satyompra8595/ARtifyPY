from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours

# Initialize extensions
CORS(app)
jwt = JWTManager(app)

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client.get_database()
    print("✅ Connected to MongoDB successfully")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")
    db = None

# Import and register blueprints
from auth import auth_bp
from product_routes import product_bp
from order_routes import order_bp
from cart_routes import cart_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(product_bp, url_prefix='/api/products')
app.register_blueprint(order_bp, url_prefix='/api/orders')
app.register_blueprint(cart_bp, url_prefix='/api/cart')

@app.route('/')
def home():
    return jsonify({"message": "ARtify API is running!", "status": "success"})

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "database": "connected" if db else "disconnected"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
