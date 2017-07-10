angular.module('starter.controllers', [])

.controller('DogSwipeCtrl', function($scope, $stateParams, TDCardDelegate, $timeout, $ionicModal, $filter, $ionicPopup, $ionicSideMenuDelegate, $state, store, $firebaseArray) {

    var user = firebase.auth().currentUser;
    var fbuser = store.get('user');

    if (user) {
        $scope.username = user.uid;
    } else {
        $scope.username = fbuser.id;
    }

    console.log("hey")


    var ref = firebase.database().ref().child("Users");
    var results = $firebaseArray(ref);

    var arealistArray=[];
    $scope.arealist=[];

    results.$loaded(function(x) {
        $scope.results = results;

        var fianalresult = $scope.results;

        angular.forEach(fianalresult, function(value, key) {
            var owneddogs = value.OwnedDogs;
            angular.forEach(owneddogs, function(value, key) {
                arealistArray.push(value);
            });
        });

        var arealist = arealistArray;
        console.log(arealist)

        $scope.cards = {
            master: Array.prototype.slice.call(arealist, 0),
            active: Array.prototype.slice.call(arealist, 0),
            discards: [],
            liked: [],
            disliked: []
        }

    });



    $ionicSideMenuDelegate.canDragContent(false)


    $scope.swipedup = function() {
        console.log('hello')
    };


    $scope.cardDestroyed = function(index) {
        $scope.cards.active.splice(index, 1);
    };

    $scope.addCard = function() {
        var newCard = cardTypes[0];
        $scope.cards.active.push(angular.extend({}, newCard));
    }

    $scope.refreshCards = function() {
        // Set $scope.cards to null so that directive reloads
        $scope.cards.active = null;
        $timeout(function() {
            $scope.cards.active = Array.prototype.slice.call($scope.cards.master, 0);
        });
    }

    $scope.$on('removeCard', function(event, element, card) {
        var discarded = $scope.cards.master.splice($scope.cards.master.indexOf(card), 1);
        $scope.cards.discards.push(discarded);
    });

    $scope.cardSwipedLeft = function(index) {
        console.log('LEFT SWIPE');
        var card = $scope.cards.active[index];
        $scope.cards.disliked.push(card);
    };
     $scope.cardSwipedRight = function(card) {
        $scope.data = {}
        $scope.date_rdv = new Date();
        console.log('RIGHT SWIPE');
        console.log(card)
        $scope.cards.liked.push(card);
        $ionicPopup.show({
            template: '<center><img src = "' + card.photo + '" style="width: 100px; height: 100px; border-radius:360%; object-fit: cover;"> <br><input type="date" ng-model = "data.date" style = "text-align: center"; width: 60%;></br> <br>Now input a time<input type="time" ng-model = "data.time" style = "text-align: center"; width: 60%;></br> </center>',
            title: 'Select a date to walk this dog',
            cssClass: 'forfidopopup',
            scope: $scope,
            buttons: [{
                text: 'Cancel'
            }, {
                text: '<b>Submit</b>',
                onTap: function(e) {
                    if (!($scope.data.time && $scope.data.date)) {
                        //don't allow the user to close unless he enters model...
                        e.preventDefault();
                    } else {
                        $scope.mydate = $filter('date')($scope.data.date, 'shortDate');
                        $scope.mytime = $filter('date')($scope.data.time, 'shortTime');

                        var ref = firebase.database().ref().child("Users").child($scope.username).child('walkingDogs');
                        ref.once("value").then(function(snapshot) {
                            $scope.childcount = snapshot.numChildren();

                            ref.child($scope.childcount + 1).set({
                                name: card.name,
                                date: $scope.mydate,
                                time: $scope.mytime,
                                where: "Location",
                                request: false,
                                pic: card.photo,
                                ownerid: card.owner
                            });

                        });
                    }

                }
            }]
        });
    };

    $ionicModal.fromTemplateUrl('dogmodal.html', {
        scope: $scope,
        animation: 'animated ' + 'zoomIn'
    }).then(function(modal) {
        $scope.dogmodal = modal;
    });

    $scope.opendogmodal = function(card) {
        $scope.dogmodal.show();

        $scope.dogname = card.name
        $scope.dogpicture = card.photo
        $scope.dogbreed = card.breed
        $scope.dogtemperment = card.temperment
        $scope.dogfitness = card.fitness
        $scope.dogage = card.age
        $scope.dogneeds = card.specialNeeds
    };
    $scope.closedogmodal = function() {
        $scope.dogmodal.hide();
    };


    $scope.specialpopup = function() {
        $ionicPopup.alert({
            title: 'This dosen\'t work yet',
            template: 'Sorry, this feature is out of service right now, but it\'s coming soon, and it\'s going to be awesome!',
            cssClass: 'forfidopopup'
        });
    };

    $scope.specialpopup2 = function() {
        $ionicPopup.show({
            template: '<input type="text" placeholder="Message...">',
            title: 'Send a message',
            subTitle: 'Something you want to say to lucky?',
            cssClass: 'forfidopopup',
            buttons: [{
                text: 'Cancel'
            }, {
                text: '<b>Save</b>'
            }]
        });
    };

})

.controller('signinCtrl', function($scope, $stateParams, $state, $ionicModal, $timeout, ngFB, store) {
    var fbuser = store.get('user');
    var epuser = store.get('epuser');

    $scope.hasfb = fbuser;
    $scope.hasep = epuser;

    $scope.signin = function(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
        });

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                $state.go('tabs')
                var epuser = store.set('epuser', user);
            } else {
                console.log("No user")
            }
        });

    };

    $scope.eplogout = function() {
        firebase.auth().signOut().then(function() {
            console.log("Logged out")
            store.remove('epuser');
            $state.reload()
        }).catch(function(error) {
            console.log("Error in Log out")
        });
    }

    $scope.logout = function() {
        openFB.logout(
            function() {
                store.remove('user');
                $state.reload()
            })
    }

    $scope.facebook = function() {

        ngFB.login({
            scope: 'email'
        }).then(
            function(response) {
                if (response.status === 'connected') {
                    console.log('Facebook login succeeded');
                    $state.go('moreInfo')

                    ngFB.api({
                        path: '/me',
                        params: {
                            fields: 'email,id,name'
                        }
                    }).then(
                        function(user) {
                            $scope.user = user;

                            store.set('user', user);
                            console.log(user)
                        },
                        function(error) {
                            console.log('Facebook error: ' + error.error_description);
                        });

                } else {
                    alert('Facebook login failed');
                }
            });
    };

    $scope.register = function() {
        $state.go('register')
    }

})


.controller('registerCtrl', function($scope, $stateParams, $state, store) {

    $scope.register = function(email, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert("Error " + errorCode + " : " + errorMessage)
        });
    }


    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log(user.email + user.password);
            $state.go('moreInfo')
            store.set('epuser', user);
        } else {
            // No user is signed in.
        }
    });

    $scope.cancel = function() {

        $state.go('signin')

    }

})

.controller('moreInfoCtrl', function($scope, $stateParams, $state, $ionicPopup, store) {

    $scope.data = {};

    //Optional
    $scope.countryCode = 'AU';

    //Optional
    $scope.onAddressSelection = function(location) {

        //Do something
        var a = location.address_components;
    };

    $scope.uploadPhoto = function() {

        console.log("Upload Photo!")
        var vm = this;

        vm.picture = false; // Initial state



    }


    $scope.register = function(first, last, address, mobile) {

        var user = firebase.auth().currentUser;
        var fbuser = store.get('user');

        if (user) {
            var email = user.email;
            var uid = user.uid;
        } else {
            var name = fbuser.name;
            var uid = fbuser.id;

        }



        // firebase.auth().onAuthStateChanged(function(user) {
        //   user.sendEmailVerification();
        // });

        // $scope.isverified = user.emailVerified

        // $scope.$watch('isverified', function() {
        //   if($scope.isverified){
        //     console.log("all good g")
        //     $state.go('walk')
        //   }else{
        //     console.log("nah")
        //     $state.go('walk')
        //   }
        // });

        var ref = firebase.database().ref().child("Users").child(uid);

        if (first && last && address && mobile) {
            ref.set({
                email: email || name,
                fName: first,
                lName: last,
                address: address,
                mobile: mobile,
                picture: 'none',
                walkingDogs: [{
                    owner: "mobileNum or name..",
                    Dogname: "John"
                }]
            });

            // firebase.auth().onAuthStateChanged(function(user) {
            //   if (user.emailVerified) {
            //     console.log('Email is verified');
            //     $state.go('signin')
            //   }
            //   else {
            //   console.log('Email is not verified');
            //     user.sendEmailVerification();
            //     var alertPopup = $ionicPopup.alert({
            //       title: 'Woof',
            //       template: 'You have recieved an email verification',
            //       cssClass: 'forfidopopup',
            //       buttons: [
            //        {
            //          text: 'I have Verified',
            //          type: 'button-positive',
            //          onTap: function() {

            //          }
            //        },
            //      ]
            //     });
            //   }
            // });
            $state.go('thanks');
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Sorry',
                template: 'You must enter all details',
                cssClass: 'forfidopopup'
            });
        }
    }

})

.controller('walkCtrl', function($scope, $stateParams, $state, store) {

    $scope.dogname = store.get("viewingdog")
    $scope.dogimage = store.get("viewingdogimg")
    console.log($scope.dogimage + ", " + $scope.dogname)



    // check for Geolocation support
    if (navigator.geolocation) {
        console.log('Geolocation is supported!');
    } else {
        console.log('Geolocation is not supported for this Browser/OS version yet.');
    }

    // var startPos;
    // navigator.geolocation.getCurrentPosition(function(position) {
    //     startPos = position;
    //     document.getElementById('startLat').innerHTML = startPos.coords.latitude;
    //     document.getElementById('startLon').innerHTML = startPos.coords.longitude;
    //     console.log('lat' + startPos.coords.latitude)
    // }, function(error) {
    //     alert('Error occurred. Error code: ' + error.code);
    //     // error.code can be:
    //     //   0: unknown error
    //     //   1: permission denied
    //     //   2: position unavailable (error response from locaton provider)
    //     //   3: timed out
    // });

    // navigator.geolocation.watchPosition(function(position) {
    //     //document.getElementById('currentLat').innerHTML = position.coords.latitude;
    //     //document.getElementById('currentLon').innerHTML = position.coords.longitude;
    //     document.getElementById('distance').innerHTML = calculateDistance(startPos.coords.latitude, startPos.coords.longitude, position.coords.latitude, position.coords.longitude);

    // });

    // function calculateDistance(lat1, lon1, lat2, lon2) {
    //     var R = 6371; // km
    //     var dLat = (lat2 - lat1).toRad();
    //     var dLon = (lon2 - lon1).toRad();
    //     var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //         Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
    //         Math.sin(dLon / 2) * Math.sin(dLon / 2);
    //     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //     var d = R * c;
    //     return d;
    //     console.log(d);
    // }
    // Number.prototype.toRad = function() {
    //     return this * Math.PI / 180;
    // }

    var distance = 0;
    var speed = 5.5;

    $scope.$on('$stateChangeSuccess', function () {
      $scope.restartWalk();
    });


    $scope.walkstate = "Pause Walk";

    $scope.startWalk = function() {

        if ($scope.walkstate == "Pause Walk") {
            $scope.stopTimer();
            $scope.walkstate = "Continue Walk"
        } else {
            $scope.walkstate = "Pause Walk"
            $scope.resumeTimer();
        }
    }

    $scope.restartWalk = function() {
        $scope.startTimer();
    }
    $scope.startTimer = function() {
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };

    $scope.resumeTimer = function() {
        $scope.$broadcast('timer-resume');
        $scope.timerRunning = false;
    };

    $scope.stopTimer = function() {
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };

    $scope.$on('timer-stopped', function(event, data) {
        console.log('Timer Stopped - data = ', data);

        //Calculating the distance based on how much time the user walks their dog for
        if(data.hours){
          cosole.log("hours");
          distance = speed*data.hours;
          cosole.log("d= " + distance);
        }
        if (data.minutes) {
          console.log("minutes");
          distance = speed*(data.minutes/60);
          console.log("d= " + distance);
        }
        if (data.hours && data.minutes && data.seconds) {
          cosole.log("Hours minutes and seconds");
          distance = speed*data.hours + speed*(data.minutes/60) + speed*(data.seconds/3600);
          console.log("d= " + distance);
        }
        if(data.hours && data.minutes){
          cosole.log("Hours and minutes");
          distance = speed*data.hours + speed*(data.minutes/60);
          console.log("d= " + distance);
        }
        if (data.minutes && data.seconds && !data.hours) {
          console.log("minutes and seconds");
          distance = speed*(data.minutes/60) + speed*(data.seconds/3600);
          console.log("d= " + distance);
        }

        store.set("finalD", distance);
    });

    $scope.finishWalk = function() {
        $scope.stopTimer();
        $state.go('rating');
    }



})

.controller('DogListCtrl', function($scope, $stateParams, $ionicModal, $firebaseArray, store, $firebaseObject, $state, $ionicPopup, $ionicLoading, $timeout, $ionicSideMenuDelegate) {
    $scope.downloaddone = false;

    var user = firebase.auth().currentUser;
    var fbuser = store.get('user');

    if (user) {
        $scope.username = user.uid;
        $scope.displayname = user.fname;
    } else {
        $scope.username = fbuser.id;
        $scope.displayname = fbuser.name;
    }

    var arrayref = firebase.database().ref().child("Users").child($scope.username).child('OwnedDogs');
    $scope.dogs = $firebaseArray(arrayref)

    $ionicModal.fromTemplateUrl('dogmodal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.dogmodal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closethedogmodal = function() {
        $scope.dogmodal.hide();
    };

    // Open the login modal
    $scope.thedogmodal = function() {
        $scope.dogmodal.show();
    };

    $scope.registerdog = function(Name, Breed, Type, Temperment, Special, Fitness, Age) {

        var ref = firebase.database().ref().child("Users").child($scope.username).child('OwnedDogs');
        ref.once("value").then(function(snapshot) {
            $scope.childcount = snapshot.numChildren();
            $scope.addone = $scope.childcount + 1;
            store.set("mywalkcount", $scope.addone)
        });

        if (Name && Breed && Type && Temperment && Special && Fitness && Age) {
            $scope.cango = true;

            if ($scope.me) {
                console.log("Done Uploading");
                var mywlakcount = store.get("mywalkcount")
                ref.child(mywlakcount).set({
                    photo: $scope.me,
                    name: Name,
                    breed: Breed,
                    type: Type,
                    temperment: Temperment,
                    specialNeeds: Special,
                    fitness: Fitness,
                    birthday: Age,
                    owner: $scope.username
                });

                $ionicPopup.alert({
                    title: 'Dog Added',
                    template: 'Congrats!',
                    cssClass: 'forfidopopup'
                });

                $scope.dogmodal.hide();

            } else if ($scope.selectedfile && !$scope.me) {
                console.log("Still Uploading");

                $timeout(function() {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="lines" class="spinner-special"></ion-spinner><br>Adding Dog...',
                        noBackdrop: false
                    });
                });

                $scope.$watch('me', function() {
                    $ionicLoading.hide();

                    if ($scope.me) {
                        var mywlakcount = store.get("mywalkcount")
                        ref.child(mywlakcount).set({
                            photo: $scope.me,
                            name: Name,
                            breed: Breed,
                            type: Type,
                            temperment: Temperment,
                            specialNeeds: Special,
                            fitness: Fitness,
                            birthday: Age
                        });

                        $ionicPopup.alert({
                            title: 'Dog Added',
                            template: 'Congrats!',
                            cssClass: 'forfidopopup'
                        });
                    }
                });

            }

        } else if (!$scope.selectedfile && !$scope.me) {
            console.log("No Image");
            $ionicPopup.alert({
                title: 'No Photo',
                template: 'Please upload a photo of your dog',
                cssClass: 'forfidopopup'
            });

        } else {
            $scope.cango = false;
            $ionicPopup.alert({
                title: 'Error',
                template: 'Please fill in all the details!',
                cssClass: 'forfidopopup'
            });
        }


    }

    $scope.achange = function() {
        $scope.selectedfile = event.target.files[0];
        $scope.uploadfile();
    }

    $scope.showfile = true;
    $scope.showloading = false;
    $scope.showimage = false;

    $scope.uploadfile = function() {
        $scope.rand = Math.floor((Math.random()*50000)+1)
        console.log($scope.username + ", " + $scope.rand)

        var storageRef = firebase.storage().ref().child($scope.username).child('/'+$scope.rand);
        var file = $scope.selectedfile;

        // Create the file metadata
        var metadata = {
            contentType: 'image/jpeg'
        };

        // Upload file and metadata to the object 'images/mountains.jpg'
        var uploadTask = storageRef.child(file.name).put(file, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                $scope.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + $scope.progress + '% done');

                if ($scope.progress < 100) {
                    $scope.status = "Image Uploading"
                } else {
                    $scope.status = "Image Done"
                    $scope.dogmodal.show();
                }

                console.log($scope.status)
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');

                        $scope.showfile = false;
                        $scope.showloading = true;
                        $scope.showimage = false;

                        break;
                }
            },
            function(error) {},
            function() {
                // Upload completed successfully, now we can get the download URL
                var downloadURL = uploadTask.snapshot.downloadURL;
                console.log(downloadURL)

                $scope.me = downloadURL;

                $scope.downloaddone = true
            });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            $scope.$apply(function() {
                $scope.position = position;
                $scope.lat = $scope.position.coords.latitude;
                $scope.long = $scope.position.coords.longitude;
            });
        });
    }

    $scope.logOut = function() {
        firebase.auth().signOut().then(function() {
            console.log("Logged out")
            $state.go('signin');
        }).catch(function(error) {
            console.log("Error in Log out" + error)
        });
    }


    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
        console.log("Left Toggle")
    };

})



.controller('walkerCtrl', function($scope, $stateParams, $state, $ionicPopup, $firebaseArray, store) {

    var user = firebase.auth().currentUser;
    var fbuser = store.get('user');

    if (user) {
        $scope.username = user.uid;
        $scope.displayname = user.fname;
    } else {
        $scope.username = fbuser.id;
        $scope.displayname = fbuser.name;
    }

    var arrayref = firebase.database().ref().child("Users").child($scope.username).child('walkingDogs');
    $scope.dogs = $firebaseArray(arrayref)
    $scope.dogos = $firebaseArray(arrayref)

    $scope.findDog = function() {
        $state.go('dogswipe')
        console.log("Should go to dogswipe")
    }

    $scope.walkDog = function(dog) {
        $scope.data = {}

        // Custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type = "text" ng-model = "data.model" placeholder="Cancellation message">',
            title: dog.name,
            subTitle: '',
            scope: $scope,
            cssClass: 'forfidopopup',
            buttons: [{
                text: '<b>Walk</b>',
                type: 'button-positive',
                onTap: function(e) {
                    $state.go("walk");
                    store.set("viewingdog", dog.name)
                    store.set("viewingdogimg", dog.pic)
                    store.set("dogownerid", dog.ownerid)
                }
            }, {
                text: 'Send msg and Cancel Walk',
                type: 'button-assertive',
                onTap: function(e) {
                    return $scope.data.model;
                }
            }, {
                text: 'Close'
            },

            ]
        });
    }

})

.controller('messagesCtrl', function($scope, $stateParams) {})

.controller('ownerCtrl', function($scope, $stateParams) {})

.controller('ratingCtrl', function($scope, $stateParams, $ionicPopup, $state, store, $firebaseObject, $timeout) {

    $timeout(function() {
        console.log("rating");
    });

    $scope.dogname = store.get("viewingdog")
    $scope.dogimage = store.get("viewingdogimg")
    var dogownerid = store.get("dogownerid")

    $scope.finalDistance = store.get("finalD");
    console.log("final D = " + $scope.finalDistance);

    console.log(dogownerid);

    var ref = firebase.database().ref().child("Users").child(dogownerid);
    var nameref = ref.child("fName")

    var ownername = $firebaseObject(nameref)

    ownername.$loaded(function() {
        $scope.personname = ownername.$value
        console.log($scope.personname)
    });

    $scope.finishRate = function() {
        $scope.data = {}

        var myPopup = $ionicPopup.show({
            template: '<input type = "number" ng-model = "data.model" placeholder = "Input amount here">',
            title: 'We hope you enjoyed the walk!',
            subTitle: 'Would you like to donate to the RSPCA?',
            scope: $scope,
            cssClass: 'forfidopopup',

            buttons: [{
                text: '<b>Yes please</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.model) {
                        //don't allow the user to close unless he enters model...
                        e.preventDefault();
                    } else {
                        $state.go("donate");
                    }

                }
            },
            {
                text: 'No Thanks',
                type: 'button',
                onTap: function(e) {
                    $state.go('tabs')
                },

            }]
        });


    }
})

.controller('donateCtrl', function($scope, $stateParams, $state) {

    $scope.donate = function() {
        $state.go('tabs');
    }
    $scope.cacel = function() {
        $state.go('tabs');
    }
})

.controller('profileCtrl', function($scope, $stateParams, store, $firebaseObject, $state, $ionicPopup, $ionicHistory) {
    var user = firebase.auth().currentUser;
    var fbuser = store.get('user');

    $scope.canchangenum = false
    $scope.canchangead = false

    if (user) {
        $scope.username = user.uid;
        $scope.displayname = user.fname;
    } else {
        $scope.username = fbuser.id;
        $scope.displayname = fbuser.name;
        $scope.photo = "https://graph.facebook.com/" + fbuser.id + "/picture?type=large";

        var ref = firebase.database().ref().child("Users").child(fbuser.id);
        var mobileref = ref.child("mobile")
        var addressref = ref.child("address")

        var mymobile = $firebaseObject(mobileref)
        var myaddress = $firebaseObject(addressref)

        myaddress.$loaded(function() {
            $scope.number = mymobile.$value
            $scope.address = myaddress.$value
        });

    }

    $scope.back = function() {
        $backView = $ionicHistory.backView();
        $backView.go();
    }

    $scope.logOut = function() {
        firebase.auth().signOut().then(function() {
            console.log("Logged out")
            $state.go('signin');
        }).catch(function(error) {
            console.log("Error in Log out" + error)
        });
    }

    $scope.data = {};

    $scope.changenumber = function() {
        $scope.canchangenum = true;
    }

    $scope.unchangenumber = function() {
        var objectToSave = {};
        objectToSave = $scope.data.location.formatted_address;

        var ref = firebase.database().ref().child("Users").child(fbuser.id).child("address").set(objectToSave);

        $scope.canchangenum = false;
        $scope.address = $scope.data.location.formatted_address;

        $ionicPopup.alert({
            title: 'Address Updated',
            template: 'Your address has been updated.',
            cssClass: 'forfidopopup'
        });

    }

    $scope.changeaddress = function() {
        $scope.canchangead = true
    }


    $scope.unchangeaddress = function(NewNumber) {

        var objectToSave = {};
        objectToSave = $scope.data.NewNumber;

        var ref = firebase.database().ref().child("Users").child(fbuser.id).child("mobile").set(objectToSave);

        $scope.canchangead = false;
        $scope.number = $scope.data.NewNumber;

        $ionicPopup.alert({
            title: 'Mobile Updated',
            template: 'Your mobile number has been updated.',
            cssClass: 'forfidopopup'
        });

    }




})

.controller('thanksCtrl', function($scope, $stateParams) {});
