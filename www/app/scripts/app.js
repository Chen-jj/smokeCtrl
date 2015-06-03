var baseUrl = "http://120.25.231.102:9000";
var pollingUrl = 'http://120.25.231.102:9000/chat';

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('starter', ['ionic', 'controllers', 'userServices', 'ngCookies'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    // if(window.cordova && window.cordova.plugins.Keyboard) {
    //   cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    // }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    isAndroid = ionic.Platform.isAndroid();
    /*if(isAndroid){
      //启动极光推送服务
      window.plugins.jPushPlugin.init();
      //调试模式
      window.plugins.jPushPlugin.setDebugMode(true);
      if(localStorage.login_id) {
        window.plugins.jPushPlugin.setAlias(localStorage.login_id);
        console.log('set alias ok');
      }
    }*/

  });
})
.run(function ($rootScope, $state) {
  $state.previousParams = {
    clinicId : '',
    doctorId : ''
  };
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
    
    if(toParams.clinicId) {
      $state.previousParams.clinicId = toParams.clinicId;
    }
    if(toParams.doctorId) {
      $state.previousParams.doctorId = toParams.doctorId;
    }
    $state.previous = fromState;
  });
})
.run(function($rootScope, $ionicPlatform, $state){
  
  //--------缓存搜索过的诊所列表--------
  $rootScope.rootClinicList = [];
  $rootScope.rootClinicListStatus = "";
   //--------缓存搜索过的医生列表--------
  $rootScope.rootDoctorList = [];
  $rootScope.chatListPolling = "";
  $rootScope.chatRoomPolling = "";
  $rootScope.favoriteDoctors = [];
  $rootScope.favoriteClinics = [];
  
  $ionicPlatform.registerBackButtonAction(function(e){
    if ($rootScope.backButtonPressedOnceToExit) {
      ionic.Platform.exitApp();
    }
    else if (!$state.is('homepage')) {
      //返回键跳转逻辑
      //注册
      if ($state.is('login')){
        //登陆页面返回跳转逻辑
        if ($state.previous.name == "userMenu") {
            $('.ui.modal').modal('hide');
            $state.go('homepage');
        }else if ($state.previousParams.doctorId != ''){
            $state.go($state.previous.name,{clinicId:$state.previousParams.clinicId, 
                                            doctorId:$state.previousParams.doctorId});
        } else if($state.previousParams.clinicId != ''){
            $state.go($state.previous.name,{clinicId:$state.previousParams.clinicId});
        } else {
            $state.go('homepage');
        }
      }else if ($state.is('chatList')){
        //聊天页面页面返回跳转逻辑
        if(chatListPolling)
          window.clearInterval(chatListPolling)
        $state.go('userMenu');
      }else if ($state.is('chatRoom')){
        //聊天室页面返回跳转逻辑
        if(chatRoomPolling)
          window.clearInterval(chatRoomPolling)
        if ($state.previous.name == 'doctorInfo') {
                $state.go('doctorInfo', {doctorId:$state.params.fromId, clinicId:$state.params.clinicId}); 
            } else {
                $state.go($state.previous.name);
            }
      }else if ($state.is('clinicInfo')){
        //诊所信息页面跳转逻辑
        if($state.previous.name == 'userFavorite') {
            $state.go('userFavorite');
        } else { 
            $state.go('clinicList');   
        }
      }else if ($state.is('userFavorite')){
        //我的收藏页面跳转逻辑
        $state.go('userMenu');
      } else if ($state.is('userBookingDetail')){
        //用户预约详情页面跳转逻辑
        $state.go('userBooking');
      } else if ($state.is('userBooking')){
        //用户预约页面跳转逻辑
        $state.go('userMenu');
      } else if ($state.is('clinicList')){
        //诊所列表页面跳转逻辑
        $state.go('homepage');
      } else if ($state.is('userMenu')){
        //个人中心页面跳转逻辑
        $('.ui.modal')
                    .modal('hide')
                ;
        $state.go('homepage');
      } else if ($state.is('healthInfo')){
        $state.go('homepage');
      } else if ($state.is('doctorInfo')){
        //医生个人细腻首页跳转逻辑
        if($state.previous.name == 'userFavorite') {
          $state.go('userFavorite');
        } else if($state.previous.name == 'doctorList') {
          $state.go('doctorList');
        } else {
          $state.go('clinicInfo', {clinicId : $state.params.clinicId});
        }
      } else if ($state.is('doctorBooking')){
        //问诊预约页面跳转逻辑
        $state.go('doctorInfo',{doctorId:$state.params.doctorId, clinicId:$state.params.clinicId});
      } else if ($state.is('doctorList')){
        //在线问诊页面跳转
        $state.go('homepage');
      } else {
        $state.go('homepage');
      }
    }
    else {
      $rootScope.backButtonPressedOnceToExit = true;
      window.plugins.toast.showShortBottom(
        "再按一次退出安大夫",function(a){},function(b){}
      );
      setTimeout(function(){
        $rootScope.backButtonPressedOnceToExit = false;
      },2000);
    }
    e.preventDefault();
    return false;
  },101);

})

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
])

.config(function($stateProvider, $urlRouterProvider) {
  var viewsRoot = 'app/views/partials/';
    $stateProvider
    .state('login', {
      url: '/',
      templateUrl: viewsRoot + 'logLogin.html',
      controller: 'logControllers.loginCtrl'
    })

    .state('homepage', {
      url: '/homepage',
      templateUrl: viewsRoot + 'homepage.html',
      controller: 'homepageControllers.homepageListCtrl',
    })

    .state('register', {
      url: '/logRegister',
      templateUrl: viewsRoot + 'logRegister.html',
      controller: 'logControllers.registerCtrl',
    })

    .state('clinicList', {
      url: '/clinicList',
      templateUrl: viewsRoot + 'clinicList.html',
      controller: 'clinicControllers.clinicListCtrl',
    })

    .state('clinicNews', {
      url: '/clinicInfo/:clinicId/clinicNews',
      templateUrl: viewsRoot + 'clinicNews.html',
      controller: 'clinicControllers.clinicNewsCtrl',
    })

    .state('clinicNewsDetail', {
      url: '/clinicInfo/:clinicId/clinicNew/:newId',
      templateUrl: viewsRoot + 'clinicNewDetail.html',
      controller: 'clinicControllers.clinicNewDetailCtrl',
    })

    .state('clinicInfo', {
      url: '/clinicInfo/:clinicId',
      templateUrl: viewsRoot + 'clinicInfo.html',
      controller: 'clinicControllers.clinicInfoCtrl',
    })

    .state('doctorInfo', {
      url: '/doctor/:clinicId/:doctorId',
      templateUrl: viewsRoot + 'doctorDetail.html',
      controller: 'doctorControllers.doctorDetailCtrl',
    })

    .state('doctorBooking', {
      url: '/doctorBooking/:doctorId/:clinicId',
      templateUrl: viewsRoot + 'doctorBooking.html',
      controller: 'doctorControllers.doctorBookingCtrl',
    })

    .state('healthInfo', {
      url: '/healthInfo',
      templateUrl: viewsRoot + 'healthInfo.html',
      controller: 'healthInfoControllers.healthInfoCtrl',
    })

    .state('healthInfoDetial', {
      url: '/healthInfoDetail/:healthInfoId',
      templateUrl: viewsRoot + 'healthInfoDetail.html',
      controller: 'healthInfoControllers.healthInfoDetailCtrl',
    })

    .state('healthManage', {
      url: '/healthManage',
      templateUrl: viewsRoot + 'healthManage.html',
      controller: 'healthManageControllers.healthManageCtrl',
    })

    .state('healthManageMemberList', {
      url: '/healthManageMemberList',
      templateUrl: viewsRoot + 'healthManageMemberList.html',
      controller: 'healthManageControllers.healthManageMemberListCtrl',
    })

    .state('healthManageUserDetail', {
      url: '/healthManageUserDetail/:memberName/:userName/:logo',
      templateUrl: viewsRoot + 'healthManageUserDetail.html',
      controller: 'healthManageControllers.healthManageUserDetailCtrl',
    })

    .state('healthManageUserHistory', {
      url: '/healthManageUserHistory/:memberID/:type',
      templateUrl: viewsRoot + 'healthManageUserHistory.html',
      controller: 'healthManageControllers.healthManageUserHistoryCtrl',
    })

    .state('chatList', {
      url: '/chatList',
      templateUrl: viewsRoot + 'chatList.html',
      controller: 'chatControllers.chatListCtrl',
    })

    .state('chatRoom', {
      url: '/chatRoom/:fromId/:clinicId',
      templateUrl: viewsRoot + 'chatRoom.html',
      controller: 'chatControllers.chatRoomCtrl',
    })

    .state('userMenu', {
      url: '/userMenu',
      templateUrl: viewsRoot + 'userMenu.html',
      controller: 'userControllers.userMenuCtrl'
    })

    .state('userChangePw', {
      url: '/userChangePw',
      tempalteUrl: viewsRoot + 'userChangePw.html',
      controller: 'userControllers.userChangePwCtrl',
    })

    .state('userBooking', {
      url: '/userBooking',
      templateUrl: viewsRoot + 'userBooking.html',
      controller: 'userControllers.userBookingCtrl',
    })

    .state('userBookingDetail', {
      url: '/userBookingDetail/:bookingId',
      templateUrl: viewsRoot + 'userBookingDetail.html',
      controller: 'userControllers.userBookingDetailCtrl',
    })

    .state('userCoupon', {
      url: '/userCoupon',
      templateUrl: viewsRoot + 'userCoupon.html',
      controller: 'userControllers.userCouponCtrl',
    })

    .state('userCouponDetail', {
      url: '/userCouponDetail/:couponId',
      templateUrl: viewsRoot + 'userCouponDetail.html',
      controller: 'userControllers.userCouponDetailCtrl',
    })

    .state('userCouponAdd', {
      url: '/userCouponAdd',
      tempalteUrl: viewsRoot + 'userCouponAdd.html',
      controller: 'userControllers.userCouponAddCtrl',
    })

    .state('userInfo', {
      url: '/userInfo',
      tempalteUrl: viewsRoot + 'userInfo.html',
      controller: 'userControllers.userInfoCtrl',
    })

    .state('userPaper', {
      url:'/userPaper',
      templateUrl: viewsRoot + 'userPaper.html',
      controller: 'userControllers.userPaperCtrl',
    })

    .state('userPaperDetail', {
      url:'/userPaperDetail/:index',
      templateUrl: viewsRoot + 'userPaperDetail.html',
      controller: 'userControllers.userPaperDetailCtrl',
    })

    .state('userFavorite', {
      url:'/userFavorite/:target',
      templateUrl: viewsRoot + 'userFavorite.html',
      controller: 'userControllers.userFavoriteCtrl',
    })

    .state('doctorList', {
      url:'/doctorList',
      templateUrl: viewsRoot + 'doctorList.html',
      controller: 'searchDoctorControllers.docorListCtrl',
    })
    
    .state('healthEva', {
      url:'/healthEva',
      templateUrl: viewsRoot + 'healthEva.html',
      controller: 'healthEvaControllers.healthEvaCtrl',
    })
    
    .state('newHealthManage', {
      url:'/newHealthManage',
      templateUrl: viewsRoot + 'newHealthManage.html',
      controller: 'healthManageControllers.newHealthManageCtrl',
    })
    
    .state('userInsurance', {
      url:'/userInsurance',
      templateUrl: viewsRoot + 'userInsurance.html',
      controller: 'userControllers.userInsuranceCtrl',
    })

  $urlRouterProvider.otherwise('/');
});


//-----------我的jquery.validate自定义表单验证项---------------
$.validator.methods.hasValidSymbol = function(value) {
    var regExp = /[^\+\-\*\/\!\@\#\$\?\w\d]/g;
    return !regExp.test(value);
};
