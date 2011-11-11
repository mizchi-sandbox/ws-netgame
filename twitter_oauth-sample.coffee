OAuth = require('oauth').OAuth
CALLBACK = "/verify"
oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  '',
  '',
  '1.0',
  # 'http://localhost:4444'+CALLBACK,
  'http://w-mtlab.com:4444'+CALLBACK,
  'HMAC-SHA1')

exports.CALLBACK = CALLBACK
exports.verify = (req, res,fn)->
  oauth_token = req.query.oauth_token
  oauth_verifier = req.query.oauth_verifier
  if oauth_token and oauth_verifier #and req.session.oauth
    oauth.getOAuthAccessToken oauth_token, null, oauth_verifier
    , (e, access_token, access_token_secret, results) ->
      # req.session.regenerate ()->
      fn(access_token,access_token_secret,results)
  else
    oauth.getOAuthRequestToken (error, oauth_token, oauth_token_secret, results)->
      req.session.oauth = true
      res.redirect 'https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token
