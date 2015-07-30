var Bcrypt = require('bcrypt');
var Auth = require('./auth');

exports.register = function(server, options, next){

  server.route([
    {
      method: 'POST',
      path: '/sessions',
      handler: function(request, reply){
        var db = request.server.plugins['hapi-mongodb'].db;

        var user = request.payload.user;

        // 1.Input username + password
        db.collection('users').findOne( { username: user.username }, function(err, userMongo){
          if (err) {
            return reply('Internal MongoDb error');
          }

          // stop if user doesn't exist
          if (userMongo === null) {
            return reply( { userExist: false } );
          }

          // 2.check/compare password (built in function in Bcrypt)
          Bcrypt.compare(user.password, userMongo.password, function(err,same){
            if (!same) {
              return reply({ authorized: false});
            }

            var randomKeyGenerator = function() {
              return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
            };

            // 3.create new session in the sessions collection
            var session = {
              user_id: userMongo._id,
              session_id: randomKeyGenerator()
            };

            db.collection('sessions').insert(session, function(err, writeResult){
              if (err) {
                return reply('Internal MongoDb error');
              }

              // 4.Set the same session_id in the CLIENT's cookie
              request.session.set('hapi_twitter_session', session);

              reply({ authorized: true });
            });

          });
        });

      }
    },
    {
      // deifning a route to check if the user is authenticated / logged in
      method: 'GET',
      path: '/authenticated',
      handler: function(request, reply){
        var callback = function(result) {
          reply(result);
        };

        //  calling the function
        Auth.authenticated(request, callback);

      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'sessions-route',
  version: '0.0.1'
}