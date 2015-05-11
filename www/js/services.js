angular.module('songhop.services', ['ionic.utils'])
  .factory('User',function($http, $q, $localstorage, SERVER){
    return {
      favorites : [],
      newFavorites: 0,
      username : false,
      session_id : false,
      addToFavorite: function(song){
        if(song){
          this.favorites.unshift(song);
          this.newFavorites++;

          return $http.post(SERVER.url + "/favorites", {session_id: this.session_id, song_id:song.song_id});
        }
      },
      removeFromFavorites: function(song, index){
        if(song){
          this.favorites.splice(index,1);
          return $http({
            method: "DELETE",
            url: SERVER.url + "/favorites",
            params: {session_id: this.session_id, song_id: song.song_id}
          });
        }
      },
      populateFavorites : function(){
        var self = this;
        return $http({
          method: "GET",
          url : SERVER.url + "/favorites",
          params : {session_id: this.session_id}
        }).success(function(data){
          self.favorites = data;
        });
      },
      setSession : function ( username, session_id, favorites ){
        if( username ) this.username = username;
        if( session_id ) this.session_id = session_id;
        if( favorites ) this.favorites = favorites;

        $localstorage.setObject("user", {
          username: username, 
          session_id : session_id
        })
      },
      favoriteCount: function(){
        return this.newFavorites;
      },
      auth : function(username, signingUp){

         var authRoute;
         var self = this;
         
         if(signingUp){
          authRoute = "signup";
         }else{
          authRoute = "login";
         }

         return $http.post( SERVER.url + "/" + authRoute, {username: username})
         .success(function( data ){
            self.setSession(data.username, data.session_id, data.favorites);
         });
      },
      checkSession : function () {
        var defer = $q.defer();
        var self = this;
        if(self.session_id){
          defer.resolve(true);
        }else{
          var user = $localstorage.getObject("user");
          if(user.username){
            self.setSession(user.username,user.session_id);
            self.populateFavorites().then(function(){
              defer.resolve(true);
            });
          }else{
            defer.resolve(false);
          }
        }

        return defer.promise;
      },
      destroySession : function(){
        $localstorage.setObject('user',{});
        this.username = false;
        this.session_id = false;
        this.favorites = [];
        this.newFavorites = 0;
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
