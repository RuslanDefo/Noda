const express = require('express');
const posts = require('../models/posts');
let {SESSION} = require("./auth");
const hbs = require("hbs");
const {route} = require("express/lib/router");
const fs = require("fs");
const {postsModel_} = require("../models/posts");
const multer = require("multer");
const {userData} = require("../models/users");
const { DateTime } = require("luxon");

let sess;
const router = express.Router();

const imagesBase = multer.diskStorage({
    //Надо еще добавить проверку на является ли файл картинкой.
    destination: function (req, file, cb) {
        cb(null, './assets/images') //Здесь указывается путь для сохранения файлов
    },
    filename: function (req, file, cb) {
        let getFileExt = function (fileName) {
            let fileExt = fileName.split('.');
            if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
                return '';
            }
            return fileExt.pop();
        }
        cb(null, Date.now() + '.' + getFileExt(file.originalname))
    }
});

const upload = multer({storage: imagesBase});

hbs.registerHelper('ifLogged', function () {
    if (SESSION.login !== undefined) {
        return new hbs.SafeString('Welcome to the matrix       ,' + SESSION.login)
    } else {
        return new hbs.SafeString('<button type="button" class="btn btn-outline-light me-2">' + '<a href="/sign-in">Login</a>' + '</button>' + '<button type="button" class="btn btn-warning"><a href="/reg-user">' + 'Register' + '</a></button>');
    }
});

router.get('/', async function (request, response) {

    let sess = request.session;

    if (sess.showAd !== undefined) {
        let bridge = sess.showAd
        SESSION = bridge
    }

    const posts = postsModel_.find({collection: 'posts'}, function (err, doc) {

        if (err) return console.log(err);

        let basePosts = doc;

        const pageCount = Math.ceil(basePosts.length / 3);
        let page = parseInt(request.query.page);
        if (!page) {
            page = 1;
        }
        if (page > pageCount) {
            page = pageCount
        }

        let pageNavLinks = [];

        let pageLinks = function () {
            pageNavLinks = [];
            let a;
            for (let i = 0; i < pageCount; i++) {
                let link = 1;
                link += i;
                let newNavLinks = {
                    number: link,
                    active: a
                }
                pageNavLinks.push(newNavLinks)
            }
        };

        pageLinks();

        let addActiveLink = function filterById(arr, id) {
            return arr.filter(function (item) {
                if (item.number === id) {
                    item.active = 'active';
                }
            })
        };
        addActiveLink(pageNavLinks, page)

        basePosts = basePosts.slice(page * 3 - 3, page * 3)

        if (request.query.id === undefined) {
            response.render('home.hbs', {
                allPosts: basePosts,
                page: page,
                pageCount: pageNavLinks
            })
        }

        if (request.query.id !== undefined) {
            const neededTag = request.query.id
            const findTag = postsModel_.find({tags: neededTag}, function (err, doc) {
                    if (err) return console.log(err);
                    let itsPosts = doc
                    response.render('home.hbs', {
                        tagsPosts: itsPosts
                    })
                }
            )
        }

    });
});


router.get('/addPost', function (request, response) {
    if (SESSION.login) {
        response.render('add_post.hbs');
    } else {
        response.render('sign-in.hbs');
    }
});

router.post('/addPost', upload.single('avatar'), async function (request, response) {
    if (!request.body) return response.sendStatus(400);

    const articleData = request.body;
    const tagsFilter = articleData.tags.split(",");
    let postImage;

    const imageChecker = function () {
        if (request.file) {
            postImage = request.file.filename;
        }
    };

    imageChecker();

    dt = DateTime.now();

    const Article = new postsModel_({

        currId: Math.ceil(Date.now() / 100),
        title: articleData.title,
        text: articleData.postText,
        author: SESSION.login,
        creationDate: Date.now(),
        tags: tagsFilter,
        imgPath: postImage,
        Date: dt.toLocaleString()
    });

    const newPost = await Article.save();
    if (newPost) {
        response.redirect('/')
    } else {
        response.redirect('/')
    }
});

router.get('/readPost/', async function (request, response) {

    let currentPost;
    let neededId = request.query.currId;

    const postFind = postsModel_.findOne({currId: neededId}, function (err, doc) {

        if (err) {
            return console.log(err);
        } else {
            currentPost = doc;
        }

        let thisTitle = currentPost.title;
        let thisPost = currentPost.text;
        let thisTags = currentPost.tags;
        let thisImage = currentPost.imgPath;
        let thisDate = currentPost.Date;

        response.render('full-post', {
            postTitle: thisTitle,
            postText: thisPost,
            postImage: thisImage,
            postTags: thisTags,
            postDate: thisDate
        });
    });
});

module.exports = router

