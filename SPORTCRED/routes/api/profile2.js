const express = require('express');
const { mongo } = require('mongoose');
const router = express.Router();

const Profile = require('../../models/profile');

/*
APIs:
profile/
    (get) : get profile of username
    (put) : update profile of username
    (delete) : delete profile of username
    login (get) : authenticate 
    signup (post) : creates profile
*/


router.get('/login', (req, res) => {
    // checks if account exists with username and password
    var user = req.body.username;
    var pass = req.body.password;
    console.log(user+ "  " + pass);
    Profile.find({username:user,password:pass})
    .exec()
    .then( accounts =>{
        if (accounts.length == 0 ) {
            res.status(404).json({
                message: "username or password is incorrect"
            });
        }else if (accounts.length == 1 ) {
            res.status(200).json({
                message: "login successfull"
            });
        }else {
            res.status(400).json({
                message: "this means duplicate usernames exists!!!"
            });
        }
    });
});



router.post('/signup', (req, res) => { 
    const profile = new Profile({
        username: req.body.username,
        password: req.body.password,
        phone: req.body.phone,
        email: req.body.email,
        fullname: req.body.firstName,
        DOB: req.body.DOB,
        picture: req.body.picture,
        about: req.body.about,
        "questionnaire.favSport": req.body.questionnaire.favSport,
        "questionnaire.age": req.body.questionnaire.age,
        "questionnaire.levelPlayed": req.body.questionnaire.levelPlayed,
        "questionnaire.sportToLearn": req.body.questionnaire.sportToLearn,
        "questionnaire.favTeam": req.body.questionnaire.favTeam
    })
    profile.save()
        .then(data => res.json(data))
        .catch(error => {
            console.log(error)
            res.status(500).json({
                error: error
            });
        });
});

router.put('/', (req,res) =>{
    // this function is to update profile data
    // NOTE: cannot edit username
    // still needs error handling
    if(req.body.phone != undefined) Profile.updateOne({username:req.body.username},{phone: req.body.phone}).then();
    if(req.body.email != undefined) Profile.updateOne({username:req.body.username},{email: req.body.email}).then();
    if(req.body.fullName != undefined) Profile.updateOne({username:req.body.username},{fullName: req.body.fullName}).then();
    if(req.body.DOB != undefined) Profile.updateOne({username:req.body.username},{DOB: req.body.DOB}).then();
    if(req.body.picture != undefined) Profile.updateOne({username:req.body.username},{picture: req.body.picture}).then();
    if(req.body.about != undefined) Profile.updateOne({username:req.body.username},{about: req.body.about}).then();
    if(req.body.password != undefined) Profile.updateOne({username:req.body.username},{password: req.body.password}).then();


    var body = req.body;
    // Questionnaire updating
    if(body.questionnaire.favSport != undefined) 
        Profile.updateOne({username:req.body.username},{"questionnaire.favSport": body.questionnaire.favSport}).then();
    if(body.questionnaire.age != undefined)
        Profile.updateOne({username:req.body.username},{"questionnaire.age": body.questionnaire.age}).then();
    if(body.questionnaire.levelPlayed != undefined) 
        Profile.updateOne({username:req.body.username},{"questionnaire.levelPlayed": body.questionnaire.levelPlayed}).then();
    if(body.questionnaire.sportToLearn != undefined) 
        Profile.updateOne({username:req.body.username},{"questionnaire.sportToLearn": body.questionnaire.sportToLearn}).then();
    if(body.questionnaire.favTeam != undefined) 
         Profile.updateOne({username:req.body.username},{"questionnaire.favTeam": body.questionnaire.favTeam}).then();

    res.status(200).json({message:"im guessing everything went well"});
})

router.get('/', (req, res) => {
    // gets a user's profile from username
    // Note: Posts and ACS fields only show objectIds 
    // (can't be accessed by front end using this request)

    Profile.find({username:req.body.username})
        .then(data => {
            if (data.length == 0){
                res.status(404).json({message:"This username does not exist"})
           }else res.status(200).json(data)})
           .catch(error => {
            console.log(error)
            res.status(500).json({error: error});
         });
});

    


router.delete('/', (req, res, next) => {
    Profile.deleteOne({ username: req.body.username})
    .then(data => {
        if(data.n == 0 ){
            console.log("no user deleted");
            res.status(404).json(data);
        }else{
            console.log(" user was successfully deleted");
            res.status(200).json(data);
        }
      })
    .catch((error) => {
        res.status(400).json({
          error: error
        });
      });
});

router.put('/setUserProfile/:username', (req, res, next) => {

    // Handles req.body validation
    for(var key in req.body) {
        if(req.body.hasOwnProperty(key)){
            console.log("key: " + key + ", value: " + req.body[key])

            // Check that a key has a non-empty value
            if(req.body[key] == ""){
                return res.status(400).json({
                    message: "The key, \'" + key + "\' has an empty field"
                });
            }
            
            // Check for @ symbol in email request
            if(key == "email"){
                console.log("email validation")
                if(!req.body[key].match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)){
                    return res.status(400).json({
                        message: "Email requires @ symbol"
                    });
                }
            }

            // Check for properly formatted DD/MM/YYYY format in DOB request
            if(key == "DOB") {
                console.log("DOB validation")
                if(!req.body[key].match(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/)){
                    return res.status(400).json({
                        message: "DOB requires DD/MM/YYYY format"
                    });
                }
            }
        }
    }

    // Check if user with username exists in db
    Profile.find({username: req.params.username })
        .exec()
        .then(data => {
            if (data.length == 0) {
                res.status(400).json({
                    message: "user with username, \'"+ req.params.username + "\' does not exist"
                });
            } else {
                // If user exists then run the query to update its profile info
                Profile.findOneAndUpdate({ username: req.params.username }, { $set: req.body }, { new: true })
                .exec()
                .then(() => {
                    res.status(200).json({
                        message: 'updated'
                    })
                })
                .catch(error => {
                    res.status(400).json({
                        message: "Bad request"
                    });
                });
            }
        });
});

router.put('/updatePhone/:username', (req, res, next) => {
    console.log("Hitting update phone endpt with id " + req.params.username)

    // If phone key is not in JSON body then return 400 status
    if ((typeof req.body.phone) === 'undefined') {
        res.status(400).json({
            error: error
        })
    }

    Profile.updateOne({ username: req.params.username }, { phone: req.body.phone })
        .then(() => {
            res.status(200).json({
                message: 'updated successfully'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

router.put('/updateEmail/:username', (req, res, next) => {
    console.log("Hitting update email endpt with id " + req.params.username)

    // If email key is not in JSON body then return 400 status
    if ((typeof req.body.email) === 'undefined') {
        res.status(400).json({
            error: error
        })
    }

    Profile.updateOne({ username: req.params.username }, { email: req.body.email })
        .then(() => {
            res.status(200).json({
                message: 'updated successfully'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

router.put('/updateFirstName/:username', (req, res, next) => {
    console.log("Hitting update first name endpt with id " + req.params.username)

    // If firstName key is not in JSON body then return 400 status
    if ((typeof req.body.firstName) === 'undefined') {
        res.status(400).json({
            error: error
        })
    }

    Profile.updateOne({ username: req.params.username }, { firstName: req.body.firstName })
        .then(() => {
            res.status(200).json({
                message: 'updated successfully'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

router.put('/updateLastName/:username', (req, res, next) => {
    console.log("Hitting update last name endpt with id " + req.params.username)

    // If lastName key is not in JSON body then return 400 status
    if ((typeof req.body.lastName) === 'undefined') {
        res.status(400).json({
            error: error
        })
    }

    Profile.updateOne({ username: req.params.username }, { lastName: req.body.lastName })
        .then(() => {
            res.status(200).json({
                message: 'updated successfully'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

router.put('/updateDOB/:username', (req, res, next) => {
    console.log("Hitting update DOB endpt with id " + req.params.username)

    // If DOB key is not in JSON body then return 400 status
    if ((typeof req.body.DOB) === 'undefined') {
        res.status(400).json({
            error: error
        })
    }

    Profile.updateOne({ username: req.params.username }, { DOB: req.body.DOB })
        .then(() => {
            res.status(200).json({
                message: 'updated successfully'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

router.put('/updatePicture/:username', (req, res, next) => {
    console.log("Hitting update picture endpt with id " + req.params.username)

    // If picture key is not in JSON body then return 400 status
    if ((typeof req.body.picture) === 'undefined') {
        res.status(400).json({
            error: error
        })
    }

    Profile.updateOne({ username: req.params.username }, { picture: req.body.picture })
        .then(() => {
            res.status(200).json({
                message: 'updated successfully'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

router.put('/updateAbout/:username', (req, res, next) => {
    console.log("Hitting update about endpt with id " + req.params.username)

    // If about key is not in JSON body then return 400 status
    if ((typeof req.body.about) === 'undefined') {
        res.status(400).json({
            error: error
        })
    }

    Profile.updateOne({ username: req.params.username }, { about: req.body.about })
        .then(() => {
            res.status(200).json({
                message: 'updated successfully'
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
});

module.exports = router;