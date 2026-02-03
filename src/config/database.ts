import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avaliacao-educacao-fisica';
    
    await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB conectado com sucesso`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    // Não faz process.exit em produção
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
