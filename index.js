import express from 'express';
import mongoose from 'mongoose'; // взаимодействие с MongoDB
import multer from 'multer'; // Мидлвар для загрузки файлов
import cors from 'cors';

import { registerValidation, loginValidation } from './validations/auth.js'; // Валидатор данных аутентификации
import { postCreateValidation } from './validations/post.js'; // Валидатор данных поста
import { UserController, PostController } from './controllers/index.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';

/* Подключение к базе данных */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB OK')) // Успешное подключение к БД
  .catch((error) => console.log('DB ERROR', error)); // Ошибка подключения к БД

const app = express(); // создаём объект приложения

// Создаём хранилище
const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    // Вызывается рпи загрузке файла
    callback(null, 'uploads'); // Сохранить файлы в папку uploads
  },
  filename: (_, file, callback) => {
    // Объяснить название файла перед сохранением
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json()); // Подключаем возможность парсинга json
app.use('/uploads', express.static('uploads')); // Поиск файлов в папке uploads при запросе /uploads

/* Обработчик post-запроса для маршрута регистрации пользователя */
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);

/* Обработчик post-запроса для авторизации пользователя */
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);

/* Обработчик get-запроса для получения информации о себе */
app.get('/auth/me', checkAuth, UserController.getMe);

/* Загрузка изображений */
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    url: `uploads/${req.file.originalname}`, // Возвращаем путь до файла
  });
});

app.get('/posts', PostController.getAll); // Получить все посты
app.get('/posts/tags', PostController.getLastTags); // Получаем списко тегов
app.get('/posts/:id', PostController.getPostById); // Получить пост по id
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create); // Создать новый пост
app.delete('/posts/:id', checkAuth, PostController.remove); // Удалить пост по id
app.patch('/posts/:id', checkAuth, PostController.update); // Изменить пост по id

app.get('/posts/:id/comments', PostController.getPostComments); // Комментарии поста
app.post('/posts/:id/comments', checkAuth, PostController.createCommentForPost); // Добавить комментарий к посту
app.delete('/comments/:id/:comment', checkAuth, PostController.removeComment); // Удалить комментарий

app.get('/posts/tags/:tag', PostController.getFilteredPosts); // Получение постов с определенным тегом

app.listen(process.env.PORT || 4444, (error) => {
  if (error) {
    return console.log(error);
  }
  console.log('Server OK');
});
