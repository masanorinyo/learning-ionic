angular.module('songhop.services', [])
  .factory('User',function(){
    return {
      favorites : [],
      newFavorites: 0,
      addToFavorite: function(song){
        if(song){
          this.favorites.unshift(song);
          this.newFavorites++;
        }
      },
      removeFromFavorites: function(song, index){
        if(song){
          this.favorites.splice(index,1);
        }
      },
      favoriteCount: function(){
        console.log(this.newFavorites);
        return this.newFavorites;
      }
    }
  })
  .factory('Recommendation',function($http, $q, SERVER){
    var media;
    return {
      queue : [],
      init: function(){
        if(this.queue.length === 0){
          return this.getNextSong();
        }else{
          return this.playCurrentSong();
        }
      },
      getNextSong : function(){
        var self = this;
        return $http({
          method: "GET",
          url: SERVER.url + '/recommendations'
        }).success(function(data){
          self.queue = self.queue.concat(data);
        })
      },
      nextSong : function(){
        this.queue.shift();
        this.haltAudio();
        if(this.queue.length <= 3){
          this.getNextSong();
        }
      },
      playCurrentSong : function(){
        var defer = $q.defer();
        media = new Audio(this.queue[0].preview_url);

        media.addEventListener("loadeddata",function(){
          defer.resolve();
        });

        media.play();

        return defer.promise;
      },
      haltAudio : function(){
        if(media) media.pause();
      }
    }
  });
