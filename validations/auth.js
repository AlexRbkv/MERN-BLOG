import { body } from 'express-validator';

/* Валидатор данных запроса регистрации */
export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Длина пароля должна быть минимум 8 символов').isLength({ min: 8 }),
  body('fullName', 'Укажите имя длинной не меннее двух символов').isLength({ min: 2 }),
  /// body('avatarUrl', 'Неверная ссылка').optional(),
];

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Длина пароля должна быть минимум 8 символов').isLength({ min: 8 }),
];
