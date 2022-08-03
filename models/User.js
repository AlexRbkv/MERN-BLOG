import mongoose from 'mongoose';

const UserScheme = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: String,
  },
  {
    timestamps: true, // Автоматически добавить дату создания иобновления сузщности
  },
);

export default mongoose.model('User', UserScheme); // Экспортировать схему UserScheme как User
