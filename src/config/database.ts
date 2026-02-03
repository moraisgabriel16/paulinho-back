import mongoose from 'mongoose';

let cachedConnection: any = null;
let isConnecting = false;

const connectDB = async () => {
  // Return cached connection if already connected
  if (cachedConnection && cachedConnection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log('⏳ Connection already in progress...');
    // Wait up to 20s for connection
    let attempts = 0;
    while (!cachedConnection && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (cachedConnection && cachedConnection.readyState === 1) {
        return cachedConnection;
      }
      attempts++;
    }
  }

  isConnecting = true;

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avaliacao-educacao-fisica';
    
    console.log('🔄 Conectando ao MongoDB...');
    
    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
      maxIdleTimeMS: 60000,
      retryWrites: true,
    });
    
    cachedConnection = connection.connection;
    isConnecting = false;
    console.log(`✅ MongoDB conectado com sucesso`);
    return cachedConnection;
  } catch (error: any) {
    isConnecting = false;
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    
    // Não faz process.exit em produção
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
