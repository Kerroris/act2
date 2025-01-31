const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb'); // Importar ObjectId correctamente
const crypto = require('crypto');
const cors = require('cors');
const moment = require('moment');
moment.locale('es');

// Configuración CORS
const corsMiddleware = cors({
  origin: '*',
  methods: ['PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
});

exports.updateUser = async (req, res) => {
  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return corsMiddleware(req, res, () => res.status(200).end());
  }

  corsMiddleware(req, res, async () => {
    try {
      const { id } = req.query; 

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del usuario es obligatorio'
        });
      }

      const { 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        email, 
        password 
      } = req.body;

      if (!nombre && !apellido_paterno && !apellido_materno && !email && !password) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar al menos un campo para actualizar'
        });
      }

      const uri = 'mongodb+srv://kerroris:Alondrabb11$@cluster0.6ngdm.mongodb.net/sample_airbnb?retryWrites=true&w=majority&appName=Cluster0';
      const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      const db = client.db('xw_uteqcommers');
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const updateFields = {};
      if (nombre) updateFields.name = nombre;
      if (apellido_paterno) updateFields.apellido_paterno = apellido_paterno;
      if (apellido_materno) updateFields.apellido_materno = apellido_materno;
      if (email) updateFields.email = email;
      if (password) {
        const hash = crypto.createHash('sha256');
        hash.update(password);
        updateFields.password = hash.digest('hex');
      }


      updateFields.fecha_actualizacion = moment().utcOffset('-06:00').toDate();

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) }, 
        { $set: updateFields }
      );

      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se realizaron cambios'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        updatedFields: updateFields
      });

      await client.close();

    } catch (err) {
      console.error('Error en actualización:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });
};