from flask import request, jsonify, Blueprint
from api.models import db, User, Car, RoleEnum, CarRole, Booking
from api.utils import APIException
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime, date 
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError  
from sqlalchemy import or_, not_ 

api = Blueprint('api', __name__)
# Allow CORS requests to this API
CORS(api)

# Helper function (exists in your code)
def get_price_for_type(type_):
    return {
        "subcompact": 25,
        "medium": 50,
        "premium": 100
    }.get(type_, 0)


# --- AUTHENTICATION ROUTES ---

@api.route('/signup', methods=['POST'])
def create_user():
    data = request.get_json()

    required_fields = ['email', 'password', 'name', 'address', 'phone']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({'msg': f"Missing fields: {', '.join(missing_fields)}"}), 400

    email = data['email']
    existing_user = db.session.execute(db.select(User).filter_by(email=email)).scalar_one_or_none()
    if existing_user:
        return jsonify({'msg': 'Email is already in use'}), 409

    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        name=data['name'],
        email=email,
        password=hashed_password,
        address=data['address'],
        phone=data['phone'],
        role=RoleEnum.client
    )
    db.session.add(new_user)

    try:
        db.session.commit()
        return jsonify({
            'msg': 'User created successfully',
            'user': new_user.serialize()
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'msg': 'Database error: Could not create user', 'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error during user creation: {e}")
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    if not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Provide email and password"}), 400

    # Usar db.session.execute para consultas más modernas
    user = db.session.execute(db.select(User).filter_by(email=data['email'])).scalar_one_or_none()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Bad credentials"}), 401

    token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=2))
    return jsonify({"access_token": token, "user": user.serialize()}), 200


# --- CAR ROUTES ---

@api.route('/cars', methods=['GET'])
@jwt_required() 
def list_cars():
    car_type = request.args.get('type')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = db.session.query(Car) 

    if car_type:
        query = query.filter_by(type=car_type)


    start_date = None
    end_date = None
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'msg': 'Formato de fecha de inicio inválido. Usa YYYY-MM-DD'}), 400
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'msg': 'Formato de fecha de fin inválido. Usa YYYY-MM-DD'}), 400

    # Lógica de filtrado por disponibilidad de fechas (sin superposición de reservas)
    if start_date and end_date:
        subquery_booked_car_ids = db.session.query(Booking.car_id).filter(
            Booking.start_day <= end_date,
            Booking.end_day >= start_date
        ).subquery() 

        query = query.filter(not_(Car.license_plate.in_(subquery_booked_car_ids)))
    
    query = query.filter_by(is_active=True)

    cars = query.all()
    return jsonify([c.serialize() for c in cars]), 200


@api.route('/cars/<license_plate>', methods=['GET'])
def get_car(license_plate):
    # Usar db.session.get para obtener por PK (más directo)
    car = db.session.get(Car, license_plate)
    if not car:
        return jsonify({"msg": "Not found"}), 404
    return jsonify(car.serialize()), 200


@api.route('/cars/import', methods=['POST'])
@jwt_required()
def import_car():
    uid = int(get_jwt_identity())
    user = db.session.get(User, uid)
    if not user or user.role != RoleEnum.administrator:
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json() or {}
    fields = ['license_plate', 'name', 'make', 'model', 'year', 'color',
              'serial_number', 'pieces', 'type', 'status', 'image_url']
    missing = [f for f in fields if not data.get(f)]
    if missing:
        return jsonify({"msg": f"Missing fields: {missing}"}), 400

    if db.session.get(Car, data['license_plate']):
        return jsonify({"msg": "Car already exists"}), 409

    trans = "automatic" if data.get('transmission') == "a" else "manual"

    car = Car(
        license_plate=data['license_plate'],
        name=data['name'],
        make=data['make'],
        model=data['model'],
        year=data['year'],
        color=data['color'],
        serial_number=data['serial_number'],
        pieces=data['pieces'],
        price=get_price_for_type(data['type']),
        type=data['type'],
        status=CarRole[data['status']],
        image_url=data['image_url'],
        user_id=uid,
        fuel_type=data.get('fuel_type'),
        transmission=trans,
        cylinders=data.get('cylinders'),
        displacement=data.get('displacement'),
        drive=data.get('drive')
    )

    db.session.add(car)
    try:
        db.session.commit()
        return jsonify(car.serialize()), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"msg": "Error al guardar el coche en la base de datos", "error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado al importar coche: {e}")
        return jsonify({"msg": "Error interno del servidor al importar coche", "error": str(e)}), 500
    

@api.route('/my-reservation', methods=['POST'])
@jwt_required()
def make_reservation():
    user_id = get_jwt_identity()
    data = request.get_json()
    car_id = data.get('car_id')
    location = data.get('location')
    car_model = data.get('car_model')
    amount = data.get('amount')
    start_day_str = data.get('start_day')
    end_day_str = data.get('end_day')
    start_day_obj = datetime.strptime(start_day_str, '%Y-%m-%d').date()
    end_day_obj = datetime.strptime(end_day_str, '%Y-%m-%d').date()
    new_booking = Booking(
        user_id=user_id,
        car_id=car_id,
        location=location,
        car_model=car_model,
        amount=amount,
        start_day=start_day_obj,
        end_day=end_day_obj
    )
    if not start_day_obj or not end_day_obj:
        return jsonify({'msg': 'Missing start day or end day'}), 400
    if start_day_obj > end_day_obj:
        return jsonify({'msg': 'Start day must be before end day'}), 400
    db.session.add(new_booking)
    db.session.commit()
    return jsonify(msg='Reservation created succesfully', new_booking=new_booking.serialize()), 201
