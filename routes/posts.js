const express = require('express');
const router = express.Router();
const PostModel = require('../models/posts');
const checkLogin = require('../middlewares/check').checkLogin

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  const author = req.query.author;

  PostModel.getPosts(author)
      .then(function (posts) {
        res.render('posts', {
          posts: posts
        })
      })
      .catch(next);
})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id;
  const title = req.fields.title;
  const content = req.fields.content;

  try {
    if (!title.length) {
      throw new Error('Please give title');
    }
    if (!content.length) {
      throw new Error('Please give content');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }
  let post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  }
  PostModel.create(post)
      .then(function (result) {
        post = result.ops[0];
        req.flash('success', 'success');
        res.redirect('/posts/${post._id}')
      })
      .catch(next);
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId;

  Promise.all([
    PostModel.getPostById(postId),
    PostModel.incPv(postId)
  ])
    .then(function (result) {
      const post = result[0];
      if (!post) {
        throw new Error('this article does not exist');
      }
      res.render('post', {
        post: post
      })
    }).catch(next);
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  res.send('更新文章页')
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  res.send('更新文章')
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  res.send('删除文章')
})

module.exports = router
