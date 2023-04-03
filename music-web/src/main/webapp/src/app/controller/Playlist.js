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

      Restangular.one("user")
        .get()
        .then(function (data) {
          $scope.user = data;
        });

      $scope.recommendLastFM = function () {
        var tracks = new Array();

        for (var i = 0; i < $scope.playlist.tracks.length; i++) {
          var site = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${String(
            $scope.playlist.tracks[i].artist.name
          )}&track=${String(
            $scope.playlist.tracks[i].title
          )}&limit=10&api_key=6e04e3362ef7be553491b6556935a61b&format=json`;

          console.log(site);

          $http.get(site).then(
            function (data) {
              tracks = [
                ...new Set([...tracks, ...data.data.similartracks.track]),
              ];
            },
            function (error) {
              console.log(error);
            }
          );
        }

        var sleep = new Promise((resolve) => setTimeout(resolve, 1000));

        sleep.then(() => {
          $scope.tracks = tracks;
          console.log(tracks);
        });
      };

      // var spotify_api_site;
      // var lastfm_api_site;

      // spotify_api_site = "https://api.spotify.com/v1/search?q=" + query + "&type=track&market=IN&limit=5";
      // lastfm_api_site = "https://ws.audioscrobbler.com/2.0/?method=track.search&track=" + query + "&api_key=6e04e3362ef7be553491b6556935a61b&format=json";

      $scope.recommendSpotify = function () {
        var tracks = new Array();
        var rsite = "https://api.spotify.com/v1/recommendations?seed_tracks=";
        var num =
          $scope.playlist.tracks.length <= 5
            ? $scope.playlist.tracks.length
            : 5;
        var heads = {
          authorization:
            "Bearer BQA2KdteOfgDPUjXwRvgJ3lpZ-OR2zdQhIbBeTF3mTxqqqpLEzNvgl5qPIMgkDtjMcSO4j02kDR6KbF5aX2hlXt6ve1_CcpTzcYxvlV8Mjd8eGSzjB_GzNoWwMHR1X9jR_47gFQm2HTHwdHGUU5vTN8iadCocsx0fX8YxAh16Ht88Y5giYqv26lP4klVZCJrWXmHRhicQ_VbZ7i2zowal_UAgLFQN9w3XyDfFZs8vNoT_FDeq3ByqgIfUO3-b04-P6T7uGN5x7v4gSobeJns2XxqPoSeqiltbwXn9sfS1U31Hkm9SI9ojMOADBa1e9CdBSw7iaDiW9NDWC8CujDViFIZS5BHf9-vAAE1_CsQ81hqV24",
        };

        for (var i = 0; i < num; i++) {
          var site =
            "https://api.spotify.com/v1/search?q=" +
            $scope.playlist.tracks[i].title +
            "&type=track&market=IN&limit=10";

          console.log(site);

          $http.get(site, { headers: heads }).then(
            function (data) {
              console.log(data.data.tracks.items[0].id);
              tracks.push(String(data.data.tracks.items[0].id));
            },
            function (error) {
              console.log(error);
            }
          );
        }

        console.log(tracks);

        var sleep = new Promise((resolve) => setTimeout(resolve, 1000));

        sleep.then(() => {
          for (var i = 0; i < tracks.length; i++) {
            rsite += tracks[i] + ",";
          }

          console.log(rsite);

          $http.get(rsite, { headers: heads }).then(
            function (data) {
              $scope.tracks = data.data.tracks;
              console.log(data.data.tracks);
            },
            function (error) {
              console.log(error);
            }
          );
        });
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

      // Toggle the playlist public/private status
      $scope.toggleStatus = function () {
        Restangular.one("playlist/status", $stateParams.id)
          .post()
          .then(function (data) {
            $scope.playlist = data;
          });
        window.location.reload();
      };

      // Toggle the public playlist collaboration status
      $scope.toggleCollaboration = function () {
        if ($scope.playlist.isPublic) {
          Restangular.one("playlist/collaboration", $stateParams.id)
            .post()
            .then(function (data) {
              $scope.playlist = data;
            });
          window.location.reload();
        }
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
