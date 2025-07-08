from flask import request, jsonify, Blueprint
from api.models import db, User, Car, RoleEnum, CarRole, Booking
from api.utils import APIException
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
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
    missing_fields = [field for field in required_fields if not data.get(field)]

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

    
    user = db.session.execute(db.select(User).filter_by(email=data['email'])).scalar_one_or_none()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Bad credentials"}), 401


    user_roles = [user.role.value]
    token = create_access_token(identity=str(user.id), additional_claims={"roles": user_roles}, expires_delta=timedelta(hours=2))
    return jsonify({"access_token": token, "user": user.serialize(), "roles": user_roles}), 200


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
    db.session.commit()
    return jsonify(car.serialize()), 201


@api.route('/my-reservation', methods=['POST'])
@jwt_required()
def make_reservation():
    user_id = get_jwt_identity()
    data = request.get_json()
    car_id = data.get('car_id')
    location = data.get('location')
    car_model = data.get('car_model')
    amount = data.get('amount')
    license_number = data.get('license_number')
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
        license_number = license_number,
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

@api.route('/my-reservations', methods=['GET'])
@jwt_required()
def get_reservations():
    user_id = get_jwt_identity()
    reservations = Booking.query.filter_by(user_id=user_id).all()

    if len(reservations) < 1:
        return jsonify({'msg': 'No reservations listed'}), 404

    return jsonify([reservation.serialize() for reservation in reservations]), 200


@api.route('/my-reservation/<int:id>', methods=['GET'])
@jwt_required()
def get_reservation(id):
    user_id = get_jwt_identity()
    reservation = Booking.query.get(id)

    if not reservation:
        return jsonify({'msg': 'No reservation listed'}), 404
    print(user_id)
    print(reservation.user_id)
    # if user_id != reservation.user_id:
    #     return jsonify({'msg': 'No authorized to see reservation'}), 403

    return jsonify(reservation.serialize()), 200


@api.route('/my-reservation/<int:id>', methods=['PUT'])
@jwt_required()
def edit_reservation(id):
    user_id = get_jwt_identity()
    data = request.get_json()
    reservation = Booking.query.get(id)
    if not reservation:
        return jsonify({'msg': 'No reservation listed'}), 404

    # if user_id != reservation.user_id:
    #     return jsonify({'msg': 'No authorized to edit reservation'}), 403

    if not data:
        return jsonify({'msg': 'No data was edited'}), 400

    start_day = data.get('start_day')
    end_day = data.get('end_day')
    price = data.get('price')
    if not start_day or not end_day:
        return jsonify({'msg': 'Missing start day or end day'}), 400

    try:
        start_day_obj = datetime.strptime(start_day, '%Y-%m-%d').date()
        end_day_obj = datetime.strptime(end_day, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'msg': 'Invalid date format'}), 400

    if start_day_obj > end_day_obj:
        return jsonify({'msg': 'Start day must be before end day'}), 400

    conflict_booking = Booking.query.filter(
        Booking.car_id == reservation.car_id,
        Booking.id != reservation.id,
        Booking.start_day <= end_day_obj,
        Booking.end_day >= start_day_obj,
    ).first()
    if conflict_booking:
        return jsonify({'msg': 'Car already booked in that date range'}), 409

    reservation.start_day = start_day_obj
    reservation.end_day = end_day_obj
    reservation.amount = price
    db.session.commit()

    return jsonify({'msg': 'Reservation updated successfully'}), 200


@api.route('/my-reservation/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_reservation(id):
    user_id = get_jwt_identity()
    reservation = Booking.query.get(id)

    if not reservation:
        return jsonify({'msg': 'No reservation listed'}), 404

    # if user_id != reservation.user_id:
    #     return jsonify({'msg': 'No authorized to delete reservation'}), 403
    db.session.delete(reservation)
    db.session.commit()

    return jsonify({'msg': 'Reservation deleted succesfully'}), 200


@api.route('/admin/reservations', methods=['GET'])
@jwt_required()
def get_all_reservations():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    

    if not user or user.role != RoleEnum.administrator:
        return jsonify({"msg": "Unauthorized"}), 403
    
  
    reservations = db.session.query(
        Booking,
        User.name.label('user_name'),
        User.email.label('user_email')
    ).join(
        User, Booking.user_id == User.id
    ).all()
    
    
    result = []
    for booking, user_name, user_email in reservations:
        booking_data = booking.serialize()
        booking_data['user_name'] = user_name
        booking_data['user_email'] = user_email
        result.append(booking_data)
    
    return jsonify(result), 200

  
    # trans = "automatic" if data.get('transmission') == "a" else "manual"

    # car = Car(
    #     license_plate=data['license_plate'],
    #     name=data['name'],
    #     make=data['make'],
    #     model=data['model'],
    #     year=data['year'],
    #     color=data['color'],
    #     serial_number=data['serial_number'],
    #     pieces=data['pieces'],
    #     price=get_price_for_type(data['type']),
    #     type=data['type'],
    #     status=CarRole[data['status']],  # ← Aquí está la corrección clave
    #     image_url=data['image_url'],
    #     user_id=uid,
    #     fuel_type=data.get('fuel_type'),
    #     transmission=trans,
    #     cylinders=data.get('cylinders'),
    #     displacement=data.get('displacement'),
    #     drive=data.get('drive')
    # )

    # db.session.add(car)
    # db.session.commit()
    # return jsonify(car.serialize()), 201
    

