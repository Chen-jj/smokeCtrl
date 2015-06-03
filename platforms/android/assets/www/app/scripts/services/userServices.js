//========================================
//Author:     Wyp
//contact:    1140664142@qq.com
//date:       2015.2.3
//========================================
var userModule = angular.module('userServices',['ionic', 'ngCookies']);

userModule.factory('hasLogin', ['$cookieStore', '$state', function($cookieStore, $state){
	$state.go('login');
    return function(){
    	var rootState = $state;
    	rootState.go('login');
        // if (!$cookieStore.get('login_id')) {
        //     return false;
        // } else {
        // 	return true;
        // }
    };
}]);
