//=====================================
//function:   controllers for homepage
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.23
//=====================================

var homepageControllers = angular.module('homepageControllers', ['ionic']);

homepageControllers
    .controller('homepageControllers.homepageListCtrl', ['$scope', '$state', function($scope, $state)  {

        //---------------收藏---------------------------------------------------
        /*if(localStorage.login_id != ""){
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
        }*/
    }
]);