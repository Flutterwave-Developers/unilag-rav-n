#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Oct  5 06:21:01 2019

@author: nightking
"""

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





DIALOGFLOW_PROJECT_ID = 'deimos-cloud'
DIALOGFLOW_LANGUAGE_CODE = 'en-US'
GOOGLE_APPLICATION_CREDENTIALS = 'credentials.json'
SESSION_ID = 'current-user-id'
session_client = dialogflow.SessionsClient.from_service_account_json('credentials.json')

def driver(text_to_be_analyzed):
    session = session_client.session_path(DIALOGFLOW_PROJECT_ID, SESSION_ID)
    text_input = dialogflow.types.TextInput(text=text_to_be_analyzed, language_code=DIALOGFLOW_LANGUAGE_CODE)
    query_input = dialogflow.types.QueryInput(text=text_input)
    try:
        response = session_client.detect_intent(session=session, query_input=query_input)
    except InvalidArgument:
        raise
    return {'query_text':response.query_result.query_text,
            'detected_intent':response.query_result.intent.display_name,
            'confidence_score':response.query_result.intent_detection_confidence,
            'fulfillment_text':response.query_result.fulfillment_text,
            'audio':response.output_audio
            }


response = driver('Order Pepperoni Pizza')


