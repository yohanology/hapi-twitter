var Bcrypt = require('bcrypt');
var Joi = require('joi');
var Auth = require('./auth');

//  Defining the plugin
exports.register = function(server, options, next){
  //  Define routes
  server.route([
    // receiving POST request
      {
        method: 'POST',
        path: '/users',

        config: {
          handler: function(request, reply){
            var db = request.server.plugins['hapi-mongodb'].db;
            var user = request.payload.user;

            var uniqUserQuery = {
              $or: [
                {username: user.username},
                {email: user.email},
              ]
            };

            db.collection('users').count(uniqUserQuery, function(err, userExist){
              if (userExist) {
                return reply('Error: User already exists', err); // we use return instead of else to stop the function if true
              }

              //  encrypt my password
              Bcrypt.genSalt(10, function(err, salt){
                Bcrypt.hash(user.password, salt, function(err,encrypted){
                  user.password = encrypted;

                  // insert a user document in DB
                  db.collection('users').insert(user, function(err, writeResult){
                    if (err) {return reply('Internal Mongodb error',err)}

                    reply(writeResult);
                  });
                });
              });
            });
          },
          validate: {
            payload: {
              user: {
                email: Joi.string().email().max(50).required(),
                password: Joi.string().min(5).max(20).required(),
                username: Joi.string().min(3).max(20).required(),
                name: Joi.string().min(3).max(20)
              }
            }
          }

        }
        
      },
      {
        method: 'GET',
        path: '/users',
        handler: function(request, reply){
          
          var callback = function(session) {
            if (!session.authenticated){
              return reply(session)
            }
            
            var db = request.server.plugins['hapi-mongodb'].db;
            
            db.collection('users').find().toArray(function(err, users){
              if (err) { return reply('Internal MongoDB error', err) }
              
              reply(users);
            });

          };

          Auth.authenticated(request, callback);
        }       
      }
    ]);

  next();
};

// Defining the description of the plugin
exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};