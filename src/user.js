function User(data) {
    if (!(this instanceof User)) {
        return new User(data)
    }
    if (data instanceof User) {
        return data
    }
}