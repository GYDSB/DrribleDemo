/**
 * Created by guoyang on 2016/11/6.
 */
angular.module("myApp")
    .controller("myController", ["$rootScope", "$mdSidenav","LoadingService", function ($rootScope, $mdSidenav,LoadingService) {

        $rootScope.$on("$stateChangeStart",function ($event) {
            $rootScope.isStateChange=true;
            console.log("页面开始加载")

        })
        $rootScope.$on('$stateChangeSuccess',function ($event) {
            $rootScope.isStateChange=false;
            console.log("页面加载完成")
        })
        $rootScope.$on("$stateChangeError",function ($event) {
            console.log("页面载入失败");
        })
    }])