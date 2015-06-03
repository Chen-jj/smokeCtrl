/*
 * EMAIL: 1140664142@qq.com
 * AUTHOR: wyp
 * CREATE TIME: 2015.1.30
 */

var healthManageControllers = angular.module('healthManageControllers', ['ionic', 'echartsServices']);

healthManageControllers
    .controller('healthManageControllers.healthManageCtrl', ['$scope', '$state', 'getBarOptions', function($scope, $state, getBarOptions)  {

        //-------------------------数据初始化--------------------------------------------
        $scope.title = "健康管家";
        $scope.members = [];
        $scope.beginTime = "";
        $scope.endTime = "";

        $scope.back = function() {
            $state.go("homepage");
        }
        //获取本天时间
        var myDate = new Date();
        /*
         *example:2015/3/15 下午8:15:50 => ["2015", "3", "15"]
         **/
        var rawtoday = myDate.toLocaleString().split(" ");
        var tempTime = rawtoday[1].split(":")
        $scope.today = {
            day:  rawtoday[0],
            time: tempTime[0] + ":" + tempTime[1]
        }

        //--------------------------数据初始化--------------------------------------------
        //获取用户个人信息
        $.ajax(baseUrl+"/patient/userInfo",{
            type: "POST",
            xhrFields: {withCredentials: true},
            crossDomain: true,
            data: {'login_id':localStorage.login_id},
            success:function(msg){
                if (msg.status == "failure") {
                    localStorage.login_id = '';
                    $state.go("login");
                } else {
                    $scope.$apply(function() {
                        $scope.userInfo = msg.message;
                    });
                }
            },
            error: function () {
                if(isAndroid){
                    window.plugins.toast.showShortCenter(
                        "服务器开小差了",function(a){},function(b){}
                    );
                } else {
                    alert("error");
                }
            }
        });

        //获取成员列表
        $.ajax(baseUrl+"/patient/memberList", {
            xhrFields: {withCredentials: true},
            crossDomain:true,
            type: "POST",
            success: function (msg) {
                if (msg.status == "success") {
                    if (msg.members.length == 0) {
                        addMemberMyself();
                    } else {
                        $scope.$apply(function() {
                            $scope.members = msg.members;
                            for (var i = 0, len = $scope.members.length; i < len; i++) {
                                if ($scope.members[i].name == "myself") {
                                    $scope.members[i].relationship = '本人';
                                    $scope.currentPerson = i;
                                    //画血压图
                                    drawBar();
                                    break;
                                }
                            }
                        });
                    }
                } else {
                    console.log("get memberList failure");
                }
            },
            error: function () {
                if(isAndroid){
                    window.plugins.toast.showShortCenter(
                        "服务器开小差了",function(a){},function(b){}
                    );
                } else {
                    alert("error");
                }
            }
        });

        //--------------------------新增家庭成员(myself)----------------------------------
        function addMemberMyself() {
            $.ajax(baseUrl+"/patient/addMember",{
                type: "POST",
                xhrFields: {withCredentials: true},
                crossDomain: true,
                data: {
                    'name': 'myself',
                    'relationship': 'myself'
                },
                success: function(msg){
                    $scope.$apply(function() {
                        $scope.members.push(msg.member);
                        $scope.currentPerson = 0;
                        //画血压图
                        drawBar();
                    });
                },
                error: function(){
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        console.log("add myself error");
                    }
                }
            });
        }

        //-------------------------切换填写数据页面--------------------------------------
        $scope.showAddTagDataFun = function() {
            $scope.showAddTagData = true;
            //清空提示框
            $(".form-alert")[0].innerHTML = "";
            //清空数据
            $scope.dbp = "";
            $scope.sbp = "";
            $scope.heartRate = "";
            $scope.record = "";
        }

        //-------------------------切换血压/血糖标签---------------------------------------
        $scope.changeTag = function(tag) {
            $scope.currentTag = tag;
            drawBar();
        }

        //---------------------------下拉列表选项绑定函数----------------------------------
        $scope.attachSelect = function() {
            for (var i = 0; i < $scope.members.length; i++) {
                if($scope.currentMember.memberID == $scope.members[i].memberID) {
                    $scope.currentPerson = i;
                }
            }
            drawBar();
        }

        //---------------------------提交数据---------------------------------------------
        $scope.addTagData = function() {

            if ($("[name='addTagDataForm']").valid()) {

                if ($scope.currentTag == "血压") {
                    var url = baseUrl+"/patient/addbp";
                    var data_ = {
                        dbp: $scope.dbp,
                        sbp: $scope.sbp,
                        heartRate: $scope.heartRate
                    }
                } else {
                    var url = baseUrl+"/patient/addbg";
                    var data_ = {
                        record: $scope.record
                    }
                }

                data_["memberID"] = $scope.members[$scope.currentPerson].memberID;

                $.ajax(url, {
                    type: "POST",
                    xhrFields: {withCredentials: true},
                    crossDomain: true,
                    data: data_,
                    success: function(msg){
                        if (msg.status =="success") {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "添加数据成功",function(a){},function(b){}
                                );
                            } else {
                                alert("添加数据成功");
                            }
                            $scope.$apply(function() {
                                $scope.members.splice($scope.currentPerson, 1);
                                $scope.members.push(msg.member);
                                $scope.currentPerson = $scope.members.length - 1;
                                $scope.showAddTagData = false;
                                //画血压or血糖图
                                setTimeout(function() {$scope.$apply(function() {drawBar();})}, 500);
                            });
                        }
                    },
                    error: function(){
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            console.log("add myself error");
                        }
                    }
                });
            }
        }

        //--------------------------表单验证规范------------------------------------------
        $("[name='addTagDataForm']").validate({
            rules: {
                dbp: {
                    required: true,
                    rangelength: [0, 5],
                    number: true
                },
                sbp: {
                    required: true,
                    rangelength: [0, 5],
                    number: true
                },
                heartRate: {
                    required: true,
                    rangelength: [0, 5],
                    number: true
                },
                record: {
                    required: true,
                    rangelength: [0, 5],
                    number: true
                }
            },
            messages: {
                dbp: {
                    required:    "请输入收缩压",
                    rangelength: "请输入正确的收缩压",
                    number:      "请输入正确的收缩压"
                },
                sbp: {
                    required:    "请输入舒张压",
                    rangelength: "请输入正确的舒张压",
                    number:      "请输入正确的舒张压"
                },
                heartRate: {
                    required:    "请输入心率值",
                    rangelength: "请输入正确的心率值",
                    number:      "请输入正确的心率值"
                },
                record: {
                    required:    "请输入血糖值",
                    rangelength: "请输入正确的血糖值",
                    number:      "请输入正确的血糖值"
                }
            },
            errorLabelContainer: $("section[class='form-alert']"),
            wrapper: 'p',
        });

        //----------------------------html5 canvas 绘制柱状图--------------------------------
        function drawBar() {
            //echarts路径配置
            require.config({
                paths: {
                    echarts: 'app/bower_components/echarts-2.2.1/build/dist'
                }
            });

            require(
                [
                    'echarts',
                    'echarts/chart/bar' // 使用柱状图就加载bar模块，按需加载
                ],
                function (ec) {
                    // 基于准备好的dom，初始化echarts图表
                    var myChart = ec.init(document.getElementById('echarts_bar')); 

                    //获取画图所需option
                    if ($scope.currentTag == "血压") {
                        var options = getBarOptions($scope.members[$scope.currentPerson].bloodPressure, 1);
                    } else if ($scope.currentTag == "血糖") {
                        options = getBarOptions($scope.members[$scope.currentPerson].bloodSugar, 2);
                    }
            
                    // 为echarts对象加载数据 
                    myChart.setOption(options.option); 

                    //设置时间
                    $scope.beginTime = rootTime(options.beginTime);
                    $scope.endTime   = rootTime(options.endTime);
                }
            );
        }

        //----------------------------格式化时间-----------------------------------------------
        function rootTime(oldtime) {
            /*
             * 2015-04-21T20:35:54.764Z => 2015/04/21 20:35
             **/
            var date = "";

            if (oldtime != "") {
                var rday  = oldtime.split("T")[0];
                var day   = rday.split("-").join("/");

                var rtime = oldtime.split("T")[1];
                var t_    = rtime.split(":");
                var time  = t_[0] + ":" + t_[1];

                var date = day + " " + time;
            }

            return date;
        }

    }]);

healthManageControllers
    .controller('healthManageControllers.healthManageUserDetailCtrl', ['$scope', '$state', function($scope, $state) {
        
        //--------------数据初始化------------------------------------
        $scope.title = "成员档案";
        $scope.editingTitle = "";
        $scope.BMI = "BMI = 体重(kg) / 身高(m)";
        $scope.memberID   = $state.params.memberName;
        $scope.userName   = $state.params.userName?$state.params.userName:"";
        $scope.userPhoto  = $state.params.logo?$state.params.logo:"";

        $scope.back = function() {
            $state.go("healthManageMemberList");
        }

        //--------------获取用户信息----------------------------------

        /*如果是自己的信息，需要先下载成员列表，找到自己的menberID*/
        $.ajax(baseUrl+"/patient/memberList",{
            type: "POST",
            xhrFields: {withCredentials: true},
            crossDomain: true,
            success: function(msg){
                if (msg.status == "success") {
                    if ($scope.memberID == "myself") {
                        for (var i = 0, len = msg.members.length; i < len; i++) {
                            if (msg.members[i].name == "myself") {
                                $scope.$apply(function() {
                                    $scope.memberID = msg.members[i].memberID;
                                });
                                break;
                            }
                        }
                    }
                    getMenberhel();
                } else {
                    console.log("查找家庭成员列表失败");
                }
            },
            error: function(){
                if(isAndroid){
                    window.plugins.toast.showShortCenter(
                        "服务器开小差了",function(a){},function(b){}
                    );
                } else {
                    alert("error");
                }
            }
        });

        function getMenberhel() {

            $.ajax(baseUrl+"/patient/memberhel",{
                type: "POST",
                xhrFields: {withCredentials: true},
                crossDomain: true,
                data: {'memberID': $scope.memberID},
                success: function(msg){
                    if (msg.status == "success") {
                        $scope.$apply(function() {
                            $scope.memberInfo = msg.member[0];
                            $scope.memberInfo.photo = $scope.userPhoto;
                            var bmi = Math.round($scope.memberInfo.weight / Math.pow(($scope.memberInfo.height / 100), 2) * 10) / 10;
                            $scope.BMI = isNaN(bmi) ? "体重(kg) / 身高(m)" : bmi;
                        });
                        //------------进入的不是自我编辑页面-----------------------------
                        if ($scope.memberID != "myself") {
                            $scope.$apply(function() {
                                $scope.userName = $scope.memberInfo.name;
                                $scope.memberInfo.photo = "app/static/image/morenlogo.png";
                            });
                        }
                    } else {
                        console.log("查无此人");
                    }
                },
                error: function(){
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });

        }

        //---------------显示编辑页面----------------------------------
        $scope.edit = function() {
            $("#hMUserDetailBody").addClass("userMenuContentshort");
            $("#healthInfoEditField").addClass("editFieldSlideUp");

            $scope.preHeight   = $scope.memberInfo.height;
            $scope.preWeight   = $scope.memberInfo.weight;
            $scope.preBirthday = $scope.memberInfo.birthday;
            $scope.preSex      = $scope.memberInfo.gender;

            //清空提示框
            $(".form-alert")[0].innerHTML = "";

            //输入控件获取光标
            switch($scope.editingTitle) {
                case "修改身高":
                    setTimeout(function() {$('[name="userheight"]')[0].focus();}, 500);
                    break;
                case "修改体重":
                    setTimeout(function() {$('[name="userweight"]')[0].focus();}, 500);
                    break;
                case "修改年龄":
                    setTimeout(function() {$('[name="userbirthday"]')[0].focus();}, 500);
                    break;
            }
        };

        //---------------隐藏编辑页面----------------------------------
        $scope.endEdit = function() {
            $("#hMUserDetailBody").removeClass("userMenuContentshort");
            $("#healthInfoEditField").removeClass("editFieldSlideUp");
        };

        //---------------保存用户信息----------------------------------
        $scope.save = function() {
            if ($("[name='healthInfoBaseForm']").valid()) {

                $scope.memberInfo.height   = $scope.preHeight;
                $scope.memberInfo.weight   = $scope.preWeight;
                $scope.memberInfo.birthday = $scope.preBirthday;
                $scope.memberInfo.gender   = $scope.preSex;

                $.ajax(baseUrl+"/patient/updateMem",{
                    type:"POST",
                    data: $scope.memberInfo,
                    xhrFields: {withCredentials: true},
                    crossDomain:true,
                    success: function(msg){
                        if (msg.status == "success") {
                            $scope.$apply(function() {
                                var bmi = Math.round($scope.memberInfo.weight / Math.pow(($scope.memberInfo.height / 100), 2) * 10) / 10;
                                $scope.BMI = isNaN(bmi) ? "体重(kg) / 身高(m)" : bmi;
                            });
                            $scope.endEdit();
                        } else {
                            alert("更改信息失败");
                        }
                    },
                    error: function(msg) {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            alert("error");
                        }
                    }
                });
            }
        };

        //------------------表单验证------------------------------------
        $("[name='healthInfoBaseForm']").validate({
            rules: {
                userheight: {
                    required: true,
                    rangelength: [0, 7],
                    number: true
                },
                userweight: {
                    required: true,
                    rangelength: [0, 6],
                    number: true
                },
                userbirthday: {
                    required: true,
                    rangelength: [0, 3],
                    digits: true
                }
            },
            messages: {
                userheight: {
                    required:    "请输入身高",
                    rangelength: "请输入正确的身高",
                    number:      "请输入正确的身高"
                },
                userweight: {
                    required:    "请输入体重",
                    rangelength: "请输入正确的体重",
                    number:      "请输入正确的体重"
                },
                userbirthday: {
                    required:    "请输入年龄",
                    rangelength: "请输入正确的年龄",
                    digits:      "请输入正确的年龄"
                }
            },
            errorLabelContainer: $("section[class='form-alert']"),
            wrapper: 'p',
        });

    }]);

healthManageControllers
    .controller('healthManageControllers.healthManageMemberListCtrl', ['$scope', '$state', function($scope, $state) {

        //-------------------数据初始化--------------------------------
        $scope.back = function(){
            $state.go('healthManage');
        }

        $scope.title = "家庭成员列表";

        //-------------------获取用户信息------------------------------
        $.ajax(baseUrl+"/patient/userInfo",{
            type: "POST",
            xhrFields: {withCredentials: true},
            crossDomain: true,
            data: {'login_id':localStorage.login_id},
            success: function(msg){
                $scope.$apply(function() {
                    $scope.userInfo = msg.message;
                });
                getMemberList();
            },
            error: function () {
                if(isAndroid){
                    window.plugins.toast.showShortCenter(
                        "服务器开小差了",function(a){},function(b){}
                    );
                } else {
                    alert("error");
                }
            }
        });

        //-------------------获取家庭成员列表--------------------------
        function getMemberList() {
            $.ajax(baseUrl+"/patient/memberList", {
                xhrFields: {withCredentials: true},
                crossDomain:true,
                type: "POST",
                success: function (msg) {
                    if (msg.status == "success") {
                        $scope.$apply(function() {

                            $scope.members = msg.members;

                            for (var i = 0, len = $scope.members.length; i < len; i++) {
                                if ($scope.members[i].name == "myself") {
                                    $scope.members[i].relationship = "本人";
                                    $scope.members[i].photo = $scope.userInfo.photo;
                                } else {
                                    $scope.members[i].photo = "app/static/image/morenlogo.png";
                                }
                            }

                        });
                    } else {
                        console.log("get memberList failure");
                    }
                },
                error: function () {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });
        }

        //------------------表单验证------------------------------------
        $("[name='addMemberForm']").validate({
            rules: {
                Mname: {
                    required: true,
                    rangelength: [0, 10]
                },
                Mrelationship: {
                    required: true,
                    rangelength: [0, 10]
                }
            },
            messages: {
                Mname: {
                    required:    "请输入名字",
                    rangelength: "请输入正确的名字"
                },
                Mrelationship: {
                    required:    "请输入亲戚关系",
                    rangelength: "请输入正确的亲戚关系"
                }
            },
            errorLabelContainer: $("section[class='form-alert']"),
            wrapper: 'p',
        });

        //-------------------添加家庭成员------------------------------
        $scope.addMember = function() {
            if ($("[name='addMemberForm']").valid()) {
                $.ajax(baseUrl+"/patient/addMember",{
                    type:"POST",
                    data:{
                        name: $scope.Mname,
                        relationship: $scope.Mrelationship
                    },
                    xhrFields: {withCredentials: true},
                    crossDomain:true,
                    success: function(msg){
                        if (msg.status == "success") {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "添加家庭成员成功",function(a){},function(b){}
                                );
                            } else {
                                alert("添加家庭成员成功");
                            }
                            $scope.$apply(function() {
                                $scope.Mname = "";
                                $scope.Mrelationship = "";
                                msg.member.photo = "app/static/image/morenlogo.png";
                                $scope.members.push(msg.member);
                            });
                        } else {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "添加家庭成员失败",function(a){},function(b){}
                                );
                            } else {
                                alert("添加家庭成员失败");
                            }
                        }
                    },
                    error: function() {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            alert("error");
                        }
                    }
                });
            }
        }

        //-------------------删除家庭成员--------------------------------
        $scope.removeDate = function(i) {

            $.ajax(baseUrl+"/patient/delMember",{
                type:"POST",
                data:{
                    memberID: $scope.members[i].memberID
                },
                xhrFields: {withCredentials: true},
                crossDomain:true,
                success:function(msg){
                    if (msg.status == "success") {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "删除家庭成员成功",function(a){},function(b){}
                            );
                        } else {
                            alert("删除家庭成员成功");
                        }
                        $scope.$apply(function() {
                            $scope.members.splice(i, 1);
                        });
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "删除家庭成员失败",function(a){},function(b){}
                            );
                        } else {
                            alert("删除家庭成员失败");
                        }
                    }
                },
                error: function() {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });

        }

    }]);

healthManageControllers
    .controller('healthManageControllers.healthManageUserHistoryCtrl', ['$scope', '$state', function($scope, $state) {
        //-------------------数据初始化--------------------------------
        $scope.back = function(){
            $state.go('healthManage');
        }

        $scope.memberID = $state.params.memberID;
        $scope.type = $state.params.type;
        $scope.title = "历史" + $scope.type;
        $scope.chooseDay_1 = "";
        $scope.chooseDay_2 = "";

        //----------------获取成员健康信息------------------------------
        function getMenberhel() {

            $.ajax(baseUrl+"/patient/memberhel",{
                type: "POST",
                xhrFields: {withCredentials: true},
                crossDomain: true,
                data: {'memberID': $scope.memberID},
                success: function(msg){
                    if (msg.status == "success") {
                        $scope.$apply(function() {
                            //获取数据
                            $scope.memberInfo = msg.member[0];
                            $scope.type == "血压" ? $scope.data = $scope.memberInfo.bloodPressure : $scope.data = $scope.memberInfo.bloodSugar;
                            //反序数据
                            $scope.data.reverse();
                            //格式化数据内时间
                            for (var i = 0, len = $scope.data.length; i < len; i++) {
                                $scope.data[i].date = rootTime($scope.data[i].date);
                            }
                            //初始化下拉列表
                            $scope.dayArray_1  = getAllday();
                            $scope.chooseDay_1 = $scope.dayArray_1[0];
                            $scope.changeS2Opts();
                            $scope.yearRangefilter();
                        });
                    } else {
                        console.log("查无此人");
                    }
                },
                error: function(){
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });

        }
        getMenberhel();

        //----------------------------格式化时间-----------------------------------------------
        function rootTime(oldtime) {
            /*
             * 2015-04-21T20:35:54.764Z => 2015/04/21 20:35
             **/
            var date = "";

            if (oldtime != "") {
                var rday  = oldtime.split("T")[0];
                var day   = rday.split("-").join("/");

                var rtime = oldtime.split("T")[1];
                var t_    = rtime.split(":");
                var time  = t_[0] + ":" + t_[1];

                var date = day + " " + time;
            }

            return date;
        }

        //----------------------------获取数据有多少天-----------------------------------------
        function getAllday() {
            var arr = [], temp = "", tmp;

            for (var i = 0, len = $scope.data.length; i < len; i++) {

                tmp = $scope.data[i].date.split(" ")[0];

                if (tmp != temp) {
                    temp = tmp;
                    arr.push(temp);
                }
            }

            return arr;
        }

        //----------------------------获取下拉列表2的options-------------------------------------
        function getSeclect2Options() {
            var arr = [];

            for (var i = 0, len = $scope.dayArray_1.length; i < len; i++) {
                if ($scope.chooseDay_1 != $scope.dayArray_1[i]) {
                    arr.push($scope.dayArray_1[i]);
                } else {
                    arr.push($scope.dayArray_1[i]);
                    break;
                }
            }

            return arr;
        }

        //----------------------------当下拉列表1改变时改变下拉列表2的options-------------------
        $scope.changeS2Opts = function() {
            $scope.dayArray_2  = getSeclect2Options();
            $scope.chooseDay_2 = $scope.dayArray_2[0];
            $scope.yearRangefilter();
        }

        //----------------------------当下拉列表1改变时过滤模型---------------------------------
        $scope.yearRangefilter = function() {
            $scope.visualData = [];

            if ($scope.chooseDay_1 && $scope.chooseDay_2) {
                var begin = parseInt($scope.chooseDay_1.split("/").join(""));
                var end   = parseInt($scope.chooseDay_2.split("/").join(""));
            }

            for (var i = 0, len = $scope.data.length; i < len; i++) {
                var d_ = $scope.data[i];
                var t_ = parseInt(d_.date.split(" ")[0].split("/").join(""));
                
                if (begin <= t_ && t_ <= end) {
                    $scope.visualData.push($scope.data[i]);
                }
            }
        }

    }]);