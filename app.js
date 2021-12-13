const express = require('express');
const expressHbs = require('express-handlebars');
const hbs = require('hbs');
const path = require('path');
const fs = require('fs')
const bodyParser = require('body-parser');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const multer = require('multer');
// const {response, request} = require("express");

let sessionUser = {};

SESS_NAME = sessionUser;

const usersBase = path.join(__dirname, 'Api/users.json');
const postsBase = path.join(__dirname, 'Api/posts.json');
const jsonParser = express.json();

const port = 5000;

const app = express();

const front = path.join(__dirname, 'views');



const imagesBase = multer.diskStorage({

    //Надо еще добавить проверку на является ли файл картинкой.
    destination: function (req, file, cb) {
        cb(null, __dirname + '/assets/images') //Здесь указывается путь для сохранения файлов
    },
    filename: function (req, file, cb) {
        let getFileExt = function(fileName){
            let fileExt = fileName.split(".");
            if( fileExt.length === 1 || ( fileExt[0] === "" && fileExt.length === 2 ) ) {
                return "";
            }
            return fileExt.pop();
        }
        cb(null, Date.now() + '.' + getFileExt(file.originalname))
    }
});

 const upload = multer({ storage: imagesBase });


 // app.use(express.static(__dirname +'/images'));
app.use(express.static(__dirname +'/assets'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "ololo", saveUninitialized: true, resave: true }));
app.set('views', __dirname + '/views');
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + '/views/partials')

hbs.registerHelper("ifLogged", function(user){

    if (sessionUser.name !== undefined) {
        return new hbs.SafeString('Welcome to the matrix       ,' + sessionUser.name)
    } else {
        return new hbs.SafeString('<button type="button" class="btn btn-outline-light me-2">'+'<a href="/sign-in">Login</a>'+'</button>'+'<button type="button" class="btn btn-warning"><a href="/reg-user">'+'Register'+'</a></button>');

    }

});


app.post("/reg-user", jsonParser, function (request, response) {



    if(!request.body) return response.sendStatus(400);

    const userLogin = request.body.userLogin;
    const userMail = request.body.userMail;
    const userPass = request.body.userPass;
    let user = {name: userLogin, mail: userMail, pass:userPass};


    let data = fs.readFileSync(usersBase,"utf8");
    let users = JSON.parse(data);

    // находим максимальный id
    const id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    // увеличиваем его на единицу
    user.id = id+1;
    // добавляем пользователя в массив
    users.push(user);
    data = JSON.stringify(users);
    // перезаписываем файл с новыми данными
    fs.writeFileSync(usersBase, data);
    request.session.user = user;
    request.session.save();
    sessionUser = user;
    response.redirect('/');
    console.log(sessionUser)
});

app.post('/sign-in',  (req, res) => {

    let data = fs.readFileSync(usersBase,"utf8");
     data = JSON.parse(data);

    const user = data.find(user => user.name === req.body.userLogin)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if( (req.body.userPass === user.pass)) {

            req.session.user = user;
            req.session.save();
            sessionUser = user;
            res.redirect(301, '/');
            console.log(req.session);
        } else {
            res.send('Not Allowed')
        }
    } catch {
        res.status(500).send()
    }
})

app.get("/user", (req, res) => {
    const sessionUser = req.session.user;
    return res.send(sessionUser);
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    return res.send("User logged out!");
    console.log(sessionUser)
})


app.get("/", function(request, response){
      let posts = fs.readFileSync(postsBase,"utf8");
      posts = JSON.parse(posts);
      let totalCards =  new Array(Object.keys(posts).length);

      console.log(totalCards)
      //console.log(posts)
let titles =[];
let postText = [];
let tags = [];
let imgPath = [];

        for (let i = 0; i < posts.length; i++) {
        let title = posts[i].title;
        titles.push(title);

        let text = posts[i].text;
        postText.push(text);

        let tag = posts[i].tags;
        tags.push(tag);

       let author = posts[i].author;

       let image = posts[i].image;
       imgPath.push(image);

        let postId = posts[i].id;

 }


let thisPost = [];
let thisTags =[];
let thistTitle = [];

 let neededPosts = request.query.tags;

//let result = posts.filter(city => city.tags === neededPosts)

let result = posts.findIndex(el => el.tags === neededPosts)
//  let findByTags = function filterById(arr, id) {
//    return arr.filter(function(item, i, arr) {
//        if (item.tags == neededPosts) {
//        thisPost.push(item.text);
//        thisTags.push(item.tags);
//        thisTitle = item.title;
//        };
//    });
//  };
//
// findByTags(posts, neededPosts);

 if (request.query.tags != undefined) {
   response.render('/', {
     tagsPosts: thisTags
 })

 } else {
   response.render('home.hbs', {
       allPosts: posts
   });

 }
    console.log(posts)
     console.log(result)
 //console.log(titles)



    // response.render('home', {
    //     allPosts: posts
    // });

    //  console.log(posts)

  //  console.log(sessionUser.name)
});

app.get("/addPost", function(request, response){
    if (sessionUser != {}) {
        response.render('add_post.hbs');
        console.log(sessionUser)
    }
    else {
        response.end('FUCK YOU');
        console.log(sessionUser)
    }
});

app.post("/addPost", jsonParser, upload.single('avatar') ,

    function (request, response) {
        // console.log(JSON.stringify(request.file.path))
    if(!request.body) return response.sendStatus(400);

    const postTitle = request.body.title;
    const postTags = request.body.tags;
    const postText = request.body.postText;
    const postId = Date.now();
    let postImage;
    const imageChecker = function (){
        if (request.file) {
            postImage = request.file.filename;
        }

    }

    imageChecker();

    let comma = ',';

        function splitString(stringToSplit, separators) {
            let arrayOfStrings = stringToSplit.split(separators);
        }

        splitString(postTags,comma);

        let newPost = {title: postTitle, text: postText, tags: postTags, author: sessionUser.name, image: postImage, id: postId  };

    let data = fs.readFileSync(postsBase,"utf8");
    let posts = JSON.parse(data);

    // добавляем пост в массив
    posts.push(newPost);
    data = JSON.stringify(posts);
    // перезаписываем файл постов
    fs.writeFileSync(postsBase, data);
    response.redirect('/');

});

app.get("/allPosts", function(request, response){
    let posts = fs.readFileSync(postsBase,"utf8");
    response.send(posts)
});

app.get("/reg-user", function (req, res) {
    res.render('reg-user');
})

app.get("/sign-in", function (req, res) {
    res.render('sign-in.hbs');
})

app.get("/readPost/", function (req, res) {
  let posts = fs.readFileSync(postsBase,"utf8");
  posts = JSON.parse(posts);

  let thisTitle;
  let thisPost;
  let thisTags;
  let thisImage;


  let neededId = req.query.id;

  let a = function filterById(arr, id) {
    return arr.filter(function(item, i, arr) {
        if (item.id == neededId) {
        thisPost = item.text;
        thisTags = item.tags;
        thisTitle = item.title;
        thisImage = item.image;

        };
    });
  };

  a(posts, neededId);

let arrTags = thisTags.split(',');

   console.log(typeof thisTags);

    res.render('full-post', {
   postTitle: thisTitle,
   postText: thisPost,
   postImage: thisImage,
   postTags: arrTags,

  });
    console.log('HI SUKAA' + req.body)
});


app.listen(port, ()=> {
    console.log('Server started')
    console.log(sessionUser)

});
