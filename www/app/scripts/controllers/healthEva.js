angular.module("healthEvaControllers", ['ionic'])
	
	.controller("healthEvaControllers.healthEvaCtrl", ['$scope', '$state', function($scope, $state) {
		
		$scope.title = "健康评估";
        $scope.height = "";
        $scope.weight = "";
        $scope.sex = "";
        $scope.age = "";
        $('.ui.dropdown').dropdown();

		$scope.back = function() {
			$state.go("homepage");
		}

        $scope.dueEvaRes = function() {
            var val = $("#sec option:selected").text();

            $scope.$apply(function() {

                if (val == "--请选择--") {
                    $scope.showEvaRes = false;
                } else  {
                    $scope.showEvaRes = true;
                    if (val == "发热、流涕") {
                        $scope.evaRes = "有可能是流行性感冒，多喝热水，多休息，如若高烧不退请马上就医！";
                    } else if (val == "咳嗽") {
                        $scope.evaRes = "有可能是急性支气管炎，多喝热水。";
                    } else if (val == "肥胖") {
                        $scope.evaRes = "建议多运动，少吃肥腻、油炸食品。";
                    }
                }
            });
        }

        $scope.figureBMI = function() {

            if ($scope.height == "") {
                alert("请输入身高");
                return;
            } else if ($scope.weight == "") {
                alert("请输入体重");
                return;
            } else if ($scope.sex == "") {
                alert("请输入性别");
                return;
            } else if ($scope.age == "") {
                alert("请输入年龄");
                return;
            }

            $scope.BMI = $scope.weight / (($scope.height / 100) * ($scope.height / 100));
            $scope.BMI = Math.round($scope.BMI * 10) / 10;
        }

	}]);