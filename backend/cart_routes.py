from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Cart
from bson import ObjectId

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    try:
        user_id = get_jwt_identity()
        cart = Cart.get_user_cart(user_id)
        return jsonify({"cart": cart}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        if not product_id:
            return jsonify({"error": "Product ID is required"}), 400
        cart = Cart.get_user_cart(user_id)
        items = cart.get('items', [])
        existing_item = next((item for item in items if item['product_id'] == product_id), None)
        if existing_item:
            existing_item['quantity'] += quantity
        else:
            items.append({
                'product_id': product_id,
                'quantity': quantity,
                'added_at': ObjectId().generation_time.isoformat()
            })
        Cart.update_cart(user_id, items)
        return jsonify({"message": "Product added to cart", "cart": {"user_id": user_id, "items": items}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_cart_item():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity')
        if not product_id or quantity is None:
            return jsonify({"error": "Product ID and quantity are required"}), 400
        cart = Cart.get_user_cart(user_id)
        items = cart.get('items', [])
        if quantity <= 0:
            items = [item for item in items if item['product_id'] != product_id]
        else:
            for item in items:
                if item['product_id'] == product_id:
                    item['quantity'] = quantity
                    break
        Cart.update_cart(user_id, items)
        return jsonify({"message": "Cart updated", "cart": {"user_id": user_id, "items": items}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/remove/<product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(product_id):
    try:
        user_id = get_jwt_identity()
        cart = Cart.get_user_cart(user_id)
        items = cart.get('items', [])
        items = [item for item in items if item['product_id'] != product_id]
        Cart.update_cart(user_id, items)
        return jsonify({"message": "Product removed from cart", "cart": {"user_id": user_id, "items": items}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    try:
        user_id = get_jwt_identity()
        Cart.update_cart(user_id, [])
        return jsonify({"message": "Cart cleared"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
