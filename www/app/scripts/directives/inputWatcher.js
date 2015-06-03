angular.module('inputWatcher', [])
    .directive('myInputWatcher', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watch(attr.myInputWatcher, function myInputWatcherAction(value){
                console.log(element);
            });
        }
    }
});