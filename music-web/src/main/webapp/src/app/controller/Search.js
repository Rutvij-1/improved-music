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
        spotify_api_site = "https://api.spotify.com/v1/search?q=" + query + "&type=track&market=IN&limit=5";
        lastfm_api_site = "https://ws.audioscrobbler.com/2.0/?method=track.search&track=" + query + "&api_key=6e04e3362ef7be553491b6556935a61b&format=json";
        
        Restangular.one("search", query)
          .get({ limit: 100 })
          .then(function (data) {
            $scope.results = data;
          });
      }, 300);

      
      $scope.searchSpotify = function () {
        console.log(spotify_api_site);
        var heads = {authorization: "Bearer BQAvLNJZM2duEPtTSoaYdpEgtCeYtWgbhCED8N9IHvxSyqE_QDqakmZaG_NJNXjBQoMQ5z8zAB0uCX9BH-LP2EyBFZyK2puKcuCWgPp00YaZtzVceGsE2MN96Bxqc2PuGHHZWyBpW3W-Gtl9_bDhbSvxO0qP1sqnPc_Q7ifp49u49DW-u8A994nHDKe3hTJV_J9oWn1wHCgU1Ktm5DN1U06Zit-pFTgswxr44q2I1osO5U_fFyePr3puib23MlxOX22shSiRVl42lZSR1o7UIOKPdb_WYBaTFaQ3gWdUhvz213M_GiPa1A58myuS3EuoAS0_SrLQi1ZT2Tz27kg6AaPpGAWKqlxWZ1XuU7e8AZWjqwE"};
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
            $scope.track = data.data.results.trackmatches.track;
          },
          function (error) {
            console.log(error);
          }
        );
      };

      $scope.recommendLastFM = function () {
        var site = "https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=cher&track=believe&limit=10&api_key=6e04e3362ef7be553491b6556935a61b&format=json"
        console.log(site);
        $http.get(site).then(
          function (data) {
            console.log(data.data.similartracks.track);
            $scope.track_name = data.data.similartracks.track.name;
            $scope.artist_name = data.data.similartracks.track.artist.name;
            $scope.duration = data.data.similartracks.track.duration;
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
