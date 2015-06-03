//========================================
//function:   controllers for log in&out
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.24
//========================================



var logControllers = angular.module('logControllers', ['ionic']);

logControllers
    /*
     * AUTHOR: wyp
     * EMAIL: 1140664142@qq.com
     * CREATE TIME: 2015.1.25
     */
    .controller('logControllers.loginCtrl', ['$scope', '$state', '$rootScope',
        function($scope, $state, $rootScope)  {
            
            $scope.isLogin = true;
            /*
            $scope.back = function(){
                if ($state.previous.name == "userMenu") {
                    $state.go('homepage');
                }else if ($state.previousParams.doctorId != ''){
                    $state.go($state.previous.name,{clinicId:$state.previousParams.clinicId, 
                                                    doctorId:$state.previousParams.doctorId});
                } else if($state.previousParams.clinicId != ''){
                    $state.go($state.previous.name,{clinicId:$state.previousParams.clinicId});
                } else {
                    $state.go('homepage');
                }
            }*/

            $scope.login_id = '';

            //------------------登陆表单验证------------------------------------
            $("[name='loginForm']").validate({
                rules: {
                    username: {
                        required: true,
                        rangelength: [11,11],
                        digits: true
                    },
                    password: {
                        required: true,
                        minlength: 6,
                        maxlength: 15,
                        hasValidSymbol: ""
                    }
                },
                messages: {
                    username: {
                        required:    "请输入手机号码",
                        rangelength: "请输入正确的手机号",
                        digits:      "请输入正确的手机号"
                    },
                    password: {
                        required:    "请输入密码",
                        minlength:   "请输入最少6位的密码",
                        maxlength:   "请输入不多于15位的密码",
                        hasValidSymbol: "您的密码输入含有非法字符"
                    }
                },
                errorLabelContainer: $("#loginFormAlert"),
                wrapper: 'p',
            });

            //------------------登陆表单验证------------------------------------
            $("[name='registerForm']").validate({
                rules: {
                    registerUsername: {
                        required: true,
                        rangelength: [11,11],
                        digits: true
                    },
                    registerPassword: {
                        required: true,
                        minlength: 6,
                        maxlength: 15,
                        hasValidSymbol: ""
                    }
                },
                messages: {
                    registerUsername: {
                        required:    "请输入手机号码",
                        rangelength: "请输入正确的手机号",
                        digits:      "请输入正确的手机号"
                    },
                    registerPassword: {
                        required:    "请输入密码",
                        minlength:   "请输入最少6位的密码",
                        maxlength:   "请输入不多于15位的密码",
                        hasValidSymbol: "您的密码输入含有非法字符"
                    }
                },
                errorLabelContainer: $("#registerFormAlert"),
                wrapper: 'p',
            });

            //----------------提交登陆信息---------------------------      
            $scope.submitLogin = function() {
                var url = baseUrl+"/patient"+"/login";

                if ($("[name='loginForm']").valid()) {
                    $.ajax(url, {
                        xhrFields: {withCredentials: true},
                        crossDomain:true,
                        type: "POST",
                        data: {login_id: $scope.login_id, login_pw: $scope.login_pw},
                        error: function () {
                            alert("服务器不能访问");
                        },
                        success: function (msg) {
                            if (msg.status == "failure") {
                                alert("账户名或密码错误，请重试！");
                            } else {
                                localStorage.login_id = $scope.login_id;
                               
                                init();
                                $state.go('homepage');
                            }
                        }
                    });
                }
            };
            //------------------submit register form----------------------------
            $scope.submitRegister = function() {
                if ($("[name='loginForm']").valid()) {
                    var url = baseUrl+"/patient"+"/register";
                    $.ajax(url,{
                        type:"POST",
                        data:{login_id: $scope.register_id, login_pw: $scope.register_pw},
                        xhrFields: {withCredentials: true},
                        crossDomain:true,
                        error:function(){ alert("服务器不能访问");},
                        success:function(msg){
                            if (msg.status == "success") {
                                alert("注册成功，请登录！");
                                $scope.$apply(function(){
                                    $scope.isLogin = true;
                                });
                                // $state.go('register');
                            } else {
                                if (msg.message == 'The ID of user had been used for another user') {
                                    alert("用户已经注册过了，请直接登陆");
                                    $scope.$apply(function(){
                                        $scope.isLogin = true;
                                    });
                                } else {
                                    alert("注册失败，请重试");
                                }
                                
                            }
                        }
                    });
                }
            };
            //---init after login---//
            init = function(){
                if(localStorage.login_id != ""){
                    //收藏的诊所
                    $.ajax(baseUrl+ "/patient" +"/searchClinics",{
                        type:"POST",
                        data:{'flag' : '2'},
                        xhrFields: {withCredentials: true},
                        crossDomain:true,
                        error:function(){ console.log("服务器不能访问");},
                        success:function(msg){
                            if (msg.status == "failure") {
                                console.log("查找失败");
                            } else if(msg) {
                                $rootScope.favoriteClinics = msg.clinics.reverse();
                            }
                        }
                    });
                    //收藏的医生
                    $.ajax(baseUrl+ "/patient" +"/searchDoctors",{
                        type:"POST",
                        data:{'flag' : '2'},
                        xhrFields: {withCredentials: true},
                        crossDomain:true,
                        error:function(){ console.log("服务器不能访问");},
                        success:function(msg){
                            if (msg.status == "failure") {
                                console.log("查找失败");
                            } else if(msg) {
                                $rootScope.favoriteDoctors = msg.doctors.reverse();
                            }
                        }
                    });
                }
            }

        }]);