"use strict";

/**
 * Playlist controller.
 */
angular
  .module("music")
  .controller(
    "Playlist",
    function (
      $scope,
      $state,
      $stateParams,
      $http,
      Restangular,
      Playlist,
      NamedPlaylist
    ) {
      // Load playlist
      Restangular.one("playlist", $stateParams.id)
        .get()
        .then(function (data) {
          $scope.playlist = data;
        });

      $scope.recommendLastFM = function () {
        var tracks = new Array();

        for (var i = 0; i < $scope.playlist.tracks.length; i++) {
          var site =
            `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${String($scope.playlist.tracks[i].artist.name)}&track=${String($scope.playlist.tracks[i].title)}&api_key=6e04e3362ef7be553491b6556935a61b&format=json`;

          console.log(site);

          $http.get(site).then(
            function (data) {
              console.log(data);
              tracks.push(data.data.similartracks.track);
            },
            function (error) {
              console.log(error);
            }
          );
        }

        $scope.tracks = tracks;
      };

      // var spotify_api_site;
      // var lastfm_api_site;

      // spotify_api_site = "https://api.spotify.com/v1/search?q=" + query + "&type=track&market=IN&limit=5";
      // lastfm_api_site = "https://ws.audioscrobbler.com/2.0/?method=track.search&track=" + query + "&api_key=6e04e3362ef7be553491b6556935a61b&format=json";

      $scope.recommendSpotify = function () {
        var tracks = new Array();
        var rsite = "https://api.spotify.com/v1/recommendations?seed_tracks=";

        var heads = {authorization: "Bearer BQAvLNJZM2duEPtTSoaYdpEgtCeYtWgbhCED8N9IHvxSyqE_QDqakmZaG_NJNXjBQoMQ5z8zAB0uCX9BH-LP2EyBFZyK2puKcuCWgPp00YaZtzVceGsE2MN96Bxqc2PuGHHZWyBpW3W-Gtl9_bDhbSvxO0qP1sqnPc_Q7ifp49u49DW-u8A994nHDKe3hTJV_J9oWn1wHCgU1Ktm5DN1U06Zit-pFTgswxr44q2I1osO5U_fFyePr3puib23MlxOX22shSiRVl42lZSR1o7UIOKPdb_WYBaTFaQ3gWdUhvz213M_GiPa1A58myuS3EuoAS0_SrLQi1ZT2Tz27kg6AaPpGAWKqlxWZ1XuU7e8AZWjqwE"}

        for (var i = 0; i < $scope.playlist.tracks.length; i++) {
          var site = "https://api.spotify.com/v1/search?q=" + $scope.playlist.tracks[i].title + "&type=track&market=IN&limit=5";
      
          console.log(site);

          $http.get(site, {headers: heads}).then(
            function (data) {
              console.log(data.data.tracks.items[0].id);
              tracks.push(String(data.data.tracks.items[0].id));
            },
            function (error) {
              console.log(error);
            }
          );
        }

        console.log(tracks)

        
        for(var i = 0; i < tracks.length; i++) {
          console.log(tracks[i]);
          rsite +=  "," + tracks[i];
        }

        // sleep(2000);

        console.log(rsite);

        $http.get(rsite, {headers: heads}).then(
          function (data) {
            console.log(data.data.track);
          },
          function (error) {
            console.log(error);
          }
        );

      };

      // Play a single track
      $scope.playTrack = function (track) {
        Playlist.removeAndPlay(track);
      };

      // Add a single track to the playlist
      $scope.addTrack = function (track) {
        Playlist.add(track, false);
      };

      // Add all tracks to the playlist in a random order
      $scope.shuffleAllTracks = function () {
        Playlist.addAll(
          _.shuffle(_.pluck($scope.playlist.tracks, "id")),
          false
        );
      };

      // Play all tracks
      $scope.playAllTracks = function () {
        Playlist.removeAndPlayAll(_.pluck($scope.playlist.tracks, "id"));
      };

      // Add all tracks to the playlist
      $scope.addAllTracks = function () {
        Playlist.addAll(_.pluck($scope.playlist.tracks, "id"), false);
      };

      // Like/unlike a track
      $scope.toggleLikeTrack = function (track) {
        Playlist.likeById(track.id, !track.liked);
      };

      // Remove a track
      $scope.removeTrack = function (order) {
        NamedPlaylist.removeTrack($scope.playlist, order).then(function (data) {
          $scope.playlist = data;
        });
      };

      // Delete the playlist
      $scope.remove = function () {
        NamedPlaylist.remove($scope.playlist).then(function () {
          $state.go("main.default");
        });
      };

      // Update UI on track liked
      $scope.$on("track.liked", function (e, trackId, liked) {
        var track = _.findWhere($scope.playlist.tracks, { id: trackId });
        if (track) {
          track.liked = liked;
        }
      });

      // Configuration for track sorting
      $scope.trackSortableOptions = {
        forceHelperSize: true,
        forcePlaceholderSize: true,
        tolerance: "pointer",
        handle: ".handle",
        containment: "parent",
        helper: function (e, ui) {
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        stop: function (e, ui) {
          // Send new positions to server
          $scope.$apply(function () {
            NamedPlaylist.moveTrack(
              $scope.playlist,
              ui.item.attr("data-order"),
              ui.item.index()
            );
          });
        },
      };
    }
  );
