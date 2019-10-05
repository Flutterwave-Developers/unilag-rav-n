#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Oct  4 20:12:47 2019

@author: nightking
"""

import functools
import json
import os
from bson.objectid import ObjectId
import flask
from flask import render_template, request
from authlib.client import OAuth2Session
import google.oauth2.credentials
import googleapiclient.discovery
from flask import Flask, request
from flask_restful import Resource, Api
from sqlalchemy import create_engine
from json import dumps
import os
import pandas as pd
from flask_jsonpify import jsonify
import flask_restful.representations.json
from itertools import combinations

from waitress import serve

import dialogflow_v2 as dialogflow
from google.api_core.exceptions import InvalidArgument
from flask_cors import CORS
import auth
import pymongo



client = pymongo.MongoClient("mongodb+srv://Ravn:Ravn1234@cluster0-l4dyl.azure.mongodb.net/admin?retryWrites=true&w=majority")
db=client.ravn
collection=db.users
app = flask.Flask(__name__)
app.secret_key = os.environ.get("FN_FLASK_SECRET_KEY", default=False)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

app.register_blueprint(auth.app)

user_data = None
@app.route('/' , methods=['GET', 'POST'])
def index():
    if auth.is_logged_in():
        if request.method == 'GET':
            user_info = auth.get_user_info()
            global user_data
            user_data = {'email':user_info['email'],'name':user_info['name']}
            
            if len(list(collection.find({"email":user_info['email']}))) <1 :
                #For the condition that thte user hasnt signed up, ask for phone number
                return open('get_number.html').read()
                if request.method == 'POST':
                  result = request.form['number']
                  user_data['phone'] = result
                  db.users.insert_one(user_data)
                  return list(collection.find({"email":user_info['email']}))[0]
                return 'You are Logged In'
    return 'You are not logged in.'

  
    
    
DIALOGFLOW_PROJECT_ID = 'rave-hackathon-bqddet'
DIALOGFLOW_LANGUAGE_CODE = 'en-US'
GOOGLE_APPLICATION_CREDENTIALS = 'credentials.json'
SESSION_ID = 'current-user-id3'
session_client = dialogflow.SessionsClient.from_service_account_json('credentials.json')
order_string = ''
def driver(text_to_be_analyzed):
    session = session_client.session_path(DIALOGFLOW_PROJECT_ID, SESSION_ID)
    text_input = dialogflow.types.TextInput(text=text_to_be_analyzed, language_code=DIALOGFLOW_LANGUAGE_CODE)
    query_input = dialogflow.types.QueryInput(text=text_input)
    try:
        response = session_client.detect_intent(session=session, query_input=query_input)
    except InvalidArgument:
        raise
    if (response.query_result.fulfillment_text.lower().find('ordering') != -1): 
        #print(response)
        order_string = "-".join(response.query_result.fulfillment_text.split()[2:-2])
        #call Bakare's APi and send order details
        return {'order_status':'completed',
                'order_type':order_string,
                'query_text':response.query_result.query_text,
                'detected_intent':response.query_result.intent.display_name,
                'confidence_score':response.query_result.intent_detection_confidence,
                'fulfillment_text':response.query_result.fulfillment_text,
                'audio': str(response.output_audio)
                }
    else:
        return {'order_status':'open',
                'query_text':response.query_result.query_text,
                'detected_intent':response.query_result.intent.display_name,
                'confidence_score':response.query_result.intent_detection_confidence,
                'fulfillment_text':response.query_result.fulfillment_text,
                'audio': str(response.output_audio)
                }

response = driver('Order a chicken supreme')




@app.route('/dialogflow/pizza_types/<string:types>')
def show_post(types):
  results = driver(str(types))
  return json.dumps(results)