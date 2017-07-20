// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'firebase', 'ionic.contrib.ui.tinderCards2', 'ngOpenFB', 'angular-storage', 'ion-google-autocomplete', 'camera', 'timer'])

.run(function($ionicPlatform, ngFB, store, $rootScope, $state, $firebaseArray, $ionicPopup) {

    $ionicPlatform.ready(function() {


        var epuser = store.get('epuser');
        var fbuser = store.get('user');

        if (fbuser) {
            console.log(fbuser)
            if (epuser) {
                firebase.auth().signOut().then(function() {
                    console.log("signed out of passowrd")
                }).catch(function(error) {});
            } else {
                $state.go('tabs')

                var ref = firebase.database().ref().child("Users").child(fbuser.id).child("walkingDogs");
                var results = $firebaseArray(ref);

                results.$watch(function() {
                  results.$loaded(function(x) {
                      angular.forEach(results, function(value, key) {
                        if(!value.request){

                          var myPopup = $ionicPopup.show({
                                title: value.name + " has been requested",
                                cssClass: 'forfidopopup',
                                buttons: [{
                                    text: 'Accept Walk',
                                    type: 'button-assertive',
                                    onTap: function(e) {
                                      var objectToSave = {};
                                      objectToSave = true;
                                      ref.child(value.$id).child("request").set(objectToSave);
                                    },
                                },{
                                    text: 'Decline Walk',
                                    type: 'button-positive',
                                    onTap: function(e) {
                                      var objectToSave = {};
                                      objectToSave = true;
                                      ref.child("address").set(objectToSave);
                                    }
                                }]
                            });

                        }else{
                          console.log("Nope")
                        }
                      });
                  });
                });

                function displayLocation(latitude, longitude) {
                    var request = new XMLHttpRequest();

                    var method = 'GET';
                    var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=false';
                    var async = true;

                    request.open(method, url, async);
                    request.onreadystatechange = function() {
                        if (request.readyState == 4 && request.status == 200) {
                            var frdata = JSON.parse(request.responseText);
                            var fraddress = frdata.results[0];
                            console.log(fraddress.address_components[2].long_name + ", " + fraddress.address_components[3].long_name);
                            store.set('currentlocation', fraddress.address_components[3].long_name + ", " + fraddress.address_components[5].long_name);
                        }
                    };
                    request.send();
                };

                var successCallback = function(position) {
                    var x = position.coords.latitude;
                    var y = position.coords.longitude;
                    displayLocation(x, y);
                };

                var errorCallback = function(error) {
                    var errorMessage = 'Unknown error';
                    switch (error.code) {
                        case 1:
                            console.log('Permission denied');
                            break;
                        case 2:
                            console.log('Position unavailable');
                            break;
                        case 3:
                            console.log('Timeout');
                            break;
                    }
                };

                var options = {
                    enableHighAccuracy: true,
                    maximumAge: 0
                };

                navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

            }
        } else if (epuser) {
            console.log("Accessed with Password " + epuser.email)
            $state.go('tabs')


            function displayLocation(latitude, longitude) {
                var request = new XMLHttpRequest();

                var method = 'GET';
                var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true';
                var async = true;

                request.open(method, url, async);
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        var data = JSON.parse(request.responseText);
                        var address = data.results[0];
                        console.log(address.address_components[4].long_name + ", " + address.address_components[5].long_name);
                    }
                };
                request.send();
            };

            var successCallback = function(position) {
                var x = position.coords.latitude;
                var y = position.coords.longitude;
                displayLocation(x, y);
            };

            var errorCallback = function(error) {
                var errorMessage = 'Unknown error';
                switch (error.code) {
                    case 1:
                        console.log('Permission denied');
                        break;
                    case 2:
                        console.log('Position unavailable');
                        break;
                    case 3:
                        console.log('Timeout');
                        break;
                }
                document.write(errorMessage);
            };

            var options = {
                enableHighAccuracy: true,
                timeout: 1000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);


        } else {
            $state.go('signin')
        }

        ngFB.init({
            appId: '298020007312457'
        });

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

    var config = {
        apiKey: ' AIzaSyBV85zniMmMTdL7j104iXY9ibOANIGwLjg',
        authDomain: 'forfido-5a2a3.firebaseapp.com',
        databaseURL: 'https://forfido-5a2a3.firebaseio.com',
        storageBucket: 'gs://forfido-5a2a3.appspot.com'
    };
    firebase.initializeApp(config);

    $stateProvider

        .state('tabs', {
        url: "/tabs",
        abstract: false,
        templateUrl: "templates/tabs.html"
    })

    .state('tabs.walker', {
        url: "/walker",
        views: {
            'walker-tab': {
                templateUrl: "templates/walker.html",
                controller: 'walkerCtrl'
            }
        }
    })

    .state('tabs.owner', {
        url: "/owner",
        views: {
            'owner-tab': {
                templateUrl: "templates/doglist.html",
                controller: 'DogListCtrl'
            }
        }
    })

    .state('dogswipe', {
        url: '/dogswipe',
        templateUrl: 'templates/dogswipe.html',
        controller: 'DogSwipeCtrl'
    })

    .state('moreInfo', {
        url: '/moreInfo',
        templateUrl: 'templates/moreInfo.html',
        controller: 'moreInfoCtrl'
    })

    .state('walk', {
        url: '/walk',
        templateUrl: 'templates/walk.html',
        controller: 'walkCtrl'
    })

    .state('profile', {
        url: '/profile',
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
    })

    // NEW

    // .state('walker', {
    //   url: '/walker',
    //   templateUrl: 'templates/walker.html',
    //   controller: 'walkerCtrl'
    // })

    // .state('owner', {
    //   url: '/owner',
    //   templateUrl: 'templates/owner.html',
    //   controller: 'ownerCtrl'
    // })

    .state('messages', {
        url: '/messages',
        templateUrl: 'templates/messages.html',
        controller: 'messagesCtrl'
    })

    .state('rating', {
        url: '/rating',
        templateUrl: 'templates/rating.html',
        controller: 'ratingCtrl'
    })

    .state('donate', {
        url: '/donate',
        templateUrl: 'templates/donate.html',
        controller: 'donateCtrl'
    })

    .state('thanks', {
        url: '/thanks',
        templateUrl: 'templates/thanks.html',
        controller: 'thanksCtrl'
    })

    // .state('home', {
    //   url: '/home',
    //   templateUrl: 'templates/home.html',
    //   controller: 'homeCtrl'
    // })

    // END NEW

    .state('doglist', {
        url: '/doglist',
        templateUrl: 'templates/doglist.html',
        controller: 'DogListCtrl'
    })

    .state('signin', {
        url: '/signin',
        templateUrl: 'templates/signin.html',
        controller: 'signinCtrl'
    })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'registerCtrl'
    })

    .state('history', {
        url: '/history',
        templateUrl: 'templates/history.html',
        controller: 'historyCtrl'
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('signin');
});
