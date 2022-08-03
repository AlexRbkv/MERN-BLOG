import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, ''); // Получаем токен и удлаяем слово "Bearer"
  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret123'); // Расшифровываем токен
      req.userId = decoded._id; // Вшиваем id в request
      next(); // Переход к следующей функции
    } catch (error) {
      return res.status(403).json({
        message: 'Нет доступа',
      });
    }
  } else {
    // токен не верный либо отсутствует
    return res.status(403).json({
      message: 'Нет доступа',
    });
  }
};
