(function() {
    var token = null,
        authorizingPromise = null,
        status = Status.NOT_AUTHORIZED;

    Qi.auth = function(userName, password) {
        if (status === Status.PENDING) {
            return authorizingPromise;
        }

        status = Status.PENDING;

        authorizingPromise =
            fetch(Url.AUTH, {
                method: 'post',
                body: {
                    url_name: userName,
                    password: password
                }
            })
            .then(function(res) {
                return res.json();
            })
            .then(function(json) {
                token = json.token;
                status = Status.AUTHORIZED;
                authorizingPromise = null;
            });

        return authorizingPromise
    };

    Qi.getState = function() {
        var text;
        switch (status) {
            case Status.NOT_AUTHORIZED:
                text = 'NOT_AUTHORIZED';
                break;

            case Status.PENDING:
                text = 'PENDING';
                break;

            case Status.AUTHORIZED:
                text = 'AUTHORIZED';
                break;
        }

        return {
            status: status,
            text: text
        }
    };

    _.getToken = function() {
        return token;
    };
}());