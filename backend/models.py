from pymongo import MongoClient
from datetime import datetime
import os
import bcrypt

client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
db = client.get_database()

class User:
    @staticmethod
    def create_user(email, password, name):
        if db.users.find_one({"email": email}):
            return None, "User already exists"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user = {
            "email": email,
            "password": hashed_password,
            "name": name,
            "created_at": datetime.utcnow(),
            "role": "user"
        }
        result = db.users.insert_one(user)
        return str(result.inserted_id), None

    @staticmethod
    def verify_user(email, password):
        user = db.users.find_one({"email": email})
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return user, None
        return None, "Invalid credentials"

    @staticmethod
    def get_user_by_id(user_id):
        return db.users.find_one({"_id": user_id})

class Product:
    @staticmethod
    def get_all_products():
        return list(db.products.find({}))

    @staticmethod
    def get_product_by_id(product_id):
        return db.products.find_one({"_id": product_id})

    @staticmethod
    def search_products(query, category=None, brand=None, color=None, style=None):
        search_filter = {}
        if query:
            search_filter['$or'] = [
                {'name': {'$regex': query, '$options': 'i'}},
                {'category': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}}
            ]
        if category:
            search_filter['category'] = category
        if brand:
            search_filter['brand'] = brand
        if color:
            search_filter['colors'] = color
        if style:
            search_filter['style'] = style
        return list(db.products.find(search_filter))

    @staticmethod
    def add_product(product_data):
        product_data['created_at'] = datetime.utcnow()
        return db.products.insert_one(product_data)

    @staticmethod
    def update_product(product_id, update_data):
        return db.products.update_one({"_id": product_id}, {"$set": update_data})

    @staticmethod
    def delete_product(product_id):
        return db.products.delete_one({"_id": product_id})

class Cart:
    @staticmethod
    def get_user_cart(user_id):
        return db.carts.find_one({"user_id": user_id}) or {"user_id": user_id, "items": []}

    @staticmethod
    def update_cart(user_id, items):
        return db.carts.update_one(
            {"user_id": user_id},
            {"$set": {"items": items, "updated_at": datetime.utcnow()}},
            upsert=True
        )

class Order:
    @staticmethod
    def create_order(order_data):
        order_data['created_at'] = datetime.utcnow()
        order_data['status'] = 'pending'
        return db.orders.insert_one(order_data)

    @staticmethod
    def get_user_orders(user_id):
        return list(db.orders.find({"user_id": user_id}).sort("created_at", -1))

    @staticmethod
    def get_all_orders():
        return list(db.orders.find({}).sort("created_at", -1))

    @staticmethod
    def update_order_status(order_id, status):
        return db.orders.update_one(
            {"_id": order_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
