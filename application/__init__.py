from flask import Flask
from flask_cors import CORS
import pymongo
import json
from pymongo import MongoClient, InsertOne
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app=Flask(__name__)
CORS(app)
uri = "mongodb+srv://chalasanisiddarth:var1sid2@dashboard.vitz1t0.mongodb.net/?retryWrites=true&w=majority&appName=Dashboard"
client = MongoClient(uri, server_api=ServerApi('1'))
db=client['Dashboard']
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

from application import routes