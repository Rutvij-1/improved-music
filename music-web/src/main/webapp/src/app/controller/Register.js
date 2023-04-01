"use strict";

/**
 * Login controller.
 */
angular
  .module("music")
  .controller(
    "Register",
    function (
      $rootScope,
      $scope,
      $state,
      $dialog,
      User,
      Playlist,
      NamedPlaylist,
      Websocket,
      Restangular
    ) {
      $scope.register = function () {
        Restangular.one("user")
          .put($scope.user)
          .then(function () {
            $scope.loadUsers();
          });

        User.login($scope.user).then(
          function () {
            User.userInfo(true).then(function (data) {
              $rootScope.userInfo = data;
            });

            // Update playlist on application startup
            Playlist.update().then(function () {
              // Open the first track without playing it
              Playlist.open(0);
            });

            // Fetch named playlist
            NamedPlaylist.update();

            // Connect this player
            Websocket.connect();

            $state.transitionTo("main.music.albums");
          }
        );
      };

      $scope.login = function () {
        $state.go("login");
      };
    }
  );
