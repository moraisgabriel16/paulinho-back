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
      // Aumentar timeouts para serverless (Vercel cold starts)
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      // Connection pool otimizado para serverless
      maxPoolSize: 5,
      minPoolSize: 0,
      // Não reusar conexões antigas
      maxIdleTimeMS: 60000,
      retryWrites: true,
      // Retry automático para transient errors
      retryReads: true,
      // Family 4 = IPv4 (pode ajudar com conectividade)
      family: 4,
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
