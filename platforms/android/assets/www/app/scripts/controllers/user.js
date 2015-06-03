//=====================================
//function:   controllers for chat
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.23
//=====================================

var chatCheckPolling;

var userControllers = angular.module('userControllers', ['ionic', 'ngCookies']);

userControllers
    .controller('userControllers.userMenuCtrl', ['$scope', '$state', '$rootScope',
        function($scope, $state, $rootScope)  {
            
            //---------------定义返回函数---------------------------------
            $scope.back = function(){
                window.clearInterval(chatCheckPolling);
                $('.ui.modal')
                    .modal('hide')
                ;
                $state.go('homepage');
            }

            //----------------初始化用户信息-------------------------------
            $scope.initInfo = function() {
                $.ajax(baseUrl+"/patient"+"/userInfo",{
                    type:"POST",
                    xhrFields: {withCredentials: true},
                    crossDomain:true,
                    data:{'login_id':localStorage.login_id},
                    error:function(){ alert("服务器不能访问");},
                    success:function(msg){
                        if (msg.status == "failure") {
                            localStorage.login_id = '';
                            $state.go("login");
                        } else {
                            $scope.$apply(function() {

                                $scope.userInfo = msg.message;
                                if ($scope.userInfo.gender=='') {
                                    $scope.userInfo.gender='男';
                                    $scope.save();
                                };
                                if ($scope.userInfo.gender=='男')
                                    $scope.userInfo.genderImage = 'app/static/image/male.png';
                                else
                                    $scope.userInfo.genderImage = 'app/static/image/female.png';
                                $scope.userInfo.login_id=localStorage.login_id;
                            });
                        }
                    }
                });
                
                polling();
                chatCheckPolling = setInterval(function(){polling();}, 4000);
            };
            
            //----------------check轮询------------------------------------
            function polling() {
                $.ajax(baseUrl+"/chat/check",{
                    type:"POST",
                    xhrFields: {withCredentials: true},
                    crossDomain:true,
                    data:{'login_id':localStorage.login_id},
                    error:function(){ console.log("服务器不能访问");},
                    success:function(msg){
                        if (msg.status == "failure") {
                            $scope.$apply(function() {
                                $scope.msgCount = 0;
                            });
                        } else {
                            $scope.$apply(function() {
                                $scope.msgCount = msg.count;
                            });
                        }
                    }
                });
            }

            //----------------判断是否已登陆-------------------------------
            if (!localStorage.login_id) {
                $state.go('login');
            } else {
                $scope.initInfo();
            }

            //------------------初始化数据----------------------------------
            $scope.title = "个人中心";
            $scope.editingTitle = "";
            $scope.preName = "";
            $scope.prePhone = "";
            $scope.preEmail = "";
            $scope.myEdit = [
                false, false, false
            ];

            //------------------表单验证------------------------------------
            $("[name='userInfoBaseForm']").validate({
                rules: {
                    username: {
                        required: true,
                        minlength: 1,
                        maxlength: 15
                    },
                    userphone: {
                        required: true,
                        rangelength: [11,11],
                        digits: true
                    },
                    useremail: {
                        required: true,
                        email: true,
                        maxlength: 30
                    }
                },
                messages: {
                    username: {
                        required:    "请输入用户名",
                        minlength:   "请输入用户名",
                        maxlength:   "用户名请不要超过15位"
                    },
                    userphone: {
                        required:    "请输入手机号码",
                        rangelength: "请输入正确的手机号",
                        digits:      "请输入正确的手机号"
                    },
                    useremail: {
                        required:    "请输入邮箱",
                        email:       "请输入正确的邮箱地址",
                        maxlength:   "您输入的邮箱地址过长！"
                    }
                },
                errorLabelContainer: $("section[class='form-alert']"),
                wrapper: 'p',
            });

            //---------------显示上传头像模态对话框------------------------
            $scope.upPhoto = function() {
                $('.ui.modal')
                    .modal('show')
                ;
            };

            //---------------上传头像--------------------------------------
            $scope.uploadLogo = function() {

                lrz($("#logoInputTag")[0].files[0], {
                    width: 100
                }, function(photoCompressed) {
                    // 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
                    console.log(photoCompressed);

                    $.ajax({
                        url: baseUrl+"/patient" + '/photo',  //Server script to process data
                        type: 'POST',
                        crossDomain: true,
                        xhrFields: {withCredentials: true},
                        data: {
                            image: photoCompressed.base64.split(',')[1]
                        },
                        success: function(res) {
                            if (res.status)
                                $scope.$apply(function () {
                                    $scope.userInfo.photo = res.url;console.log(res.url)
                                });
                            else
                                console.log(res.message);
                        },
                        error: function() {
                            alert("服务器不能访问");
                        }
                    });
                });

                $('.ui.modal')
                    .modal('hide')
                ;
            };

            //---------------退出登陆--------------------------------------
            $scope.logout = function() {
                if(chatListPolling)
                    window.clearInterval(chatListPolling);
                if(chatRoomPolling)
                    window.clearInterval(chatListPolling);
                // window.clearInterval(chatRoomPolling);
                $.ajax(baseUrl+"/patient"+'/logout',{
                    type:"POST",
                    data:{'login_id':localStorage.login_id},
                    xhrFields: {withCredentials: true},
                    crossDomain:true,
                    error:function(){
                        console.log("服务器不能访问");
                    },
                    success:function(msg){
                        localStorage.login_id = '';
                        if(isAndroid){
                            window.plugins.jPushPlugin.setAlias('');
                            console.log('set alias to none ok ');
                        }
                        $state.go('homepage');
                        //$scope.$apply(function() {$location.path('/'); });
                    }
                });
            };

            //---------------保存用户信息----------------------------------
            $scope.save = function() {
                if ($("[name='userInfoBaseForm']").valid()) {
                    $scope.userInfo.name = $scope.preName;
                    $scope.userInfo.mobilePhone = $scope.prePhone;
                    $scope.userInfo.mail = $scope.preEmail;

                    $.ajax(baseUrl+"/patient"+'/userUpdate',{
                        type:"POST",
                        data:$scope.userInfo,
                        xhrFields: {withCredentials: true},
                        crossDomain:true,
                        error:function(){
                            alert("服务器不能访问");
                        },
                        success:function(msg){
                            if (msg.status == "failure") {
                                alert("保存失败");
                                $scope.$apply(function() {$scope.initInfo();});
                            }
                            else {
                                $scope.endEdit();
                            }
                        }
                    });
                }
            };

            //---------------显示编辑页面----------------------------------
            $scope.edit = function() {
                $("#userMenuContent").addClass("userMenuContentshort");
                $("#userInfoEditField").addClass("editFieldSlideUp");

                $scope.preName = $scope.userInfo.name;
                $scope.prePhone = $scope.userInfo.mobilePhone;
                $scope.preEmail = $scope.userInfo.mail;

                $(".form-alert")[0].innerHTML = "";
                switch($scope.editingTitle) {
                    case "修改名字":
                        setTimeout(function() {$('[name="username"]')[0].focus();}, 500);
                        break;
                    case "修改手机":
                        setTimeout(function() {$('[name="userphone"]')[0].focus();}, 500);
                        break;
                    case "修改邮箱":
                        setTimeout(function() {$('[name="useremail"]')[0].focus();}, 500);
                        break;
                }
            };

            //---------------隐藏编辑页面----------------------------------
            $scope.endEdit = function() {
                $("#userMenuContent").removeClass("userMenuContentshort");
                $("#userInfoEditField").removeClass("editFieldSlideUp");
            };

        }]);

userControllers
    .controller('userControllers.userBookingCtrl', ['$scope', '$state', function($scope, $state)  {
        /*
         * userBookingCtrl
         * AUTHOR: Chen jiayu
         * CREATE TIME: 2015.1.25
         */
        $scope.back = function(){
            $state.go('userMenu');
        }

        $scope.title = "我的预约";
        $scope.week = {
            Monday:'星期一',
            Tuesday:'星期二',
            Wednesday:'星期三',
            Thursday:'星期四',
            Friday:'星期五',
            Saturday:'星期六',
            Sunday:'星期日'
        };

        $.ajax(baseUrl+"/patient"+"/bookingInfo",{
            type:"POST",
            //data:message,
            xhrFields: {withCredentials: true},
            crossDomain:true,
            error:function(){ alert("服务器不能访问");},
            success:function(msg){
                if (msg.status == "failure") {
                    alert("不能查找");
                } else {
                    $scope.$apply(function() {
                        $scope.bookingList = msg.bookings;
                        // $scope.bookingList.bookingTime = msg.bookings.bookingTime.split(" ")[0];
                        for (var i = 0; i < $scope.bookingList.length; i++) {
                            var temp = $scope.bookingList[i].bookingTime.split(" ");
                            $scope.bookingList[i].bookingDay = temp[0];
                            $scope.bookingList[i].bookingT = temp[1] + " " + temp[2];
                            $scope.findDoctor($scope.bookingList[i].doctorID, i);
                        }
                    });
                }
            }
        });

        $scope.findDoctor = function(uuid, index){
            $.ajax(baseUrl+"/doctor/info",{
                type:"POST",
                data:{
                    doctorID:uuid
                },
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){alert("服务器不能访问");},
                success:function(msg){
                    if (msg.status == "failure") {
                        console.log("不能查找");
                    } else {
                        $scope.$apply(function() {
                            $scope.bookingList[index].doctor = msg.doctor;
                        });
                    }
                }
            });
        };

        $scope.removeDate = function(i) {
            $.ajax(baseUrl+"/patient/delBooking",{
                type:"POST",
                data:{
                    booking_id: $scope.bookingList[i].bookingID
                },
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){alert("服务器不能访问");},
                success:function(msg){
                    if (msg.status == "success") {
                        $scope.$apply(function() {
                            $scope.bookingList.splice(i, 1);
                        })
                    } else {
                        alert("删除失败")
                    }
                }
            });
        }

    }]);

userControllers
    .controller('userControllers.userBookingDetailCtrl', ['$scope','$state', '$stateParams', function($scope, $state, $stateParams)  {
        /*
         * AUTHOR: wyp
         * EMAIL: 1140664142@qq.com
         * CREATE TIME: 2015.1.28
         */
        $scope.back = function (){
            $state.go('userBooking');
        } 
        $scope.title = "预约详情";
        $scope.showMap = false;
        $.ajax(baseUrl+"/patient"+"/bookingInDe",{
            type:"POST",
            data:{
                booking_id:$stateParams.bookingId
            },
            xhrFields: {withCredentials: true},
            crossDomain:true,
            error:function(){ alert("服务器不能访问");},
            success:function(msg){
                if (msg.status == "failure") {
                    alert("不能查找");
                } else {
                    $scope.$apply(function() {
                        $scope.clinicInfo = msg.clinic;
                        $scope.imageSrc = "http://api.map.baidu.com/staticimage?";
                        $scope.imageSrc += "center=" + $scope.clinicInfo.longitude + ',' + $scope.clinicInfo.latitude;
                        $scope.imageSrc += "&zoom=" + '17';
                        $scope.imageSrc += "&markers=" + $scope.clinicInfo.longitude + ',' + $scope.clinicInfo.latitude;
                        $scope.imageSrc += "&markerStyles=l";
                        $scope.bookingDetail = msg.booking;
                        $scope.clinicInfo = msg.clinic;
                        $.ajax(baseUrl+"/doctor/info",{
                            type:"POST",
                            data:{
                                doctorID:$scope.bookingDetail.doctorID
                            },
                            xhrFields: {withCredentials: true},
                            crossDomain:true,
                            error:function(){alert("服务器不能访问");},
                            success:function(msg){
                                if (msg.status == "failure") {
                                    console.log("不能查找");
                                } else {
                                    $scope.$apply(function() {
                                        $scope.doctorInfo = msg.doctor;
                                        console.log($scope.imageSrc);
                                    });
                                }
                            }
                        });
                    });
                }
            }
        });
        $scope.delBooking = function() {
            $.ajax(baseUrl+"/patient"+"/delBooking",{
                type:"POST",
                data:{
                    booking_id:$routeParams.bookingId
                },
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){ alert("服务器不能访问");},
                success:function(msg){
                    if (msg.status == "failure") {
                        alert("删除失败");
                    } else {
                        $state.go('userBooking');
                        // $scope.$apply(function() {
                        //     console.log(msg);
                        //     $location.path('/userBooking');
                        // });
                    }
                }
            });
        }
    }]);

userControllers
    .controller('userControllers.userInfoCtrl', ['$scope', function($scope)  {
        /*
         * userBookingCtrl
         * AUTHOR: wyp
         * CREATE TIME: 2015.2.3
         */
       
        $scope.title = "个人资料";
        var url = baseUrl+"/patient"+"/userInfo";
        $.ajax(url,{
            type:"POST",
            xhrFields: {withCredentials: true},
            crossDomain:true,
            data:{'login_id':localStorage.login_id},
            error:function(){ alert("服务器不能访问");},
            success:function(msg){
                if (msg.status == "failure") {
                    $scope.logout();
                } else {
                    $scope.$apply(function() {
                        $scope.userInfo = msg.message;
                        $scope.userInfo.login_id=localStorage.login_id;
                        console.log($scope.userInfo);
                    });
                }
            }
        });
        $("input").attr("disabled","disabled");
        $("#myEdit").removeAttr("disabled");
        $("#mySave").attr("disabled", "disabled");
        $scope.editable = false;
        $scope.edit = function() {
            $scope.editable = true;
            $("input").removeAttr("disabled");
            $("#mySave").removeAttr("disabled");
            $("#myEdit").attr("disabled", "disabled");
            $(".ui.dropdown").removeClass("disabled");
            $(".ui.dropdown").dropdown();
        };

        $scope.uploadLogo = function() {
            var formData = new FormData($('form')[0]);
            $.ajax({
                url: baseUrl+"/patient" + '/photo',  //Server script to process data
                type: 'POST',
                crossDomain: true,
                xhrFields:   {withCredentials: true},
                data: formData,
                //Options to tell jQuery not to process data or worry about content-type.
                cache: false,
                contentType: false,
                processData: false,
                success: function(res) {
                    if (res.status)
                        $scope.$apply(function () {
                            $scope.userInfo.photo = res.path;
                        });
                    else
                        console.log(res.message);
                },
                error: function() {
                    alert("服务器不能访问");
                }
            });
        };

        $scope.save = function() {
            $.ajax(baseUrl+"/patient"+'/userUpdate',{
                type:"POST",
                data:$scope.userInfo,
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){
                    alert("服务器不能访问");
                },
                success:function(msg){
                    if (msg.status == "failure") {
                        alert("保存失败");
                    }
                }
            });

            $scope.editable = false;
            $("input").attr("disabled","disabled");
            $("#myEdit").removeAttr("disabled");
            $("#mySave").attr("disabled", "disabled");
            $(".ui.dropdown").dropdown("hide");
        };

        $scope.logout = function() {
            $.ajax(baseUrl+"/patient"+'/logout',{
                type:"POST",
                data:{'login_id':localStorage.login_id},
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){
                    alert("服务器不能访问");
                },
                success:function(msg){
                    localStorage.login_id='';
                    $rootScope.favoriteDoctors = [];
                    $rootScope.favoriteClinics = [];
                    $state.go('homepage');
                }
            });
        };
    }]);

//修改密码
userControllers
    .controller('userControllers.userChangePwCtrl', ['$scope', function($scope)  {
        $scope.oldPw = "";
        $scope.newPw = "";
        $scope.rePw = "";
        $scope.save = function(){

        };
    }]);

userControllers
    .controller('userControllers.userPaperCtrl', ['$scope', function($scope)  {

    }]);

//收藏的诊所和医生
userControllers
    .controller('userControllers.userFavoriteCtrl', ['$scope', '$state', '$rootScope', function($scope, $state, $rootScope)  {

        $scope.back = function(){
            $state.go('userMenu');
        }
        $scope.title = '我的收藏';
        
        if ($state.previous.name == "clinicInfo") {
            $scope.isClinic = true;
        } else if ($state.previous.name == "userMenu") {
            $scope.isClinic = true;
        } else {
            $scope.isClinic = false;
        }
        //收藏的诊所
                $.ajax(baseUrl+ "/patient" +"/searchClinics",{
                        type:"POST",
                        data:{'flag' : '2'},
                        xhrFields: {withCredentials: true},
                        crossDomain:true,
                        error:function(){ console.log("服务器不能访问");},
                        success:function(msg){
                            if (msg.status == "failure") {
                                alert("查找失败");
                            } else if(msg) {
                                $scope.$apply(function() {
                                    $scope.clinics = msg.clinics.reverse();
                                });
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
                                    $scope.$apply(function() {
                                        $scope.doctors = msg.doctors.reverse();
                                    });
                                }
                            }
                        });
        $scope.showDoctors = function(){
            $scope.isClinic = false;
        }
        $scope.showClinics = function(){
            $scope.isClinic = true;
        }
    }]);
