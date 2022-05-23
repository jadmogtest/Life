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
// router.get('/:userId/profile', async function (req, res, next) {
//   const user = await userModel.findOne({ _id: req.params.userId });
//   // console.log('user', user);
//   var vaccines = user.vaccines;
//   var medicalTests = user.medicalTests;
//   var family = user.family;
//   res.json({ vaccines, medicalTests, family });
// });


router.post('/sign-up', async function (req, res, next) {

  var error = []
  var result = false
  var saveUser = null
  var illnessesObjTab = [];
  var familyHistoryObjTab = []

  // console.log("je suis une date", req.body.birthdateFromFront)


  var illnessesTab = (req.body.illnessesFromFront).split(',')
  for (let i = 0; i < illnessesTab.length; i++) {
    illnessesObjTab[i] = {
      name: illnessesTab[i]
    }
  }

  var familyHistoryTab = (req.body.familyHistoryFromFront).split(",")
  for (let i = 0; i < familyHistoryTab.length; i++) {
    familyHistoryObjTab[i] = {
      name: familyHistoryTab[i]
    }
  }

  // console.log('tableau illnesses', illnessesTab)
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
      profession: req.body.professionFromFront,
      illnesses: illnessesObjTab,
      familyHistory: familyHistoryObjTab,
      token: uid2(32)
    })

    saveUser = await newUser.save()
    // console.log('test');

    var vaccines = await vaccineModel.find({});
    var medicalTests = await medicalTestModel.find({});
    // console.log('test2');
    // console.log(vaccines);
    // console.log('medicalTests', medicalTests);
    var newUserAge = Date.now() - newUser.birthdate;
    // console.log('newDate', new Date);
    // console.log('birthDate', newUser.birthdate);

    // console.log('newUserAge', newUserAge);
    var vaccinEssai = await vaccineModel.findOne({ _id: '627cd2107897b1483fba5fb2' });
    // console.log('vaccin', vaccinEssai);
    // console.log('vaccin start age', vaccinEssai.startAge);
    // console.log('vaccin end age', vaccinEssai.endAge);
    // Quoi? Choix des vaccins concernant la personne selon leur age, sexe, profession
    // Comment? Par filtrage du tableau des vaccins en Base de données(BDD) selon les critères de sélection
    var customizedVaccines = vaccines.filter(function (vaccine) {
      // filtrage par âge
      return ((newUserAge >= (vaccine.startAge * 31536000000) && newUserAge <= (vaccine.endAge * 31536000000)) ||
        // filtrage par sexe
        (newUser.sex === vaccine.sex || vaccine.sex === 'unisex') ||
        // filtrage par profession
        (newUser.profession === vaccine.profession));
    })

    var customizedMedicalTests = medicalTests.filter(function (medicalTest) {
      // filtrage par âge
      return ((newUserAge >= (medicalTest.startAge * 31536000000) && newUserAge <= (medicalTest.endAge * 31536000000)) ||
        // filtrage par sexe
        (newUser.sex === medicalTest.sex || medicalTest.sex === 'unisex') ||
        // filtrage par profession
        (newUser.profession === medicalTest.profession || medicalTest.profession === ''));
    })

    // console.log('customized vaccines', customizedVaccines)
    // console.log('customized medical tests', customizedMedicalTests)

    if (saveUser) {
      await userModel.updateOne({ _id: newUser._id.toString() }, { vaccines: customizedVaccines, medicalTests: customizedMedicalTests });
      // console.log('newUser id', newUser._id)
      const newUserTest = await userModel.findOne({ _id: newUser._id.toString() })
      // console.log('vaccinesAdded', newUserTest.vaccines)
      // console.log('testsAdded', newUserTest.medicalTests)
      result = true
    }
  }


  res.json({ result, saveUser, error, customizedVaccines })
})


router.post('/sign-in', async function (req, res, next) {

  var result = false
  var user = null
  var error = []

  // console.log(req.body.emailFromFront)
  // console.log(req.body.passwordFromFront)
  if (req.body.emailFromFront == ''
    || req.body.passwordFromFront == ''
  ) {
    error.push('champs vides')
  }

  if (error.length == 0) {
    // console.log("testtttttt")
    user = await userModel.findOne({
      mail: req.body.emailFromFront
    })
    if (!user) {
      var token = ""
    } else {
      token = user.token
    }

    if (user && bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
      result = true
    } else {
      error.push('email ou mot de passe incorrect')
    }
  }

  // console.log("bouh!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", user)

  res.json({ result, user, error, token })


})



router.get("/user/:token", async function (req, res) {

  var result = false
  console.log(req.params.token)
  const user = await userModel.findOne({
    token: req.params.token
  });
  if (user) {
    result = true
  }
  // console.log("Ohhhhhhhhhhhhhhhhhhhhhhhhh", user.firstname)
  res.json({ result, vaccines: user.vaccines, medicalTests: user.medicalTests, firstname: user.firstname })
})

module.exports = router;
