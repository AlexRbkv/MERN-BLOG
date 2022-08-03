import mongoose from 'mongoose';

const PostScheme = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      default: [],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, // Достаем специальный тип для id
      ref: 'User', // Ссылаемся на модель User
      required: true,
    },
    comments: {
      type: Array,
      author: {
        type: mongoose.Schema.Types.ObjectId, // Достаем специальный тип для id
        ref: 'User', // Ссылаемся на модель User
        required: true,
      },
    },
    default: [],
    imageUrl: String,
  },
  {
    timestamps: true, // Автоматически добавить дату создания и обновления сущности
  },
);

export default mongoose.model('Post', PostScheme); // Экспортировать схему PostScheme как Post
