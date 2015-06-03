angular.module('topbar', ['ionic'])

.run(function ($rootScope, $state) {
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
    $state.previous = fromState;
  });
})

.controller('topBarController', ['$scope', '$state', function($scope, $state){
	console.log('in back');
	$scope.back = function() {
		$state.go($state.previous);
	}
}])