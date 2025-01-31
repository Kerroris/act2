const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const cors = require('cors');
const moment = require('moment');
moment.locale('es');

// Configuración CORS
const corsMiddleware = cors({
  origin: '*',
  methods: ['DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
});

exports.deleteUser = async (req, res) => {
  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return corsMiddleware(req, res, () => res.status(200).end());
  }

  corsMiddleware(req, res, async () => {
    try {
      const { id } = req.query; // Obtener el ID del usuario desde la URL

      // Validación: ID es obligatorio
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del usuario es obligatorio'
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

      // Verificar si el usuario existe
      const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Realizar la eliminación física
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo eliminar el usuario'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
        userId: id
      });

      await client.close();

    } catch (err) {
      console.error('Error en eliminación:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });
};