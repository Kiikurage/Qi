function Comment(data) {
    if (!(this instanceof Comment)) {
        return new Comment(data);
    }

    this.body = data.body || null;
    this.id = data.id || null;
    this.user = User(data.user);
}

/**
 *  コメントの内容
 *  @type {string}
 */
Comment.prototype.body;

/**
 *  リソースを特定するID
 *  @type {string}
 */
Comment.prototype.id;

/**
 *  ユーザー
 *  @type {User}
 */
Comment.prototype.user;

_.getCommentById = function(id) {
    return _.get(HOST + '/api/v2/comments/' + id, null, null)
        .then(function(data) {
            return Comment(data.json());
        });
}

Comment.prototype.remove = function() {
    return _.delete(HOST + '/api/v2/comments/' + id)
};

Comment.prototype.update = function(value) {
    var self = this;

    return _.patch(HOST + '/api/v2/comments/' + id)
        .then(function(data) {
            return self.updateLocalValue(data);
        });
}

Comment.prototype.updateLocalValue = function(data) {
    this.body = data.body || this.body;
    this.id = data.id || this.id;
    this.data && this.user.updateLocalValue(data.user);
};
