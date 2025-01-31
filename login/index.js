const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const moment = require('moment');
moment.locale('es');

// Configuración CORS
const corsMiddleware = cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
});

exports.login = async (req, res) => {

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return corsMiddleware(req, res, () => res.status(200).end());
  }

  corsMiddleware(req, res, async () => {
    try {
      const { email, password } = req.body;

      // Validación de campos obligatorios
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son obligatorios'
        });
      }

      // Conexión a MongoDB
      const uri = 'mongodb+srv://kerroris:Alondrabb11$@cluster0.6ngdm.mongodb.net/sample_airbnb?retryWrites=true&w=majority&appName=Cluster0';
      const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      const db = client.db('xw_uteqcommers');
      const usersCollection = db.collection('users');

      // Buscar usuario
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const hash = crypto.createHash('sha256');
      hash.update(password);
      const hashedPassword = hash.digest('hex');

      if (hashedPassword !== user.password) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar JWT
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.esDoctor ? 'doctor' : 'usuario'
        },
        process.env.JWT_SECRET || 'CERVANTEShECTOR25112022', 
        { expiresIn: '30d' }
      );

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        user: {
          _id: user._id,
          nombre: user.name,
          apellido_paterno: user.apellido_paterno,
          apellido_materno: user.apellido_materno,
          email: user.email,
          esDoctor: user.esDoctor
        },
        token
      });

      await client.close();

    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });
};