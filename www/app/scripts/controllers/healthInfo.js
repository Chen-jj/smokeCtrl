/*
 * EMAIL: 1140664142@qq.com
 * AUTHOR: wyp
 * CREATE TIME: 2015.1.30
 */

var healthInfoControllers = angular.module('healthInfoControllers', ['ionic']);

healthInfoControllers
    .controller('healthInfoControllers.healthInfoCtrl', ['$scope', '$state', function($scope, $state)  {
        $scope.back = function(){
            $state.go('homepage');
        }
        $scope.title = "健康资讯";
        $scope.healthInfos=[
            {
                id:0,
                title:"饭后不能做的8件事",
                time:"2015-1-29",
                content: "感冒是由感冒病毒引起的，目前还没有任何特殊药物能有效地控制感冒病毒感染，并将其杀死。因此，只有做到以下几点，才能有效地预防感冒。",
                type:"育儿",
                praise:200,
                image:"app/static/image/healthInfo1.png"
            },
            {
                id:1,
                title:"怎么样把身体调成碱性",
                time:"2015-1-30",
                content: "　　大部分人对食物酸碱性的认识十分模糊，认为吃起来酸酸的柠檬就是酸性的。其实，食物的酸碱性不是用简单的味觉来判定的。所谓食物的酸碱性，是指食物中的无机盐属于酸性还是属于碱性。",
                type:"其他",
                praise:150,
                image:"app/static/image/healthInfo2.png"
            },
            {
                id:2,
                title:"如何防止小孩感冒",
                time:"2015-2-1",
                content: "不要因为宝宝自出生以来还未生过病而洋洋自得地认为宝宝的抵抗力很强，也不要以为自已坚持母乳喂养就可以保证宝宝不生病。六个月之前的宝宝，确实还没有到疾病的高发阶段。",
                type:"育儿",
                praise:50,
                image:"app/static/image/healthInfo3.png"
            },
            {
                id:3,
                title:"比钙片强10倍的家常菜",
                time:"2015-2-11",
                content: "内容4",
                type:"热点",
                praise:130,
                image:"app/static/image/healthInfo4.png"
            },
            {
                id:4,
                title:"安大夫教你如何防感冒",
                time:"2015-2-10",
                content: "内容5",
                type:"其他",
                praise:100,
                image:"app/static/image/healthInfo5.png"
            }
        ];
    }]);

healthInfoControllers
    .controller('healthInfoControllers.healthInfoDetailCtrl', ['$scope', '$state', function($scope, $state)  {
        $scope.back = function (){
            $state.go('healthInfo');
        }

    }]);