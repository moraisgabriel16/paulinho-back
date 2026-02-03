import mongoose from 'mongoose';

export interface IClass extends mongoose.Document {
  name: string;
  grade: string;
  students: mongoose.Types.ObjectId[];
  teacher: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new mongoose.Schema<IClass>(
  {
    name: {
      type: String,
      required: [true, 'Nome da turma é obrigatório'],
      trim: true,
      unique: true,
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
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
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

export default mongoose.model<IClass>('Class', classSchema);
