import mongoose from 'mongoose';

export interface IStudent extends mongoose.Document {
  name: string;
  age: number;
  grade: string;
  classId?: mongoose.Types.ObjectId;
  observations: string;
  teacher: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new mongoose.Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Nome do aluno é obrigatório'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Idade é obrigatória'],
      min: [1, 'Idade deve ser maior que 0'],
      max: [25, 'Idade deve ser menor que 25'],
    },
    grade: {
      type: String,
      required: [true, 'Série é obrigatória'],
      enum: [
        '1º Ano',
        '2º Ano',
        '3º Ano',
        '4º Ano',
        '5º Ano',
        '6º Ano',
        '7º Ano',
        '8º Ano',
        '9º Ano',
      ],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: false,
    },
    observations: {
      type: String,
      trim: true,
      maxlength: [500, 'Observações não podem ter mais de 500 caracteres'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>('Student', studentSchema);
