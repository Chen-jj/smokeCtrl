angular.module("contactUsControllers", ['ionic'])
	
	.controller("contactUsControllers.contactUsCtrl", ['$scope', '$state', function($scope, $state) {
		
		$scope.title = "意见反馈";
		$scope.message = "";
		$scope.contact = "";

		$scope.back = function() {
			$state.go("homepage");
		}

        //------------------表单验证------------------------------------
        $("[name='contactUsForm']").validate({
            rules: {
                message: {
                    required: true,
                    maxlength: 400
                },
                contact: {
                    required: true,
                    maxlength: 30
                }
            },
            messages: {
                message: {
                    required:    "您还没有输入建议哦",
                    maxlength:   "请输入不超过400字的建议"
                },
                contact: {
                    required:    "您还没输入邮箱或电话哦",
                    maxlength:   "请输入不超过30字的联系方式"
                }
            },
            errorLabelContainer: $(".form-alert"),
            wrapper: 'p',
        });

		var url = baseUrl + "/patient/feedback";
        $scope.submit = function() {
            if ($("[name='contactUsForm']").valid()) {
                $.ajax(url,{
                    type:"POST",
                    data:{
                    	message: $scope.message,
                    	contact: $scope.contact
                    },
                    xhrFields: {withCredentials: true},
                    crossDomain:true,
                    error: function(){ alert("服务器不能访问");},
                    success: function(msg){
                        if (msg.status == "success") {
                        	alert("谢谢您的建议！");
                            $scope.$apply(function() {
                                $scope.contact = "";
                                $scope.message = "";
                            });
                        } else {
                        	alert("发送失败");

                        }
                    }
                });
            }
        };

	}]);