import jwt from 'jsonwebtoken'; // json web token
import bcrypt from 'bcrypt'; // формировани хеш пароля

import UserModel from '../models/User.js'; // Модель User

export const register = async (req, res) => {
  try {
    const password = req.body.password; // достаем пароль из тела запроса
    const salt = await bcrypt.genSalt(10); // генерируем соль для пароля
    const hash = await bcrypt.hash(password, salt); // генерируем хешированый пароль

    // Создание экземпляра модели UserModel
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
    });

    const user = await doc.save(); // Сохранение нового экземпляра

    const token = jwt.sign(
      {
        _id: user._id, // В качестве токена будет шифроваться id
      },
      'secret123', // ключ, по которому будет шифроваться токен
      {
        expiresIn: '30d', // срок валидности токена
      },
    );

    const { passwordHash, ...userData } = user._doc; // отделяем хеш пароля от остальных данных в экземпляре

    // Если ошибок нет
    res.status(201).json({ ...userData, token }); // возвращаем запись (без пароля) и токен
  } catch (error) {
    console.log(error); // Выводим ошибку в консоль
    res.status(500).json({
      message: 'Не удалось зарегистрировать пользователя', // Возвращаем ошибку  пользователю
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }); // Ищем в БД пользователя с указанным email
    if (!user) {
      // Если user не найден
      return res.status(404).json({
        // возвращаем сообщение об ошибке
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash); // сравниваем указанный пароль и пароль в БД

    if (!isValidPass) {
      // Если пароли неодинаковые
      return res.status(400).json({
        // Возвращаем сообщение об ошибке
        message: 'Неверный логин или пароль',
      });
    }

    // Создаем токен доступа для нового пользователя
    const token = jwt.sign(
      {
        _id: user._id, // В качестве токена будет шифроваться id
      },
      'secret123', // ключ, по которому будет шифроваться токен
      {
        expiresIn: '30d', // срок валидности токена
      },
    );

    const { passwordHash, ...userData } = user._doc; // отделяем хеш пароля от остальных данных в экземпляре

    res.status(200).json({ ...userData, token }); // возвращаем запись (без пароля) и токен
  } catch (error) {
    console.log(error); // Выводим ошибку в консоль
    res.status(500).json({
      message: 'Не удалось авторизоваться', // Возвращаем ошибку  пользователю
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId); // Ище пользователя в БД по id
    if (!user) {
      // Если пользователь не найден
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }
    const { passwordHash, ...userData } = user._doc; // отделяем хеш пароля от остальных данных в экземпляре

    res.status(200).json(userData); // возвращаем запись (без пароля) и токен
  } catch (error) {
    console.log(error);
    res.status(403).json({
      message: 'Нет доступа',
    });
  }
};
