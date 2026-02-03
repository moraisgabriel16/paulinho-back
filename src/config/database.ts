import mongoose from 'mongoose';

let cachedConnection: any = null;

const connectDB = async () => {
  // Return cached connection if already connected
  if (cachedConnection && cachedConnection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avaliacao-educacao-fisica';
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    console.log('🔄 Conectando ao MongoDB...');
    const connection = await mongoose.connect(mongoURI, options);
    
    cachedConnection = connection.connection;
    console.log(`✅ MongoDB conectado com sucesso`);
    return cachedConnection;
  } catch (error: any) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    // Não faz process.exit em produção
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
