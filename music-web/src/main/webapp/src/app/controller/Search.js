"use strict";

/**
 * Search controller.
 */
angular
  .module("music")
  .controller(
    "Search",
    function ($rootScope, $scope, $stateParams, $http, Restangular, Playlist) {
      // Server call debounced
      var spotify_api_site;
      var lastfm_api_site;

      var search = _.debounce(function (query) {
        spotify_api_site = "https://api.spotify.com/v1/search?q=" + query + "&type=track&market=IN&limit=10";
        lastfm_api_site = "https://ws.audioscrobbler.com/2.0/?method=track.search&track=" + query + "&limit=10&api_key=6e04e3362ef7be553491b6556935a61b&format=json";
        
        Restangular.one("search", query)
          .get({ limit: 100 })
          .then(function (data) {
            $scope.results = data;
          });
      }, 300);

      
      $scope.searchSpotify = function () {
        console.log(spotify_api_site);
        var heads = {authorization: "Bearer BQBi4AHxmdGaR-1jIYE_HqkQfWzRXksgQ1pUL0SQ5AWefkpODlEDTV3hxPkjcGY0DiK6opEysA5mjRh_hHRp3K3agPJFxBIhMNX_lvo2RTl3M2n-uXWIblMGvE95f-Q7wq2-qfxgO_UpSPPSwh02iAcpV3cprBFMaugJp52DMyxGtgJfPDBs32D18LxIHMLQreCYVFXzc1vpg3QF2zJzkJUJ7XWszV852s8FvMDu6P_VOrs7R5qoPFQr3rX8spoev2hySluGDLaxWpzGw6JukV8NR3hbYqGoC5srfQ3nzwvsagMR0QeNgCPkeyCg184ro46psCYW9i6FTPUk0BcOXxIff-Ctt3bjC3aFQ863P8q_eYI"};
        $http.get(spotify_api_site, {headers: heads}).then(
          function (data) {
            console.log(data.data.tracks.items);
            $scope.tracks = data.data.tracks.items;
          },
          function (error) {
            console.log(error);
          }
        );
      };

      $scope.searchLastFM = function () {
        console.log(lastfm_api_site);
        $http.get(lastfm_api_site).then(
          function (data) {
            console.log(data.data.results.trackmatches.track);
            $scope.tracks = data.data.results.trackmatches.track;
          },
          function (error) {
            console.log(error);
          }
        );
      };

      // Watch the search query
      $scope.$watch("$stateParams.query", function (newval) {
        search(newval);
      });

      // Play a single track
      $scope.playTrack = function (track) {
        Playlist.removeAndPlay(track);
      };

      // Add a single track to the playlist
      $scope.addTrack = function (track) {
        Playlist.add(track, false);
      };

      // Like/unlike a track
      $scope.toggleLikeTrack = function (track) {
        Playlist.likeById(track.id, !track.liked);
      };

      // Update UI on track liked
      $scope.$on("track.liked", function (e, trackId, liked) {
        var track = _.findWhere($scope.results.tracks, { id: trackId });
        if (track) {
          track.liked = liked;
        }
      });

      // Add all tracks to the playlist in a random order
      $scope.shuffleAllTracks = function () {
        Playlist.addAll(_.shuffle(_.pluck($scope.results.tracks, "id")), false);
      };

      // Play all tracks
      $scope.playAllTracks = function () {
        Playlist.removeAndPlayAll(_.pluck($scope.results.tracks, "id"));
      };

      // Add all tracks to the playlist
      $scope.addAllTracks = function () {
        Playlist.addAll(_.pluck($scope.results.tracks, "id"), false);
      };

      // Load and play an album
      $scope.playAlbum = function (album) {
        Restangular.one("album", album.id)
          .get()
          .then(function (data) {
            Playlist.removeAndPlayAll(_.pluck(data.tracks, "id"));
          });
      };
    }
  );
