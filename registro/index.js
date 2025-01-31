const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');
const cors = require('cors');
const moment = require('moment');
moment.locale('es');

// Configuración CORS
const corsMiddleware = cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
});

exports.register = async (req, res) => {
  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return corsMiddleware(req, res, () => res.status(200).end());
  }

  corsMiddleware(req, res, async () => {
    try {
      const { 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        email, 
        password, 
      } = req.body;

      // Validación de campos obligatorios
      if (!nombre || !email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Nombre, email y contraseña son obligatorios' 
        });
      }

      // Conexión a MongoDB Atlas
      const uri = 'mongodb+srv://kerroris:Alondrabb11$@cluster0.6ngdm.mongodb.net/sample_airbnb?retryWrites=true&w=majority&appName=Cluster0';
      const client = await MongoClient.connect(uri, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
      });

      const db = client.db('xw_uteqcommers');  
      const usersCollection = db.collection('users');  

      // Verificar si el usuario ya existe
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }

      // Hashear la contraseña (deberías considerar usar bcrypt en producción)
      const hash = crypto.createHash('sha256');
      hash.update(password);
      const hashedPassword = hash.digest('hex');

      // Crear objeto de usuario
      const fechaUTC = moment().utcOffset('-06:00');  // Hora de CDMX
      
      const newUser = {
        name: nombre,
        apellido_paterno: apellido_paterno || '',
        apellido_materno: apellido_materno || '',
        email,
        password: hashedPassword,
        fecha_registro: fechaUTC.toDate(),
        fecha_actualizacion: fechaUTC.toDate()
      };

      // Insertar nuevo usuario
      const result = await usersCollection.insertOne(newUser);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        userId: result.insertedId
      });

      await client.close();

    } catch (err) {
      console.error('Error en registro:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });
};