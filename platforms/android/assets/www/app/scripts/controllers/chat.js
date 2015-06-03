//=====================================
//function:   controllers for chat
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.23
//=====================================

var chatListPolling = '';
var chatRoomPolling = '';
var chatControllers = angular.module('chatControllers', ['ionic','ngCookies', 'inputWatcher','dateServices','ngSanitize', 'cameraServices']);

chatControllers
    .controller('chatControllers.chatListCtrl', ['$scope', '$state', 'rootTime', '$rootScope', function($scope, $state, rootTime, $rootScope)  {
        
        var url = pollingUrl + "/chatList";
        $scope.back = function() {
            window.clearInterval(chatListPolling);
            $state.go('userMenu');
        }
        polling();
        chatListPolling = setInterval(function(){polling();}, 4000);
    
        //--------------轮询-----------------------------------------------------
        function polling() {
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (res) {
                    if (res.status == "success") {
                        $scope.$apply(function() {
                                $scope.message = res.list;
                                dispose($scope.message);
                        })
                    } else {
                        alert("failure");
                    }
                },
                error: function () {
                    alert("error");
                }
            });
        }

        //---------------dispose message--------------------------------------------------
        function dispose(message) {
            var prefix = "";

            for (var i in message) {

                var time = message[i].lastMsg.dialogTime;
                message[i].lastMsg.dialogTime = rootTime(time);

                if (message[i].name == "")
                    message[i].name = "匿名用户";


                //http://honganzaixian.vicp.cc:5555/media/pictures/
                if (message[i].lastMsg.dialogMessage.length > 49) {
                    prefix = message[i].lastMsg.dialogMessage.substr(0, 49);

                    if (prefix == "http://honganzaixian.vicp.cc:5555/media/pictures/")
                        message[i].lastMsg.dialogMessage = "[图片]";
                }

            }
        }
    }]);

chatControllers
    .controller('chatControllers.chatRoomCtrl', ['$scope', '$state', '$stateParams', 'rootTime','Camera','$rootScope', 
        function($scope, $state, $stateParams,  rootTime, Camera, $rootScope )  {

        $scope.back = function (){
            window.clearInterval(chatRoomPolling);
            if ($state.previous.name == 'doctorInfo') {
                $state.go('doctorInfo', {doctorId:$stateParams.fromId, clinicId:$stateParams.clinicId}); 
            } else {
                $state.go($state.previous.name);
            }
        }
        
        //---初始化变量
        $scope.fromUserID = $stateParams.fromId;
        $scope.showImage = false;

        //---------------用于区分显示时间间隔：--------------------------------------
        //---------------历史信息1分钟，当前信息和上一条不超过1分钟------------------
        var TimeSugar    = ""; /*处理历史时间间隔*/
        var NowTimeSugar = ""; /*处理当前聊天时间间隔*/
        //---------------历史信息----------------------------------------------------
        $scope.getHistoryMsg = function() {
            var url = pollingUrl + "/history";
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    isDoctor: false,
                    fromUserID: $stateParams.fromId
                },
                success: function (res) {
                    if (res.status == "success") {
                        //---------获取返回的数据-----------------------------------------------
                        $scope.$apply(function() {
                            $scope.doctor  = res.doctor;
                            $scope.patient = res.patient;
                        })
                        
                        //---------解析返回的数据-----------------------------------------------
                        TimeSugar = res.message[0].dialogTime;//example:2015-03-15T22:49:07.867Z
                        for (var i in res.message) {
                            disposeMessage(res.message[i]);
                        }

                        //---------把解析后的数据放进消息数组-----------------------------------------------
                        $scope.$apply(function() {
                            var prefix = "";

                            for (var i in res.message) {
                                prefix = "";

                                //如果包含表情
                                var pattern = /(\[em\d+\])/g;
                                if (res.message[i].dialogMessage.match(pattern) != null) {
                                    res.message[i].dialogMessage = res.message[i].dialogMessage.replace(pattern, "<img src='app/static/face/" + "$1" + ".png' />");
                                    res.message[i].dialogMessage = res.message[i].dialogMessage.replace(/(\[|\])/g, "");
                                }
                                //http://honganzaixian.vicp.cc:5555/media/pictures/
                                if (res.message[i].dialogMessage.length > 49)
                                    prefix = res.message[i].dialogMessage.substr(0, 49);

                                if (prefix == "http://honganzaixian.vicp.cc:5555/media/pictures/") {
                                    res.message[i].dialogImage   = res.message[i].dialogMessage;
                                    res.message[i].dialogMessage = "";
                                }
                                $scope.message.push(res.message[i]);
                            }
                        })
                        //---------屏幕滚动到底部-----------------------------------------------
                        scrollToBottom();
                    } else {
                        alert("get history messages failure");
                    }
                },
                error: function () {
                    alert("error");
                }
            });
        }

          //---------------让浏览器滚动条保持在最低部----------------------------------
        function scrollToBottom() {
            var height = $("#chatRoomBody").css("height");
            height = parseInt(height.split("p")[0]);
            window.scrollTo(0, height);
        }
        $scope.srcollBottom = scrollToBottom;

        //---------------初始化------------------------------------------------------
        /*初始化消息框*/
        $scope.message = [];
        /*对话患者id*/
        var fromUserID = $stateParams.fromId;
        /*读取历史信息*/
        $scope.getHistoryMsg();
        /*轮询*/
        var url = pollingUrl + "/receive";
        polling(url, fromUserID);
        chatRoomPolling = setInterval(prepoll(url, fromUserID), 4000);

        //--------------轮询-----------------------------------------------------

        function prepoll(url, fromUserID) {
            return function() {
                polling(url, fromUserID);
            }
        }

        function polling(url, fromUserID) {
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {fromUserID: fromUserID},
                success: function (res) {
                    if (res.status == "success") {

                        //如果 当前页面总长度 - 垂直偏移距离 == viewport高度，证明此时窗口在最底端
                        var allheight = $("#chatRoomBody").css("height");
                        allheight = parseInt(allheight.split("p")[0]);
                        var flag = false;
                        if (allheight - window.pageYOffset == window.innerHeight)
                            flag = true;

                        $scope.$apply(function() {
                            if (res.message.length != 0) {
                                var myDate   = new Date();
                                var hour     = myDate.getHours();
                                var minutes  = myDate.getMinutes();
                                var time     = hour + ":" + minutes;
                                var showtime = true;

                                if (NowTimeSugar == time)
                                    showtime = false;
                                else {
                                    NowTimeSugar = time;
                                }

                                for (var i in res.message) {
                                    prefix = "";
                                    res.message[i].fromUserPhoto = $scope.doctor.photo;
                                    res.message[i].showDialogTime = showtime;
                                    res.message[i].dialogTime = time;

                                    //如果包含表情
                                    var pattern = /(\[em\d+\])/g;
                                    if (res.message[i].dialogMessage.match(pattern) != null) {
                                        res.message[i].dialogMessage = res.message[i].dialogMessage.replace(pattern, "<img src='app/static/face/" + "$1" + ".png' />");
                                        res.message[i].dialogMessage = res.message[i].dialogMessage.replace(/(\[|\])/g, "");
                                    }

                                    //http://honganzaixian.vicp.cc:5555/media/pictures/
                                    if (res.message[i].dialogMessage.length > 49)
                                        prefix = res.message[i].dialogMessage.substr(0, 49);

                                    if (prefix == "http://honganzaixian.vicp.cc:5555/media/pictures/") {
                                        res.message[i].dialogImage   = res.message[i].dialogMessage;
                                        res.message[i].dialogMessage = "";
                                    }
                                    $scope.message.push(res.message[i]);

                                }
                            }
                        })

                        //有新信息来到则向下移动窗口
                        if (flag && res.message.length != 0) {
                            scrollToBottom();
                        }

                    } else {
                        alert("failure");
                    }
                },
                error: function () {
                    alert("error");
                }
            });
        }

        //--------------发送信息----------------------------------------------------
        $scope.sendMyMsg = function(imageUrl) {
           //消息为空不发送
            if ($scope.myMsg == ""&&!imageUrl)
                return;

            var msg = $scope.myMsg;
            if (imageUrl) {
                msg = imageUrl;
            }

            var url = pollingUrl + "/send";
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    toUserID: fromUserID,
                    message:  msg,
                    isDoctor: false
                },
                success: function (res) {
                    var myDate   = new Date();
                    var hour     = myDate.getHours();
                    var minutes  = myDate.getMinutes();
                    var time     = hour + ":" + minutes;
                    var showtime = true;

                    if (NowTimeSugar == time)
                        showtime = false;
                    else {
                        NowTimeSugar = time;
                    }

                    if (res.status == "success") {
                        var tempMsg = {
                            dialogTime: time,
                            showDialogTime: showtime,
                            dialogMessage: $scope.myMsg,
                            fromUserPhoto: $scope.patient.photo,
                            isMine: true
                        };
                        if (imageUrl) {
                            tempMsg.dialogMessage = "";
                            tempMsg.dialogImage   = imageUrl;
                        }

                        //如果包含表情
                        var pattern = /(\[em\d+\])/g;

                        if (tempMsg.dialogMessage.match(pattern) != null) {
                            tempMsg.dialogMessage = tempMsg.dialogMessage.replace(pattern, "<img src='app/static/face/" + "$1" + ".png' />");
                            tempMsg.dialogMessage = tempMsg.dialogMessage.replace(/(\[|\])/g, "");
                        }

                        $scope.$apply(function() {
                            $scope.message.push(tempMsg);
                            $scope.myMsg = "";
                        })
                        scrollToBottom();
                    } else {
                        alert("failure");
                    }
                },
                error: function () {
                    alert("error");
                }
            });
        }

        //---------------发送图片----------------------------------------------------
        $scope.sendImage = function(inputThis) {
            if(isAndroid){
                cordova.plugins.pDialog.init({
                    theme : 'HOLO_DARK',
                    progressStyle : 'SPINNER',
                    cancelable : true,
                    title : '请稍等...',
                    message : '图片正在上传'
                });
            }
            

            lrz(inputThis.files[0], {
                    width: 400
                }, function(photoCompressed) {
                    // 你需要的数据都在这里，可以以字符串的形式传送base64给服务端转存为图片。
                    console.log(photoCompressed);

                    $.ajax({
                        url: pollingUrl + "/sendPhoto",
                        // url: "http://192.168.:9000/chat/sendPhoto",
                        type: 'POST',
                        crossDomain: true,
                        xhrFields: {withCredentials: true},
                        data: {
                            image: photoCompressed.base64.split(',')[1]
                        },
                        success: function(res) {
                            console.log(res);
                            if (res.status == "success") {
                                $scope.sendMyMsg(res.url);
                            } else {
                                alert(res);
                            }
                            $scope.showFunctionChoose = false;
                            if(isAndroid){
                                cordova.plugins.pDialog.dismiss();
                            }
                        },
                        error: function(msg) {
                            if(isAndroid){
                                cordova.plugins.pDialog.dismiss();
                            }
                            alert(msg);
                        }
                    });
            });
        }

        //---------------解析消息数据------------------------------------------------
        var disposeMessage = function(data) {
            //历史消息同一分钟内的信息不显示时间
            var time = data.dialogTime.substr(0, 16);//result example: 2015-03-15T22:49
            var preSugar = TimeSugar.substr(0, 16);  //result example: 2015-03-15T22:49

            if (TimeSugar == data.dialogTime) {
                //处理时间
                data.dialogTime = rootTime(data.dialogTime);
                data.showDialogTime = true;
            } else if (preSugar == time) {
                data.showDialogTime = false;
            } else {
                TimeSugar = data.dialogTime;
                //处理时间
                data.dialogTime = rootTime(data.dialogTime);
                data.showDialogTime = true;
            }
            //------------------------------------------------------------------------------

            //确定消息发送主体且匹配头像
            if (data.fromUserID == $scope.doctor.uuid) {
                data.isMine = false;
                data.fromUserPhoto  = $scope.doctor.photo;
            } else if (data.fromUserID == $scope.patient.uuid) {
                data.isMine = true;
                data.fromUserPhoto  = $scope.patient.photo;
            } else {
                console.log("user who send the message is not exist!")
            }
        }

        //--------------选择表情-----------------------------------------------------
        $scope.selectEmotion = function(emo) {
            $scope.myMsg += emo;
            $scope.showEmotionChoose = false;
            $("#chatInput").focus();
        }
        //--------------照片发送-----------------------------------------------------
        $scope.takePhoto = function() {
            Camera.getPicture().then(function(imageData) {
                // console.log(imageData);
                if(isAndroid){
                    cordova.plugins.pDialog.init({
                        theme : 'HOLO_DARK',
                        progressStyle : 'SPINNER',
                        cancelable : true,
                        title : '请稍等...',
                        message : '图片正在上传'
                    });
                }
                convertImgToBase64(imageData, function(base64Img){
                    // Base64DataURL
                    console.log('converted',base64Img);
                    $.ajax({
                        url: pollingUrl + "/sendPhoto",
                        type: 'POST',
                        crossDomain: true,
                        xhrFields: {withCredentials: true},
                        data: {
                            image: base64Img.split(',')[1]
                        },
                        success: function(res) {
                            console.log(res);
                            if (res.status == "success") {
                                $scope.sendMyMsg(res.url);
                            } else {
                                alert(res);
                            }
                            $scope.showFunctionChoose = false;
                            if(isAndroid){
                                cordova.plugins.pDialog.dismiss();
                            }
                        },
                        error: function(msg) {
                            if(isAndroid){
                                cordova.plugins.pDialog.dismiss();
                            }
                            alert(msg);
                        }
                    });
                });
            }, function(err) {
              console.log(err);
            }, {
              quality: 50,
              targetWidth: 320,
              targetHeight: 320,
              saveToPhotoAlbum: false,
              destinationType: 0,
              sourceType: 1,
              encodingType: 0,
            });
          };
         function convertImgToBase64(url, callback, outputFormat){
              var canvas = document.createElement('CANVAS'),
                  ctx = canvas.getContext('2d'),
                  img = new Image;
              img.crossOrigin = 'Anonymous';
              img.onload = function(){
                  var dataURL;
                  canvas.height = 320;
                  canvas.width = 320;
                  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 320,320);
                  dataURL = canvas.toDataURL(outputFormat);
                  callback.call(this, dataURL);
                  canvas = null; 
              };
              img.src = url;
          }

        //
        $scope.imageShow = function (url){
            $scope.imageUrl = url;
            $scope.showImage = true;
        }

        $scope.backToChatRoom = function (){
            $scope.showImage = false;
            var setTime = setTimeout("var height = $(\"#chatRoomBody\").css(\"height\");height = parseInt(height.split(\"p\")[0]);window.scrollTo(0, height);",500);
       }

    }]);
