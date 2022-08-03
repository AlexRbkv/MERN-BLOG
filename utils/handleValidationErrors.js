import { validationResult } from 'express-validator';

export default (req, res, next) => {
  const errors = validationResult(req); // Проверяем ответ на ошибки
  if (!errors.isEmpty()) {
    // Если массив ошибок не пустой
    return res.status(400).json(errors.array()); // Возвращаем ошибки
  }

  next();
};
