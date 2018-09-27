module.exports = {
  createUser: createUser
};

function createUser(req, res) {
  let userData = req.allParams();
  console.log("userData",userData);
  sails.log.info("requested param::",userData);

  User.createUser(userData)
    .then(function(userCreatedData) {
      return res.ok(userCreatedData);
    })
    .catch(function(err) {
      return res.serverError(err);
    });
}
