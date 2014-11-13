var CLIENT_ID = 'c4139214b24f2d599e6d302cf380ab783f41483a',
    CLIENT_SECRET = '11eb18233e0eb8b57868c82fed4fca580da984b1',
    TOKEN = '5144c41cb2eea35f820c6f05bf346f3402f57764';

_.authorize = function() {
    document.location.href = HOST + '/api/v2/oauth/authorize?' + encodeURIParam({
        client_id: CLIENT_ID,
        scope: 'read_qiita write_qiita'
    });
};

_.getToken = function(code) {
    return _.post(HOST + '/api/v2/access_tokens', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code
        })
        .then(function(res) {
            console.log(res.json());
        });
};
