(function() {
    _.fetch = function(url, option) {
        var status = Qi.getState();
        option = option || {}

        if (status.status === Status.AUTHORIZED) {
            option.urlParams = extend({}, option.urlParams, {
                token: _.getToken()
            });
        }

        return fetchCore(url, option)
    };

    _.fetchWithToken = function(url, option) {
        var status = Qi.getState();

        option = option || {};

        if (status.status !== Status.AUTHORIZED) {
            throw new Error('not authorized.')
        }

        option.urlParams = extend({}, option.urlParams, {
            token: _.getToken()
        });

        return fetchCore(url, option);
    };

    _.fetchWithoutToken = function(url, option) {
        return fetchCore(url, option);
    };

    function fetchCore(url, option) {
        if (option.urlParams) {
            url = url + '?' + encodeURLParams(option.urlParams);
        }

        option = extend(option, {
            headers: {
                'Access-Control-Expose-Headers': 'Link'
            }
        });

        return fetch(url, option)
    }
}());
