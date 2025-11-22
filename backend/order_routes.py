from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Order, Cart
from bson import ObjectId

order_bp = Blueprint('orders', __name__)

@order_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        cart = Cart.get_user_cart(user_id)
        items = cart.get('items', [])
        if not items:
            return jsonify({"error": "Cart is empty"}), 400
        order_data = {
            "user_id": user_id,
            "items": items,
            "shipping_address": data.get('shipping_address', {}),
            "payment_method": data.get('payment_method', 'card'),
            "total_amount": data.get('total_amount', 0)
        }
        result = Order.create_order(order_data)
        Cart.update_cart(user_id, [])
        return jsonify({
            "message": "Order created successfully",
            "order_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/my-orders', methods=['GET'])
@jwt_required()
def get_my_orders():
    try:
        user_id = get_jwt_identity()
        orders = Order.get_user_orders(user_id)
        for order in orders:
            order['_id'] = str(order['_id'])
        return jsonify({"orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/admin/all', methods=['GET'])
@jwt_required()
def get_all_orders():
    try:
        orders = Order.get_all_orders()
        for order in orders:
            order['_id'] = str(order['_id'])
        return jsonify({"orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@order_bp.route('/admin/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get('status')
        if not status:
            return jsonify({"error": "Status is required"}), 400
        result = Order.update_order_status(ObjectId(order_id), status)
        if result.modified_count == 0:
            return jsonify({"error": "Order not found"}), 404
        return jsonify({"message": "Order status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
