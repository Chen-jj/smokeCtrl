/**
 * Created by Wyp on 2015/2/11.
 */

var doctorControllers = angular.module('doctorControllers', ['ionic']);

doctorControllers.controller('doctorControllers.doctorDetailCtrl', ['$scope', '$state', '$rootScope',
    function($scope, $state, $rootScope)  {
        //---------------------------------初始化数据---------------------------------------------------------

        $scope.doctorId = $state.params.doctorId;
        $scope.clinicId = $state.params.clinicId;

        $scope.comment  = "";
        $scope.favorite = false;
        if(localStorage.login_id != ''){
            $scope.hasLogin = true;
        } else {
            $scope.hasLogin = false;
        }
        $scope.showMyEvaluate = false;


        //----------------------------------set doctor rating--------------------------------------------------
        function ratingInit() {
            $('.ui.UIdoctorRating.rating').rating('set rating', $scope.doctorInfo.level);
            $('.ui.disableRating.rating').rating('disable');
        }

        $scope.back = function(){
            // $window.history.back();
            if($state.previous.name == 'userFavorite') {
                $state.go('userFavorite');
            } else if($state.previous.name == 'doctorList') {
                $state.go('doctorList');
            } else {
                $state.go('clinicInfo', {clinicId : $state.params.clinicId});
            }
        };
        //-----------------------------------------------------------------------------------------------------

        //-----------------------------------获取医生信息------------------------------------------------------
        $.ajax(baseUrl + "/doctor/info",{

            type:"POST",
            data:{
                doctorID:$scope.doctorId
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
                    });
                    ratingInit();
                    $('.evaluateRate').rating();
                }
            }
        });
        //-------------------------------------是否被收藏---------------------------------------------------
        var favoriteLen = $rootScope.favoriteDoctors.length;
        for (var i = 0; i < favoriteLen; i++) {
            if($state.params.doctorId == $rootScope.favoriteDoctors[i].uuid) {
                $scope.favorite = true;
            }
        }

        //-----------------------------------在线问诊----------------------------------------------------------
        $scope.onlineChating = function() {
            if (localStorage.login_id == "" || localStorage.login_id == undefined || localStorage.login_id == "undefined") {
                alert("请先登录!");
                $state.go('login');
                return;
            }
            $state.go("chatRoom", {fromId: $scope.doctorId, clinicId: $scope.clinicId});
        }

        //-----------------------------------获取医生评价信息---------------------------------------------------

        $.ajax(baseUrl + "/doctor/info/evaluate",{
            type: "POST",
            data: {
                doctorID: $scope.doctorId
            },
            xhrFields: {withCredentials: true},
            crossDomain: true,
            error: function(){alert("服务器不能访问");},
            success: function(msg){
                var evaluates = [];
                if (msg.status == "failure") {
                    console.log("获取医生评价信息失败");
                } else {
                    $scope.$apply(function() {
                        $scope.board = msg.evaluate.reverse();
                        $scope.patients = msg.patients;
                        initBoard($scope.board);
                    });
                }
            }
        });

        
        //-----------------------------------提交评价-----------------------------------------------------------
        $scope.submit = function(valid) {

            if (!valid)
                return;

            var myData = {
                name: "",
                evaluateNote:  $scope.comment,
                doctorID:      $scope.doctorId,
                isFree:        true,
                serve:         $(".evaluateRate").eq(0).rating('get rating'),
                result:        $(".evaluateRate").eq(1).rating('get rating'),
                price:         $(".evaluateRate").eq(2).rating('get rating')
            };

            $.ajax(baseUrl+ "/patient" +'/evaluate', {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: myData,
                success: function (res) {
                    if (res.status == 'success') {
                        $scope.$apply(function() {
                            myData.name = res.name;
                            $scope.board.unshift(myData);
                            $scope.myboard.unshift(myData);
                            $scope.comment = "";
                            $('.evaluateRate').rating('clear rating');
                        });
                        alert("评价成功！谢谢您！");
                    } else {
                        alert("评价失败，请先登录");
                    }
                },
                error: function () {
                    alert("服务器不能访问");
                }
            });

        };

        //-----------------------------------格式化评价----------------------------------------------------------
        function initBoard(board) {
            var blen = board.length;
            if($scope.patients) {
                var plen = $scope.patients.length;
            } else {
                var plen = 0;
            }
            
            $scope.myboard = [];
            
            for (var i = 0; i < blen; i++) {

                board[i].date = initDate(board[i].date);
                board[i].name = "匿名用户";

                for (var j = 0; j < plen; j++) {
                    if (board[i].userID == $scope.patients[j].uuid) {
                        board[i].name = $scope.patients[j].name;
                        if ($scope.patients[j].userID == localStorage.login_id)
                            $scope.myboard.push(board[i]);
                        break;
                    }
                }

            }
        }

        //-----------------------------------格式化时间----------------------------------------------------------
        /*
         * tips: 2015-02-13T21:27:44.095Z =>
         **/
        function initDate(date) {
            
            var newDate;
            var splitT = date.split("T");

            var day  = splitT[0];
            var time = splitT[1].substr(0, 5);

            newDate = day + " " + time;

            return newDate;

        }

        //-----------------------------------医生评价部分func----------------------------------------------------
        $scope.show = [
            true, false
        ];
        $scope.setShow = function(index) {
            $scope.show = [
                false, false
            ];
            $scope.show[index] = true;
        };

        //-----------------------------------添加收藏-----------------------------------------------------------
        $scope.addFavorite = function() {
            $.ajax(baseUrl+ "/patient" +'/addFavoriteDoctor', {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    doctor_id:$state.params.doctorId
                },
                success: function (res) {
                    if (res.status == 'success') {
                        alert('收藏成功！');
                        $scope.$apply(function() {
                            $scope.favorite = true;
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
                                        $rootScope.favoriteDoctors = msg.doctors.reverse();
                                    });
                                }
                            }
                        });
                    } else if(res.msg == "don't add again"){
                        alert('该医生已经收藏');
                    }
                },
                error: function () {
                    // alert("请求失败");
                }
            });
        }

        //-----------------------------------取消收藏-----------------------------------------------------------
        $scope.deleteFavorite = function() {
            $.ajax(baseUrl+ "/patient" +'/delFavoriteDoctor', {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    doctor_id:$state.params.doctorId
                },
                success: function (res) {
                    if (res.status == 'success') {
                        alert('取消收藏成功！');
                        $scope.$apply(function() {
                            $scope.favorite = false;
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
                                        $rootScope.favoriteDoctors = msg.doctors.reverse();
                                    });
                                }
                            }
                        });
                    } else {
                        alert('取消收藏失败，请重试');
                    }
                },
                error: function () {
                    // alert("请求失败");
                }
            });
        }
    }]);

doctorControllers.controller('doctorControllers.doctorBookingCtrl', ['$scope', '$state', '$stateParams',
    function($scope, $stateParams)  {
        $scope.doctorId = $stateParams.params.doctorId;
        $scope.back = function () {
            $stateParams.go('doctorInfo', {doctorId :$scope.doctorId, clinicId:$stateParams.params.clinicId});
        }
        $scope.title = "就诊预约";
        
        $.ajax(baseUrl+"/patient/doctorFreeList",{
            type:"POST",
            data:{
                doctorID:$scope.doctorId
            },
            xhrFields: {withCredentials: true},
            crossDomain:true,
            error:function(){alert("服务器不能访问");},
            success:function(msg){
                if (msg.status == "failure") {
                    console.log("不能查找");
                } else {
                    // console.log(msg);
                    $scope.free = msg.free;
                    $scope.myweekday = msg.weekDay;
                    dispose();
                }
            }
        });
        //dispose $scope.free
        function dispose() {
            var free = $scope.free;
            $scope.myFree = [];
            var weekdayListCH = {
                Monday    : "周一",
                Tuesday   :"周二",
                Wednesday : "周三",
                Thursday  : "周四",
                Friday    : "周五",
                Saturday  : "周六",
                Sunday    : "周日"
            };
            for (var weekday in free) {
                var list = free[weekday][$scope.myweekday[weekday]];
                if (list.length == 0)
                    continue;
                for (var item in list) {
                    var temp = {};
                    temp.weekday = weekdayListCH[$scope.myweekday[weekday]];
                    temp.time = list[item].time;
                    temp.max = list[item].max;
                    temp.count = list[item].count;
                    temp.date = free[weekday].date;
                    $scope.$apply(function() {
                        $scope.myFree.push(temp);
                    });
                }
            }
            // console.log($scope.myFree);
        }
        //------------------------------------预约函数--------------------------------------------------------------
        $scope.booking = function(bookDay, bookTime) {
            if (localStorage.login_id == "" || localStorage.login_id == undefined) {
                alert("请先登录!");
                $stateParams.go('login');
                return;
            } else {
                var weekDay = {
                    "周一" : "Monday",
                    "周二" : "Tuesday",
                    "周三" : "Wednesday",
                    "周四" : "Thursday",
                    "周五" : "Friday",
                    "周六" : "Saturday",
                    "周日" : "Sunday",
                }
                $.ajax(baseUrl+ "/patient" +"/patientBooking",{
                    type:"POST",
                    data:{
                        doctor_uuid:$scope.doctorId,
                        booking_day: weekDay[bookDay],
                        booking_time: bookTime
                    },
                    xhrFields: {withCredentials: true},
                    crossDomain:true,
                    error:function(){alert("服务器不能访问");},
                    success:function(msg){
                        console.log(msg);
                        if (msg.status == "failure") {
                            alert("抱歉，您已经预约过这个时间段了！");
                        } else {
                            alert("预约成功");
                            // $state.go($state.previous.name);
                            // $scope.$apply(function() {
                            //     alert("预约成功");
                            //     window.history.back();
                            // });
                        }
                    }
                });
            }
            
        };
    }]);