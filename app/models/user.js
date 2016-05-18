var db = require('../config');
// var bcrypt = require('bcrypt-nodejs');
// var Promise = require('bluebird');
// var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false

//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var password = model.get('password');

//       bcrypt.hashAsync('password', null, null)
//         .then (function(hash) {
//           // console.log(User.fetch);
//           model.set('password', hash);
//           console.log(model.get('password'))
//         });
//     });
//   }
});

module.exports = User;




