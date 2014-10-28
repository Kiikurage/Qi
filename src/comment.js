function Comment(data) {
    if (!(this instanceof Comment)) {
        return new Comment(data)
    }

    data = data || {};

    this.id = data.id || 0;
    this.uuid = data.uuid || '';
    this.user = new User(data.user);
    this.body = data.body || '';
}
Qi.Comment = Comment;