angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope,  $ionicLoading, $timeout, User, Recommendation) {
  
  var showLoading = function(){
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i>',
      noBackdrop: true
    });
  };
  var hideLoading = function(){
    $ionicLoading.hide();
  };

  Recommendation.init()
    .then(function(){
      $scope.currentSong = Recommendation.queue[0];
      Recommendation.playCurrentSong();
    })
    .then(function(){
      hideLoading();
      $scope.currentSong.loading = true;
    });
  
  $scope.nextSong = function(bool){
    $scope.currentSong.rated = bool;
    $scope.currentSong.hide = true;
    if(bool) User.addToFavorite($scope.currentSong);

    $timeout(function(){
      $scope.currentSong = Recommendation.queue[0];
      $scope.currentSong.loaded = false;
    },250);

    Recommendation.nextSong();
    Recommendation.playCurrentSong().then(function(){
      $scope.currentSong.loaded = true;
    });
    
  };

  $scope.nextAlbumImg = function(){
    if(Recommendation.queue.length > 1){
      return Recommendation.queue[1].image_large;
    }else{
      return "";
    }
  };

  showLoading();
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User) {
  $scope.favorites = User.favorites;
  $scope.removeSong = function(song, index){
    User.removeFromFavorites(song,index);
  };
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope,User, Recommendation) {
  
  $scope.enteringFavorites = function(){
    User.newFavorites = 0;
    Recommendation.haltAudio();
  }
  $scope.leavingFavorites = function(){
    Recommendation.init();  
  }
  $scope.model = User;
});