import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI no está definida en las variables de entorno.');
    }

    await mongoose.connect(mongoUri);
    console.log('🍃 Conexión a MongoDB establecida con éxito.');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};