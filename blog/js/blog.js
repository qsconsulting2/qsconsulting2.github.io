(function Main(){
    let app = angular.module('body', ['ngAnimate']);
    app.controller('bodyController', [
        '$scope',
        function($scope) {
            $scope.currentTab = 'blog';
            $scope.checkTab = function(name){
                if($scope.currentTab == name){
                    return 'disabled';
                }
            };
            $scope.header = {
                url: '/header.html'
            };
            $scope.footer = {
                url: '/footer.html'
            };
        }
    ]);
})();