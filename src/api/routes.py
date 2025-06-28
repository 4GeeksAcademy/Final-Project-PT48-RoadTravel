from flask import request, jsonify, Blueprint
from api.models import db, User, Car, RoleEnum, CarRole, Booking # Asegúrate de importar Booking
from api.utils import APIException
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime, date # Importa datetime y date
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError # Importa IntegrityError para manejo de errores de DB
from sqlalchemy import or_, not_ # Importa not_ para el filtro de disponibilidad

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
@jwt_required() # Protege esta ruta, ya que privateHome la consume.
def list_cars():
    car_type = request.args.get('type')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = db.session.query(Car) # Inicia la consulta

    if car_type:
        query = query.filter_by(type=car_type)

    # Convertir las fechas de string a objetos date
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
        # 1. Encuentra los car_id de los coches que *están* reservados en el rango dado.
        # Una reserva se superpone si: (reserva.start_day <= end_date AND reserva.end_day >= start_date)
        subquery_booked_car_ids = db.session.query(Booking.car_id).filter(
            Booking.start_day <= end_date,
            Booking.end_day >= start_date
        ).subquery() # Crea una subconsulta de IDs de coches reservados

        # 2. Filtra la consulta principal para incluir solo los coches cuya license_plate
        # NO esté en la lista de coches reservados.
        query = query.filter(not_(Car.license_plate.in_(subquery_booked_car_ids)))
    
    # Asegúrate de que solo se muestren coches activos
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
    # Usar db.session.get para obtener por PK
    user = db.session.get(User, uid)
    if not user or user.role != RoleEnum.administrator:
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json() or {}
    fields = ['license_plate', 'name', 'make', 'model', 'year', 'color',
              'serial_number', 'pieces', 'type', 'status', 'image_url']
    missing = [f for f in fields if not data.get(f)]
    if missing:
        return jsonify({"msg": f"Missing fields: {missing}"}), 400

    # Usar db.session.get para comprobar existencia
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
        # Puedes añadir un log aquí para más detalles del error
        return jsonify({"msg": "Error al guardar el coche en la base de datos", "error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado al importar coche: {e}")
        return jsonify({"msg": "Error interno del servidor al importar coche", "error": str(e)}), 500
    

@api.route('/bookings', methods=['POST'])
@jwt_required() # Protege esta ruta: solo usuarios autenticados pueden crear reservas
def create_booking():
    user_id = get_jwt_identity() # Obtiene el ID del usuario del token JWT
    current_user = db.session.get(User, int(user_id)) # Obtiene el objeto User

    if not current_user:
        return jsonify({'msg': 'User not found'}), 404
    if not current_user.is_active:
        return jsonify({'msg': 'User account is not active. Please contact support.'}), 403 # Prohibido

    data = request.get_json()

    required_fields = ['car_id', 'start_day', 'end_day', 'location']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'msg': f"Missing fields: {', '.join(missing_fields)}"}), 400

    car_id = data['car_id']
    location = data['location']

    # --- 1. Validar y Parsear Fechas ---
    try:
        start_day = datetime.strptime(data['start_day'], '%Y-%m-%d').date()
        end_day = datetime.strptime(data['end_day'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'msg': 'Formato de fecha inválido. Usa YYYY-MM-DD'}), 400

    if start_day < date.today():
        return jsonify({'msg': 'La fecha de inicio de la reserva no puede ser en el pasado'}), 400
    if end_day < start_day:
        return jsonify({'msg': 'La fecha de fin de la reserva no puede ser anterior a la fecha de inicio'}), 400

    # --- 2. Obtener Detalles del Coche ---
    car = db.session.get(Car, car_id)
    if not car:
        return jsonify({'msg': 'Coche no encontrado con la matrícula proporcionada'}), 404
    if not car.is_active:
        return jsonify({'msg': 'Este coche no está activo y no se puede reservar'}), 409 # Conflicto

    # --- 3. Verificar Disponibilidad del Coche ---
    # Un coche NO está disponible si existe alguna reserva que se superponga
    # con el rango de fechas solicitado (start_day, end_day).
    # Superposición: (reserva.start_day <= end_day AND reserva.end_day >= start_day)
    overlapping_bookings = db.session.query(Booking).filter(
        Booking.car_id == car_id,
        Booking.start_day <= end_day,
        Booking.end_day >= start_day
    ).count()

    if overlapping_bookings > 0:
        return jsonify({'msg': 'Este coche no está disponible para las fechas seleccionadas. Ya existe una reserva que se superpone.'}), 409 # Conflicto

    # --- 4. Calcular el Monto de la Reserva ---
    duration_days = (end_day - start_day).days + 1 # Sumar 1 para incluir el día de inicio
    if duration_days <= 0: # En caso de que end_day == start_day, la duración es 1 día
        return jsonify({'msg': 'La duración de la reserva debe ser al menos un día'}), 400

    amount = car.price * duration_days # Asumiendo que car.price es el precio por día

    # --- 5. Crear la Nueva Reserva ---
    new_booking = Booking(
        user_id=current_user.id,
        car_id=car.license_plate,
        location=location,
        car_model=car.model, # Usamos el modelo del objeto Car
        amount=amount,
        start_day=start_day,
        end_day=end_day
    )

    db.session.add(new_booking)

    try:
        db.session.commit()
        return jsonify({
            'msg': 'Booking created successfully',
            'booking': new_booking.serialize() # Devuelve la reserva recién creada
        }), 201 # 201 Created
    except Exception as e:
        db.session.rollback() # Revierte la transacción en caso de error
        print(f"Error creating booking: {e}") # Para depuración en el servidor
        return jsonify({'msg': 'Internal server error while creating booking', 'error': str(e)}), 500