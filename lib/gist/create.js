module.exports = function (files, description, is_private, is_anonymous,token) {
  'use strict';
  var https = require('https');
  //var token = require('./token');
  var pkg = require('./pkg');
  var q = require('q');
  files = require('./files')(files);

  var defer = q.defer();
  var body = new Buffer(JSON.stringify({
    'description': description,
    'public': !is_private,
    'files': files
  }));
  var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/gists',
    method: 'POST',
    headers: {
      'host': 'api.github.com',
      'Content-length': body.length,
      'Content-Type': 'application/json',
      'User-Agent': pkg.name + '#' + pkg.version,
    },
    json: true
  };
  if (token && !is_anonymous) {
    options.headers.Authorization =  'token ' + token;
  }
  
  var req = https.request(options, function (res) {
    res.body = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      res.body += chunk;
    });
    res.on('end', function () {
      console.log(body);
      var res_body = res.body;
      if (res.statusCode == 201) {
        defer.resolve(res_body);
      } else {
        defer.reject(res_body);
      }
    });
    res.on('error', function (err) {
      defer.reject(err);
    });
  });
  req.end(body);
  return defer.promise;
};
