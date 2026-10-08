const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS públicos para resolver registros SRV de MongoDB Atlas en proveedores que los bloquean
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Si falla la configuración de DNS, continuar con la predeterminada
}

/**
 * Establece la conexión con la base de datos MongoDB Atlas.
 * Si la conexión falla, se lanza una excepción para evitar que el servidor inicie.
 */
const dbConnection = async () => {
    try {
        if (!process.env.MONGODB_CNN) {
            throw new Error('La variable MONGODB_CNN no está configurada en el archivo .env');
        }

        await mongoose.connect(process.env.MONGODB_CNN);

        console.log('✅ Conexión exitosa a MongoDB Atlas');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos MongoDB Atlas:');
        console.error(error.message);
        throw new Error('No se pudo establecer la conexión con la base de datos');
    }
};

module.exports = {
    dbConnection
};
