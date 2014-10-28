Qi.auth('Mr_temperman', 'kikura1307')
    .then(function() {
        return Qi.User.me()
    })
    .then(function(user) {
        console.log(user);
    })
    .catch(function(e) {
        console.error(e.stack);
    });