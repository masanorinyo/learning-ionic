angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, User, Recommendation) {
  Recommendation.init()
    .then(function(){
      console.log(Recommendation.queue);
      $scope.currentSong = Recommendation.queue[0];
      Recommendation.playCurrentSong()
    });
  
  $scope.nextSong = function(bool){
    $scope.currentSong.rated = bool;
    $scope.currentSong.hide = true;
    if(bool) User.addToFavorite($scope.currentSong);

    Recommendation.nextSong();
    Recommendation.playCurrentSong();
    $timeout(function(){
      $scope.currentSong = Recommendation.queue[0];
    },250);
    
  };

  $scope.nextAlbumImg = function(){
    if(Recommendation.queue.length > 1){
      return Recommendation.queue[1].image_large;
    }else{
      return "";
    }
  };
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
.controller('TabsCtrl', function($scope, Recommendation) {
  $scope.enteringFavorites = function(){
    Recommendation.haltAudio();
  }
  $scope.leavingFavorites = function(){
    Recommendation.init();  
  }
});