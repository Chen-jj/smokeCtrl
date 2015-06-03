//=====================================
//function:   controllers for clinic
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.23
//=====================================
var nowPage;
var nowMethod;
var clinicControllers = angular.module('clinicControllers', ['ionic']);
clinicControllers
    /*
     * AUTHOR: wyp
     * EMAIL: 1140664142@qq.com
     * CREATE TIME: 2015.1.25
     */
    .controller('clinicControllers.clinicListCtrl', ['$scope', '$http', '$state', '$rootScope',
        function($scope, $http, $state, $rootScope)  {
            
            $scope.back = function(){
                $state.go('homepage');
            };
            $scope.title = "查找诊所";
            $scope.preClinics = [];
            $scope.clinics = [];
            $scope.canLoad = true;
            $scope.wait = false;
            $scope.clinicListStatus = $rootScope.rootClinicListStatus;
            $scope.loc = {
                x:0,
                y:0
            };
            //--------------------------area选择插件启动函数------------------------------------------------------------
            $(function (){
                initComplexArea('seachprov', 'seachcity', 'seachdistrict', area_array, sub_array, '44', '0', '0');
            });
            //----------------------------------------------------------------------------------------------------------
            //---------------------------百度api获取当前经纬度----------------------------------------------------------
            $scope.prov = '';
            $scope.city = '';
            $.ajax("http://api.map.baidu.com/location/ip?ak="+"wWCV5Oc4fDR65pKjEfweOc27&coor=bd09ll",{
                type:"GET",
                dataType:"jsonp",
                success:function(msg){
                    $scope.$apply(function() {
                        $scope.loc = msg.content.point;
                    });
                    if($rootScope.rootClinicList.length == 0) {
                        $scope.find(1, 1, true);
                        $scope.sidebar();
                    }
                }
            });
            //----------------------------------------------------------------------------------------------------------
            $scope.dropInit = function() {
                $('.dropdown').dropdown();
            };
            $scope.ratingInit = function(rate, index) {
                $('.ui.rating').eq(index).rating('set rating', rate);
                $('.ui.rating').eq(index).rating('disable');
            };

            //---------------------------------------加载缓存的医院----------------------------------------------------
            if ($rootScope.rootClinicList.length != 0) {
                $scope.clinics = $rootScope.rootClinicList;
                if($rootScope.rootClinicList.length < 10)
                     $scope.canLoad = false;

            }
            //-------------------------------------调用查找的api--------------------------------------------------------
            $scope.find = function(method, pageNum, modified) {
                nowMethod = method;
                nowPage = pageNum;
                $scope.sidebar();
                if(modified)
                    $scope.wait = true;
                var provSpanText = $("#provSpan").text();
                var citySpanText = $("#citySpan").text();
                var areaSpanText = $("#areaSpan").text();

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
                    
                    $scope.clinicListStatus = '区域检索：';
                    if (provSpanText != "请选择")
                        $scope.clinicListStatus += provSpanText + " ";
                    if (citySpanText != "请选择")
                        $scope.clinicListStatus += citySpanText + " ";
                    if (areaSpanText != "请选择")
                        $scope.clinicListStatus += areaSpanText;

                    $rootScope.rootClinicListStatus = $scope.clinicListStatus;

                } else if (method == 1) {
                    $scope.clinicListStatus = "离我最近";
                    $rootScope.rootClinicListStatus = $scope.clinicListStatus;
                } else if (method == 2) {
                    $scope.clinicListStatus = "我的收藏";
                    $rootScope.rootClinicListStatus = $scope.clinicListStatus;
                } else if (method == 3) {
                    if (!/^[\u4e00-\u9fa5]+$/.test($scope.searchClinicName)) {
                        alert("请输入正确的诊所名称!");
                        $scope.wait = false;
                        return ;
                    }
                    $scope.clinicListStatus = "按诊所名搜索（含有）：" + $scope.searchClinicName;
                    $rootScope.rootClinicListStatus = $scope.clinicListStatus;
                }

                var message = {
                    flag:     method,
                    province: "",
                    city:     "",
                    district: "",
                    address:  ""
                };

                if (method == 3)
                    message.name = $scope.searchClinicName;

                var areaID = 0;

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

                message.longitude = $scope.loc.x;
                message.latitude = $scope.loc.y;
                message.pageNo = pageNum;
                message.pageCount = 10;
                 // console.log($scope.loc);
                $.ajax(baseUrl+ "/patient" +"/searchClinics",{
                    type:        "POST",
                    data:        message,
                    xhrFields:   {
                                    withCredentials: true
                                 },
                    crossDomain: true,
                    error:       function(){
                                            $scope.wait = false; 
                                            // window.plugins.toast.showShortCenter(
                                            //     "服务器开小差了!请重试！",function(a){},function(b){}
                                            // );
                                            
                                 },
                    success:     function(msg){
                                    if (msg.status == "failure") {
                                        if (msg.msg == "not login"){
                                            alert("请先登陆再使用此功能");
                                            $scope.wait = false;
                                        } else {
                                            $scope.wait = false;
                                            // window.plugins.toast.showShortCenter(
                                            //     "服务器开小差了!请重试！",function(a){},function(b){}
                                            // );
                                            
                                        }
                                    } else {
                                        $scope.canLoad = true;
                                        if (msg.clinics.length < 9)
                                            $scope.$apply(function(){
                                                $scope.canLoad = false;
                                            });
                                        if (msg.clinics.length == 0){
                                            // window.plugins.toast.showShortCenter(
                                            //     "找不到诊所了亲！",function(a){},function(b){}
                                            // );
                                           
                                            if (method == 2){
                                                $scope.$apply(function(){
                                                    $scope.clinics = [];
                                                    $scope.clinics = $scope.preClinics;
                                                    $rootScope.rootClinicList = $scope.clinics;
                                                });
                                               
                                            } else if (method == 3){
                                                alert("找不到含有" + message.name + "的诊所了亲！");
                                                $scope.$apply(function(){
                                                    $scope.clinics = [];
                                                    $scope.canLoad = false;
                                                    $scope.wait = false;
                                                });
                                            } else {
                                                alert("找不到含诊所了亲！");
                                                $scope.$apply(function() {
                                                    $scope.canLoad = false;
                                                    $scope.wait = false;
                                                });
                                            }
                                        } else {
                                            $scope.$apply(function() { 
                                                $scope.preClinics = msg.clinics.reverse();
                                                if (modified) {
                                                    $scope.clinics = [];
                                                    $scope.clinics = $scope.preClinics;
                                                    $rootScope.rootClinicList = $scope.clinics;
                                                    nowPage = 1;
                                                } else {
                                                    var clinicsLen = $scope.preClinics.length;
                                                    console.log($scope.clinics);
                                                    for (var i = 0; i < clinicsLen; i++){
                                                        $scope.clinics.push($scope.preClinics[i]);
                                                    }
                                                    $rootScope.rootClinicList = $scope.clinics;
                                                    console.log($scope.clinics);
                                                }
                                                // console.log('loglog:' + $scope.preClinics);
                                                $scope.wait = false;
                                            });

                                        }
                                    }
                                }
                });
            };
            //---------------------------------------加载函数，每次加载10个---------------------------------------------
            // $scope.initload = function() {
            //     $scope.clinics = [];
            //     $scope.load();
            // };
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


clinicControllers
    /*
     * AUTHOR: wyp
     * EMAIL: 1140664142@qq.com
     * CREATE TIME: 2015.1.25
     */
    .controller('clinicControllers.clinicInfoCtrl', ['$scope', '$state', '$rootScope',
        function($scope, $state, $rootScope)  {
            console.log($rootScope)
            console.log($state);
            $scope.back = function(){
                if($state.previous.name == 'userFavorite') {
                    $state.go('userFavorite');
                } else { 
                    $state.go('clinicList');   
                }
            };


            //-------------------------------------变量初始化-----------------------------------------------------------
            $scope.showMap = false;
            $scope.showComplaint = false;
            $scope.favorite = false;
            if(localStorage.login_id != ''){
                $scope.hasLogin = true;
            } else {
                $scope.hasLogin = false;
            }
            $scope.currentPage = "clinic";

            //-------------------------------------获取诊所信息---------------------------------------------------------
            $.ajax(baseUrl+ "/patient" +"/clinicInfo",{
                type: "GET",
                data: {
                    clinic_id: $state.params.clinicId
                },
                xhrFields: {withCredentials: true},
                crossDomain: true,
                error: function(){alert("服务器不能访问");},
                success: function(msg){
                    if (msg.status == "failure") {
                        alert("诊所不存在或已删除");
                    } else {
                        $scope.$apply(function() {
                            //--------------------科室id--------------------
                            $scope.clinicID = $state.params.clinicId;
                            //----------科室信息、留言板、信息元组-----------
                            $scope.clinicInfo    = msg.message;
                            $scope.messageBoard  = msg.messageBoard;
                            $scope.doctorTunple  = msg.doctor;
                            $scope.patientTunple = msg.patient;


                            initBoard($scope.messageBoard);
                            //----------------------------------------------
                            $scope.isSet = false;
                        });
                        //是否被收藏

                        var favoriteLen = $rootScope.favoriteClinics.length;
                        for (var i = 0; i < favoriteLen; i++) {
                            console.log($state.params.clinicId + " - " + $rootScope.favoriteClinics[i].clinicID);
                            if($state.params.clinicId == $rootScope.favoriteClinics[i].clinicID) {
                                $scope.$apply(function() {
                                    $scope.favorite = true;
                                });
                            }
                        }
                    }
                }
            });
            //-------------------------------------地图设置-------------------------------------------------------------
            $scope.setMap = function() {
                if ($scope.isSet==false) {
                    $scope.isSet = true;
                    $scope.imageSrc = "http://api.map.baidu.com/staticimage?";
                    $scope.imageSrc += "center=" + $scope.clinicInfo.longitude + ',' + $scope.clinicInfo.latitude;
                    $scope.imageSrc += "&zoom=" + '17';
                    $scope.imageSrc += "&markers=" + $scope.clinicInfo.longitude + ',' + $scope.clinicInfo.latitude;
                    $scope.imageSrc += "&markerStyles=l";
                    var map = new BMap.Map("l-map",{minZoom:10, maxZoom:17});
                    var point = new BMap.Point($scope.clinicInfo.longitude, $scope.clinicInfo.latitude);
                    var marker = new BMap.Marker(point);
                    map.centerAndZoom(point,17);
                    map.addOverlay(marker);
                    setTimeout(function(){
                        map.setCenter(point);
                    }, 200);
                    map.enableScrollWheelZoom(true);
                    map.addControl(new BMap.NavigationControl());
                    map.addControl(new BMap.ScaleControl());
                    map.addControl(new BMap.OverviewMapControl());
                    map.addControl(new BMap.MapTypeControl());
                }
            };
            //------------------------------------科室选择func----------------------------------------------------------
            $scope.findOffice = function(officeName) {
                var url = baseUrl+ "/patient" +"/department";
                $.ajax(url, {
                    type: "GET",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {
                        clinic_id:       $state.params.clinicId,
                        department_name: officeName
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            $scope.$apply(function() {
                                $scope.dep =   res.message;
                                $scope.doctors = res.message.doctors;
                                $scope.currentPage = "room";
                                $scope.doctorIdAndName = res.val;
                                // findDoctorName($scope.doctors);
                            });
                        } else {
                            alert("get news wrong!")
                        }
                    },
                    error: function () {
                        alert("error");
                    }
                });
            };
            //-------------------------------------评分激活-------------------------------------------------------------
            $scope.ratingInit = function() {
                $('.ui.rating').rating();
            };
            $scope.isCompaint = false;
            //-------------------------------------初始化留言板-------------------------------------------------------------
            function initBoard(board) {

                var msgboard  = $scope.msgboard  = [];
                var complaint = $scope.complaint = [];

                for (var i in board) {

                    //init date
                    board[i].date = initDate(board[i].date);

                    //find doctor name and logo
                    if (board[i].doctorID) {
                        var doctorID =  board[i].doctorID;

                        for (var j in $scope.doctorTunple) {

                            if ($scope.doctorTunple[j].uuid == doctorID) {
                                if ($scope.doctorTunple[j].name != "")
                                    board[i].doctorName = $scope.doctorTunple[j].name;
                                else
                                    board[i].doctorName = "医生";
                                board[i].doctorPhoto = $scope.doctorTunple[j].photo;
                                break;
                            }

                        }
                    }

                    //find user name and logo
                    if (board[i].userID) {
                        var userID = board[i].userID;

                        for (var j in $scope.patientTunple) {

                            if ($scope.patientTunple[j].uuid == userID) {
                                if ($scope.patientTunple[j].name != "")
                                    board[i].patientName = $scope.patientTunple[j].name;
                                else
                                    board[i].patientName = "匿名用户";
                                board[i].patientPhoto = $scope.patientTunple[j].photo;
                                break;
                            }

                        }
                    }

                    if (board[i].doctorID && board[i].userID)
                        board[i].isReply = true;
                    else
                        board[i].isReply = false; 

                    //分开普通留言和投诉
                    if (board[i].isComplaint == false) {
                        msgboard.push(board[i]);
                    } else {
                        complaint.push(board[i]);
                    }

                }
            
            }
            //--------------------------------------留言ajax------------------------------------------------------------
            $scope.submitMsg = function(valid) {

                if (!valid)
                    return;

                $.ajax(baseUrl+ "/patient" +'/leaveMessage', {
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {
                        message:     $scope.comment,
                        patient_id:  localStorage.login_id,
                        isComplaint: $scope.showComplaint,
                        clinic_id:   $state.params.clinicId
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            alert("留言成功！谢谢您！");
                            //--------------回显---------------
                            $scope.$apply(function() {

                                $.ajax(baseUrl+ "/patient" +"/clinicInfo",{
                                    type: "GET",
                                    data: {
                                        clinic_id: $state.params.clinicId
                                    },
                                    xhrFields: {withCredentials: true},
                                    crossDomain: true,
                                    error: function(){alert("服务器不能访问");},
                                    success: function(msg){
                                        if (msg.status == "failure") {
                                            alert("诊所不存在或已删除");
                                        } else {
                                            $scope.$apply(function() {
                                                $scope.messageBoard  = msg.messageBoard;
                                                $scope.doctorTunple  = msg.doctor;
                                                $scope.patientTunple = msg.patient;

                                                initBoard($scope.messageBoard);
                                            });
                                        }
                                    }
                                });

                                $scope.comment = "";

                            });

                        } else {
                            alert("留言失败，请先登录");
                            $state.go('login');
                        }
                    },
                    error: function () {
                        alert("服务器不能访问");
                    }
                });
            };
            //--------------------------------------添加收藏------------------------------------------------------------
            $scope.addFavorite = function() {
                $.ajax(baseUrl+ "/patient" +'/addFavoriteClinic', {
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {
                        clinic_id:$state.params.clinicId
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            alert('收藏成功！');
                            $scope.$apply(function() {
                                $scope.favorite = true;
                            });
                            //更新收藏的诊所
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
                                                $rootScope.favoriteClinics = msg.clinics.reverse();
                                            });
                                        }
                                    }
                                });
                        } else if(res.msg == "don't add again"){
                            alert('该诊所已经收藏');
                        }
                    },
                    error: function () {
                        // alert("请求失败");
                    }
                });
            }
            //--------------------------------------取消收藏------------------------------------------------------------
            $scope.deleteFavorite = function() {
                $.ajax(baseUrl+ "/patient" +'/delFavoriteClinic', {
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {
                        clinic_id:$state.params.clinicId
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            
                            $scope.$apply(function() {
                                $scope.favorite = false;
                            });
                             //更新收藏的诊所
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
                                                $rootScope.favoriteClinics = msg.clinics.reverse();
                                                alert('取消收藏成功！');
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
            //--------------------------------------格式化时间----------------------------------------------------------
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
        }]);

clinicControllers
    /*
     * AUTHOR: wyp
     * EMAIL: 1140664142@qq.com
     * CREATE TIME: 2015.1.25
     */
    .controller('clinicControllers.clinicNewsCtrl', ['$scope', '$state',
        function($scope, $state) {
            $scope.back = function(){
                $state.go('clinicInfo', {clinicId : $state.params.clinicId});
            };
            $scope.title = "诊所公告";
            $scope.clinicId = $state.params.clinicId;
            $.ajax(baseUrl+ "/patient" +"/clinicAnnouncement",{
                type:"GET",
                data:{clinic_id:$state.params.clinicId},
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){ alert("服务器不能访问");},
                success:function(msg){
                    if (msg.status == "failure") {
                        alert("公告查询失败");
                    } else {
                        console.log(msg)
                        $scope.$apply(function() {
                            $scope.clinicID = $state.params.clinicId;
                            $scope.news = msg.annuoncements;
                        });
                    }
                }
            });
        }]);

clinicControllers
    /*
     * AUTHOR: wyp
     * EMAIL: 1140664142@qq.com
     * CREATE TIME: 2015.1.25
     */
    .controller('clinicControllers.clinicNewDetailCtrl', ['$scope', '$state',
        function($scope, $state) {
            $scope.back = function(){
                $state.go($state.previous.name,{clinicId:$state.params.clinicId});
            };
            $scope.clinicId = $state.params.clinicId;
            $.ajax(baseUrl+ "/patient" +"/clinicAnnouncement",{
                type:"GET",
                data:{clinic_id:$state.params.clinicId},
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){ alert("服务器不能访问");},
                success:function(msg){
                    if (msg.status == "failure") {
                        alert("公告查询失败");
                    } else {
                        for(var i =0; i < msg.annuoncements.length; i++) {
                            if(msg.annuoncements[i].announcementID == $state.params.newId){
                                $scope.$apply(function() {
                                    $scope.news = msg.annuoncements[i];
                                    console.log($scope.news)
                                });
                            }
                        }
                    }
                }
            });
        }]);