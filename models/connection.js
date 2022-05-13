var mongoose = require('mongoose');

var options = {
  connectTimeoutMS: 5000,
  useUnifiedTopology: true,
  useNewUrlParser: true,
}

mongoose.connect('mongodb+srv://jadmog:testpassword@cluster0.8wjqo.mongodb.net/life?retryWrites=true&w=majority',
  options,
  function (err) {
    console.log(err);
  }
)

module.exports = mongoose