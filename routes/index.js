var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

var uid2 = require('uid2');
var userModel = require('../models/users')
var { vaccineModel } = require('../models/vaccines')
var { medicalTestModel } = require('../models/medicalTests')
var { illnessModel } = require('../models/illnesses')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/:userId/vaccines', async function (req, res, next) {
  const user = await userModel.find({ id: req.params.userId });
  var vaccines = user.vaccines;
  res.json({ vaccines });
});


router.post('/sign-up', async function (req, res, next) {

  var error = []
  var result = false
  var saveUser = null
  const hash = bcrypt.hashSync(req.body.passwordFromFront, 10);

  const data = await userModel.findOne({
    mail: req.body.emailFromFront
  })

  if (data != null) {
    error.push('utilisateur déjà présent')
  }

  if (req.body.usernameFromFront == ''
    || req.body.emailFromFront == ''
    || req.body.passwordFromFront == ''
  ) {
    error.push('champs vides')
  }


  if (error.length == 0) {
    var newUser = new userModel({
      mail: req.body.emailFromFront,
      password: hash,
      firstname: req.body.firstnameFromFront,
      lastname: req.body.lastnameFromFront,
      birthdate: req.body.birthdateFromFront,
      sex: req.body.sexFromFront,
      profession: req.body.professionFromFront
    })

    saveUser = await newUser.save()
    console.log('test');

    var vaccines = await vaccineModel.find({});
    console.log('test2');
    console.log(vaccines);
    var newUserAge = Date.now() - newUser.birthdate;
    console.log('newDate', new Date);
    console.log('birthDate', newUser.birthdate);

    console.log(newUserAge);
    var vaccinEssai = await vaccineModel.findOne({ _id: '627cd2107897b1483fba5fb2' });
    console.log('vaccin', vaccinEssai);
    console.log('vaccin start age', vaccinEssai.startAge);
    console.log('vaccin end age', vaccinEssai.endAge);
    // Quoi? Choix des vaccins concernant la personne selon leur age, sexe, profession
    // Comment? Par filtrage du tableau des vaccins en Base de données(BDD) selon les critères de sélection
    var customizedVaccines = vaccines.filter(vaccine => {
      // filtrage par âge
      (newUserAge >= (vaccine.startAge * 31536000000) && newUserAge <= (vaccine.endAge * 31536000000)) ||
        // filtrage par sexe
        (newUser.sex === vaccine.sex || vaccine.sex === 'unisex') ||
        // filtrage par profession
        (newUser.profession === vaccine.profession);
    })

    console.log('customized vaccines', customizedVaccines)

    if (saveUser) {
      result = true
    }
  }


  res.json({ result, saveUser, error, customizedVaccines })
})

module.exports = router;
