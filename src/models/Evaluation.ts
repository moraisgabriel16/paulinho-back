import mongoose from 'mongoose';

export interface IEvaluation extends mongoose.Document {
  student: mongoose.Types.ObjectId;
  class?: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  date: Date;
  evaluationData: {
    coordination: number; // 1-5 com incrementos de 0.5
    balance: number;
    strength: number;
    laterality: number;
    flexibility: number;
    participation: number;
    speed: number;
  };
  strengths: string;
  pointsToDevelop: string;
  createdAt: Date;
  updatedAt: Date;
}

const evaluationSchema = new mongoose.Schema<IEvaluation>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    evaluationData: {
      coordination: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
          validator: (v: number) => v % 0.5 === 0,
          message: 'Deve ser um valor entre 1-5 com incrementos de 0.5',
        },
      },
      balance: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      strength: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      laterality: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      flexibility: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      participation: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      speed: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },
    strengths: {
      type: String,
      trim: true,
      maxlength: [500, 'Pontos fortes não podem ter mais de 500 caracteres'],
    },
    pointsToDevelop: {
      type: String,
      trim: true,
      maxlength: [500, 'Pontos a desenvolver não podem ter mais de 500 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
