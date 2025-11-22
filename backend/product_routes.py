from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Product
from bson import ObjectId

product_bp = Blueprint('products', __name__)

@product_bp.route('/', methods=['GET'])
def get_products():
    try:
        products = Product.get_all_products()
        for product in products:
            product['_id'] = str(product['_id'])
        return jsonify({"products": products}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/search', methods=['GET'])
def search_products():
    try:
        query = request.args.get('q', '')
        category = request.args.get('category')
        brand = request.args.get('brand')
        color = request.args.get('color')
        style = request.args.get('style')
        products = Product.search_products(query, category, brand, color, style)
        for product in products:
            product['_id'] = str(product['_id'])
        return jsonify({"products": products}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.get_product_by_id(ObjectId(product_id))
        if not product:
            return jsonify({"error": "Product not found"}), 404
        product['_id'] = str(product['_id'])
        return jsonify({"product": product}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/admin/add', methods=['POST'])
@jwt_required()
def add_product():
    try:
        data = request.get_json()
        required_fields = ['name', 'category', 'price', 'description']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        result = Product.add_product(data)
        return jsonify({
            "message": "Product added successfully",
            "product_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/admin/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        data = request.get_json()
        result = Product.update_product(ObjectId(product_id), data)
        if result.modified_count == 0:
            return jsonify({"error": "Product not found or no changes made"}), 404
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/admin/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        result = Product.delete_product(ObjectId(product_id))
        if result.deleted_count == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
