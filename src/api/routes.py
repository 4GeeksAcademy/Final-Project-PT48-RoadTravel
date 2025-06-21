"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data.get('email') or not data.get('password') or not data.get('fullName'):
        return jsonify({'msg': 'No data was sent'}), 400
    email = data.get('email')
    password = data.get('password')
    is_active = data.get('is_active', False)

    created_user = User.query.filter_by(email=email).first()
    if created_user:
        return jsonify({'msg': 'Email is assigned to a created user already'}), 409

    new_user = User(
        email=email,
        password=password,
        is_active=is_active
    )
    db.session.add(new_user)

    try:
        db.session.commit()
        return jsonify(new_user.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'msg': f'Internal Server Error',
            'error': {str(e)}
        }), 500
