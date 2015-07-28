//  Defining the plugin
exports.register = function(server, options, next){
  //  Define routes
  server.route([
    // receiving POST request
      {
        method: 'POST',
        path: '/users',
        handler: function(request, reply){
          var db = request.server.plugins['hapi-mongodb'].db;

          var user = request.payload.user;

          db.collection('users').insert(user, function(err, writeResult){
            reply(writeResult);
          });
        }
      }
    ])
  next();
};

// Defining the description of the plugin
exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};