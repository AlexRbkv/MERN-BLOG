import PostModel from '../models/Post.js';

export const create = async (req, res) => {
  try {
    // Создание экземпляра модели PostModel
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(','),
      user: req.userId, // Берём из request id пользователя вшитый в authCheck
    });

    const post = await doc.save(); // Создание нового экземпляра
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось создать пост',
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();
    const tags = posts
      .map((item) => item.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (error) {
    console.log(error); // Выводим ошибку в консоль
    res.status(500).json({
      message: 'Не удалось получить данные', // Возвращаем ошибку  пользователю
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const isSort = req.query.sort;
    if (isSort === 'true') {
      const posts = await PostModel.find().populate('user').sort({ viewsCount: 'desc' }).exec();
      res.json(posts);
    } else if (isSort == 'false') {
      const posts = await PostModel.find().populate('user').sort({ createdAt: 'desc' }).exec();
      res.json(posts);
    }
  } catch (error) {
    console.log(error); // Выводим ошибку в консоль
    res.status(500).json({
      message: 'Не удалось получить данные', // Возвращаем ошибку  пользователю
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id; // получаем id из параметров запроса
    PostModel.findOneAndUpdate(
      // Ищем и обновляем запись
      {
        _id: postId, // Ищем по id
      },
      {
        $inc: { viewsCount: 1 }, // Инкрементируем значение viewsCount
      },
      {
        returnDocument: 'after',
      },
      (error, doc) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (error) {
    console.log(error); // Выводим ошибку в консоль
    res.status(500).json({
      message: 'Не удалось получить данные', // Возвращаем ошибку  пользователю
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (error, doc) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: 'Не удалось удалить данные из БД',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось удалить данные из БД',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.split(','),
        user: req.userId, // Берём из request id пользователя вшитый в authCheck
      },
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось обновить данные в БД',
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const postId = req.params.id; // получаем id из параметров запроса
    PostModel.find(
      {
        _id: postId, // Ищем по id
      },
      (error, doc) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: 'Не удалось вернуть комментарии',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (error) {
    console.log(error); // Выводим ошибку в консоль
    res.status(500).json({
      message: 'Не удалось получить данные', // Возвращаем ошибку  пользователю
    });
  }
};

export const createCommentForPost = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $push: { ['comments']: req.body.comment },
      },
      {
        new: true,
      },
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось обновить данные в БД',
    });
  }
};

export const removeComment = async (req, res) => {
  try {
    const { id, comment } = req.params;
    await PostModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $pull: { comments: { commentId: comment } },
      },
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось удалить комментарий',
    });
  }
};

export const getFilteredPosts = async (req, res) => {
  try {
    const tag = req.params.tag; // получаем тег из параметров запроса
    PostModel.find(
      {
        tags: tag, // Ищем по тегу
      },
      (error, doc) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (error) {
    console.log(error); // Выводим ошибку в консоль
    res.status(500).json({
      message: 'Не удалось получить данные', // Возвращаем ошибку  пользователю
    });
  }
};
