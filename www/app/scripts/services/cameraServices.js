//========================================
//Author:     sujy
//contact:    602028597@qq.com
//date:       2015.3.30
//========================================
var cameraServices = angular.module('cameraServices',[]);

cameraServices
.factory('Camera', ['$q', function($q) {
  return {
    getPicture: function(options) {
      var q = $q.defer();
      
      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);
      return q.promise;
    }
  }
}])