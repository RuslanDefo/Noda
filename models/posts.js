const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Posts = new Schema({

    currId: {type: String},
    title: {type: String},
    text: {type: String},
    tags: [{type: String}],
    imgPath: {type: String},
    author: {type: String},
    creationDate: Number,
    Date: {type: String}
});

const model = mongoose.model('Posts', Posts, 'posts');

module.exports = {
    postsModel_: model,
    filterPosts: _filterByTagName = (array, tag) => {
        return array.filter(article => article.tags.some(currentTag => currentTag === tag));
    }
}