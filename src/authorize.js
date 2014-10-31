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

    Qi.initWithToken = function(authToken) {
        token = authToken;
        status = Status.AUTHORIZED;
    };

    Qi.saveToken = function() {
        if (this.status !== Status.AUTHORIZED) {
            throw new Error('Not authorized.');
            return false
        }

        localStorage.setItem(LOCALSTORAGE_KEY, token);
    };

    Qi.initWithLocalStorage = function() {
        token = localStorage.getItem(LOCALSTORAGE_KEY);
        if (token) {
            this.status = Status.AUTHORIZED
        } else {
            this.status = Status.NOT_AUTHORIZED
        }

        return this.status === Status.AUTHORIZED
    };

    _.getToken = function() {
        return token;
    };
}());
