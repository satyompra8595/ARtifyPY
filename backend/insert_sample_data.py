import os
import sys
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGODB_URI)
db = client.get_database()

def insert_sample_data():
    print("🚀 Inserting sample data into MongoDB...")
    db.products.delete_many({})
    db.users.delete_many({"email": {"$ne": "admin@artify.com"}})
    sample_products = [
        {
            "_id": ObjectId("651f15b4c45a8c2a34d87a91"),
            "name": "Classic Aviator Sunglasses",
            "category": "glasses",
            "price": 129.99,
            "description": "Timeless aviator sunglasses with UV400 protection and lightweight metal frame",
            "brand": "Ray-Ban",
            "colors": ["black", "gold", "silver"],
            "style": "aviator",
            "model_path": "/aviator_sunglasses.glb",
            "features": ["Polarized", "UV Protection", "Lightweight"],
            "in_stock": True,
            "stock_quantity": 50,
            "created_at": datetime.utcnow()
        }
    ]
    db.products.insert_many(sample_products)
    print("✅ Sample data inserted.")

if __name__ == '__main__':
    insert_sample_data()
