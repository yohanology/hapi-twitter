var Joi = require('joi');
var Auth = require('./auth.js');

exports.register = function(server, options, next){
  server.route([
    {
      method: 'GET',
      path: '/tweets',
      handler: function(request, reply){
        var db = request.server.plugins['hapi-mongodb'].db;

        db.collection('tweets').find().toArray(function(err,tweets){
          if (err) { return reply('Internal MongoDB error',err); }

          reply(tweets);
        });
      }
    },
    {
      method: 'GET',
      path: '/tweets/{id}',
      handler: function(request, reply){
        var tweet_id = encodeURIComponent(request.params.id);
        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;

        db.collection('tweets').findOne( {'_id': ObjectId(tweet_id) }, function(err,tweets){
          if (err) { return reply('Internal MongoDB error',err); }

          reply(tweets);
        });
      }
    },
    {
      method: 'POST',
      path: '/tweets',
      config: {
        handler: function(request,reply){
          
          Auth.authenticated(request, function(result){
            if (!result.authenticated) {
              return reply(result);
            }

            var db = request.server.plugins['hapi-mongodb'].db;
            var cookie = request.session.get('hapi_twitter_session');

            var tweet = {
              message: request.payload.tweet.message,
              user_id: result.user_id
            };

            db.collection('tweets').insert(tweet, function(err, writeResult){
              if (err) { return reply('Internal MongoDB error',err); }

              reply(writeResult);
            });
          });
        },
        validate: {
          payload: {
            tweet: {
              message: Joi.string().max(140).required()
            }
          }
        }
      }
    }

  ]);
  next();
};

exports.register.attributes = {
  name: 'tweets-routes',
  version: '0.0.1'
};