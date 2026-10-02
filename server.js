const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { dbConnection } = require('./backend/database/config');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8000;

        // Rutas principales de la API REST
        this.paths = {
            duenos: '/api/duenos',
            dueños: '/api/dueños',
            veterinarios: '/api/veterinarios',
            mascotas: '/api/mascotas',
            visitas: '/api/visitas',
            tratamientos: '/api/tratamientos'
        };

        // Middlewares globales
        this.middlewares();

        // Rutas de la aplicación
        this.routes();
    }

    /**
     * Conecta a MongoDB Atlas.
     * SI LA CONEXIÓN FALLA, EL PROCESO SE DETIENE (process.exit(1)) 
     * Y EL SERVIDOR NO ESCUCHARÁ PETICIONES HTTP.
     */
    async conectarDB() {
        try {
            await dbConnection();
        } catch (error) {
            console.error('\n===============================================================');
            console.error('🔴 ERROR CRÍTICO: NO SE PUDO CONECTAR A LA BASE DE DATOS MONGO ATLAS.');
            console.error('⚠️ EL SERVIDOR NO SE EJECUTARÁ HASTA QUE SE ESTABLEZCA LA CONEXIÓN.');
            console.error('Asegúrese de configurar su URL de Mongo Atlas en el archivo .env (MONGODB_CNN).');
            console.error('===============================================================\n');
            process.exit(1);
        }
    }

    middlewares() {
        // CORS
        this.app.use(cors());

        // Lectura y parseo del body a JSON
        this.app.use(express.json());

        // Servir archivos estáticos del frontend (si interfaz/dist existe)
        const frontendDist = path.join(__dirname, 'interfaz/dist');
        if (fs.existsSync(frontendDist)) {
            this.app.use(express.static(frontendDist));
        }

        // Endpoint de salud de la API
        this.app.get('/api/health', (req, res) => {
            res.json({
                ok: true,
                mensaje: 'API REST Veterinaria funcionando correctamente con MongoDB Atlas'
            });
        });
    }

    routes() {
        this.app.use(this.paths.duenos, require('./backend/routes/dueño'));
        this.app.use(this.paths.dueños, require('./backend/routes/dueño'));
        this.app.use(this.paths.veterinarios, require('./backend/routes/veterinarios'));
        this.app.use(this.paths.mascotas, require('./backend/routes/mascotas'));
        this.app.use(this.paths.visitas, require('./backend/routes/visitas'));
        this.app.use(this.paths.tratamientos, require('./backend/routes/tratamientos'));

        // Redirección SPA para el frontend
        const distIndex = path.join(__dirname, 'interfaz/dist/index.html');
        if (fs.existsSync(distIndex)) {
            this.app.get('*', (req, res) => {
                res.sendFile(distIndex);
            });
        } else {
            this.app.get('/', (req, res) => {
                res.json({
                    ok: true,
                    mensaje: 'API REST Veterinaria funcionando correctamente con MongoDB Atlas'
                });
            });
        }
    }

    async listen() {
        // 1. Primero intentar la conexión a MongoDB Atlas
        await this.conectarDB();

        // 2. Únicamente si la base de datos se conecta exitosamente, iniciar el servidor Express
        this.app.listen(this.port, () => {
            console.log(`🚀 Servidor ejecutándose exitosamente en el puerto http://localhost:${this.port}`);
        });
    }
}

const server = new Server();
server.listen();
