 <!--
/*
* AUTHOR: sujy
* EMAIL: 602028597@qq.com
* CREATE TIME: 2015.3.21
*/
-->
var searchDoctorControllers = angular.module('searchDoctorControllers', ['ionic']);
searchDoctorControllers
    .controller('searchDoctorControllers.docorListCtrl', ['$scope', '$http', '$state', '$rootScope',
        function($scope, $http, $state, $rootScope)  {
            $scope.back = function(){
                $state.go('homepage');
            };
            $scope.title = "查找医生";
            $scope.doctorIndex = 0;
            $scope.doctors = [];
            $scope.canLoad = false;
            $scope.wait = false;
            $scope.doctorListStatus = "点击右上方开始查找医生"
            // $scope.loc = {
            //     x:0,
            //     y:0
            // };
            //--------------------------area选择插件启动函数------------------------------------------------------------
            $(function (){
                initComplexArea('seachprov', 'seachcity', 'seachdistrict', area_array, sub_array, '44', '0', '0');
            });
            //----------------------------------------------------------------------------------------------------------
            $scope.dropInit = function() {
                $('.dropdown').dropdown();
            };
            $scope.ratingInit = function(rate, index) {
                $('.ui.rating').eq(index).rating('set rating', rate);
                $('.ui.rating').eq(index).rating('disable');
            };
            //---------------------------------------加载函数，每次加载10个---------------------------------------------
            // $scope.load = function() {
            //     if ($scope.doctorIndex < $scope.preDoctors.length) {
            //         $scope.canLoad = true;
            //     };
            //     for (var i = 0; i < 10 && $scope.canLoad; i++) {
            //         if ($scope.doctorIndex >= $scope.preDoctors.length) {
            //             $scope.canLoad = false;
            //             break;
            //         }
            //         $scope.doctors.push($scope.preDoctors[$scope.doctorIndex]);
            //         $scope.doctorIndex++;
            //     };
            // };

            //---------------------------------------加载缓存的医院----------------------------------------------------
            // if ($rootScope.rootDoctorList.length != 0) {
            //     $scope.preDoctors = $rootScope.rootDoctorList;
            //     $scope.load();
            // }
            //-------------------------------------调用查找的api--------------------------------------------------------
            $scope.find = function(method, pageNum, modified) {

                nowMethod = method;
                nowPage = pageNum;

                $scope.sidebar();
                if(modified)
                    $scope.wait = true;

                var message = {
                    flag:method,
                    province:"",
                    city:"",
                    district:"",
                    name:""
                };

                var areaID = 0;

                if (method == 0) {
                    if ($("#seachdistrict").val() != "0") {
                        areaID = $("#seachdistrict").val();
                    } else if ($("#seachcity").val() != "0") {
                        areaID = $("#seachcity").val();
                    } else {
                        alert("请完善搜索信息！");
                        $scope.wait = false;
                        return;
                        areaID = $("#seachprov").val();
                    }

                    if (areaID.length == 2) {
                        message.province = area_array[areaID];
                    } else if (areaID.length == 4){
                        var index1 = areaID.substring(0, 2);
                        message.province = area_array[index1];
                        message.city = sub_array[index1][areaID];
                    } else if (areaID.length == 6) {
                        var index1 = areaID.substring(0, 2);
                        var index2 = areaID.substring(0, 4);
                        message.province = area_array[index1];
                        message.city = sub_array[index1][index2];
                        message.district = sub_arr[index2][areaID];
                    }


                    $scope.doctorListStatus = "按区域查找结果";
                }

                if (method == 1) {
                    if (!/^[\u4e00-\u9fa5]+$/.test($scope.searchDoctorName)) {
                        alert("请输入正确的医生名称!");
                        $scope.wait = false;
                        return ;
                    }
                    message.name = $scope.searchDoctorName;
                    $scope.doctorListStatus = '按医生名搜索（含有）：' + $scope.searchDoctorName;
                }
                if (method == 2)
                    $scope.doctorListStatus = "我收藏的医生";

                // message.longitude = $scope.loc.x;
                // message.latitude = $scope.loc.y;
                 // console.log($scope.loc);
                message.pageNo = pageNum;
                message.pageCount = 1000;
                $.ajax(baseUrl+ "/patient" +"/searchDoctors",{
                    type:        "POST",
                    data:        message,
                    xhrFields:   {
                                    withCredentials: true
                                 },
                    crossDomain: true,
                    error:  function(){
                                alert("服务器开小差了");
                                $scope.wait = false;
                            },
                    success:function(msg){
                                if (msg.status == "failure") {
                                    if (msg.msg == "not login")
                                        alert("请先登陆再使用此功能");
                                    else {
                                        alert("查找失败");
                                    }
                                } else {
                                    $scope.canLoad = true;
                                    if (msg.doctors.length < 9)
                                            $scope.canLoad = false;
                                    if (msg.doctors.length == 0){
                                        // window.plugins.toast.showShortCenter(
                                        //     "找不到诊所了亲！",function(a){},function(b){}
                                        // );
                                        if (method == 2){
                                            $scope.$apply(function() {
                                                $scope.doctors = [];
                                                $scope.doctors = $scope.preDoctors;
                                                $rootScope.rootDoctorList = $scope.clinics;
                                            });
                                          
                                        } else if(method == 1){
                                            alert("找不到名字为" + message.name + "的医生哦！");
                                            $scope.$apply(function() {
                                                $scope.doctors = [];
                                                $scope.canLoad = false;
                                                $scope.wait = false;
                                            });
                                        }else {
                                            alert('没有找到医生哦！');
                                            $scope.$apply(function() {
                                                $scope.canLoad = false;
                                                $scope.wait = false;
                                            });
                                        }
                                    } else {
                                        $scope.$apply(function() {
                                            $scope.doctorIndex = 0;
                                            $scope.preDoctors = msg.doctors.reverse();
                                            if(modified) {
                                                $scope.doctors = [];
                                                $scope.doctors = $scope.preDoctors;
                                                $rootScope.rootDoctorList = $scope.doctors;
                                                nowPage = 1;
                                            } else {
                                                var Arrlen = $scope.preDoctors.length;
                                                for (var i = 0; i < Arrlen; i++) {
                                                    $scope.doctors.push($scope.preDoctors[i]);
                                                }
                                                $rootScope.rootDoctorList = $scope.doctors;
                                            }
                                            $scope.wait = false;
                                        });
                                    }
                                }
                            }
                });
            };
            //----------------------load-----------------------------------------
             $scope.load = function() {
                nowPage += 1;
                $scope.find(nowMethod, nowPage, false);
                $scope.sidebar();
               
                // $scope.clinics = $scope.preClinics;
            }
            //----------------------toggle侧栏-----------------------------------
            $scope.sidebar = function() {
                $('.ui.sidebar')
                    .sidebar({
                        overlay: true
                    })
                    .sidebar('toggle');
                $scope.showMask = !$scope.showMask;
                $("#clinicList").toggleClass("cutClinicList");
            }
    }]);