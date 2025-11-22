from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        if not all([email, password, name]):
            return jsonify({"error": "All fields are required"}), 400
        user_id, error = User.create_user(email, password, name)
        if error:
            return jsonify({"error": error}), 400
        access_token = create_access_token(identity=str(user_id))
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": {"id": user_id, "email": email, "name": name}
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not all([email, password]):
            return jsonify({"error": "Email and password are required"}), 400
        user, error = User.verify_user(email, password)
        if error:
            return jsonify({"error": error}), 401
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": str(user['_id']),
                "email": user['email'],
                "name": user['name'],
                "role": user.get('role', 'user')
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.get_user_by_id(ObjectId(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "user": {
                "id": str(user['_id']),
                "email": user['email'],
                "name": user['name'],
                "role": user.get('role', 'user')
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
