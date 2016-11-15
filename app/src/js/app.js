/**
 * Created by guoyang on 2016/11/6.
 */
angular.module("myApp", ["ngMaterial", "ui.router", "ngMessages", "ngSanitize", "angularLazyImg"])

    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.defaults.headers.common["Authorization"] = "Bearer c55bc43fc394e09f2905217c300272db380f9c224aa2a223454af2256b6386fa";
    }])
    .config(["$stateProvider", "$urlRouterProvider",
        function ($stateProvider, $urlRouterProvider) {
            //默认路由
            $urlRouterProvider.otherwise("/shots");
            $stateProvider
                .state("shots", {
                    url: "/shots",
                    templateUrl: "pages/route/shots.html",
                    resolve: {
                        //页面加载前获取数据
                        shotsData: ["ShotsService", function (ShotsService) {
                            return ShotsService.getShots();
                        }],
                        //初始化likes列表
                        likesInit: ["LikedService", function (LikedService) {
                            return LikedService.init();
                        }],
                        shotsInit: ["LikedService", "likesInit", function (LikedService, likesInit) {
                            var likes = likesInit.data
                            angular.forEach(likes, function (like) {
                                LikedService.likesList.push(like.shot.id);
                            })
                        }]
                    },
                    controller: ["shotsData", "shotsInit", "$scope", "$state", "LoadingService", "LikedService",
                        function (shotsData, shotsInit, $scope, $state, LoadingService, LikedService) {
                            var shots = shotsData.data;
                            $scope.shots = shots;

                            //shot-page路由跳转处理
                            $scope.goShot = function (shotId) {
                                $state.go('shotId', {"shotId": shotId});
                            }
                            //shot-user（shot作者）路由跳转处理
                            $scope.goUser = function (userId) {
                                $state.go('users', {"userId": userId});
                            }

                            //页面切换监听
                            $scope.$on("$viewContentLoaded", function (event, viewConfig) {
                                // 获取任何视图设置的参数，以及一个特殊的属性：viewConfig.targetView
                                LoadingService.setLoad(false);
                                console.log("获取数据完成")
                                // console.log(LoadingService.isLoad())
                            });

                        }]
                })
                .state("shotId", {
                    url: "/shots/:shotId",
                    templateUrl: "pages/route/shot.html",
                    resolve: {
                        shot: ["ShotsService", "FormatService", "$stateParams",
                            function (ShotsService, FormatService, $stateParams) {
                                return ShotsService.getAShot($stateParams.shotId);
                            }],
                        comments: ["CommentsService", "$stateParams",
                            function (CommentsService, $stateParams) {
                                return CommentsService.getComments($stateParams.shotId);
                            }]
                    },
                    controller: ["$scope", "$state", "shot", "comments", "FormatService", "LikedService",
                        function ($scope, $state, shot, comments, FormatService, LikedService) {
                            $scope.shot = shot.data;
                            $scope.comments=comments.data;
                            console.log($scope.comments);
                            $scope.createTime = function (time) {
                                return FormatService.formatTime(time);
                            }

                            $scope.toggleLike = function (shot) {
                                LikedService.toggleLike(shot);
                            }

                            $scope.isLikeShot = function (shotId) {
                                return LikedService.isLikeShot(shotId);
                            }

                            //评论排序
                            $scope.sortByNewestTime=function () {
                                $scope.comments.sort(function (a,b) {
                                    var t1=new Date(a['created_at']);
                                    var t2=new Date(b['created_at']);
                                    return t2-t1;

                                })
                            }
                            $scope.sortByOldestTime=function () {
                                $scope.comments.sort(function (a,b) {
                                    var t1=new Date(a['created_at']);
                                    var t2=new Date(b['created_at']);
                                    return t1-t2;
                                })
                            }

                            //路由跳转
                            $scope.goUser = function (userId) {
                                $state.go('users', {"userId": userId});
                            }
                        }]

                })
                //当前授权登陆的用户
                .state("user", {
                    url: "/user",
                    templateUrl: "pages/route/user.html",
                    resolve: "",
                    controller: ""
                })
                //shot作者
                .state("users", {
                    url: "/users/:userId",
                    templateUrl: "pages/route/user.html",
                    resolve: {
                        author: ["UserService", "$stateParams", function (UserService, $stateParams) {
                            return UserService.getAUser($stateParams.userId);
                        }],
                        userShots: ["UserService", "$stateParams", function (UserService, $stateParams) {
                            return UserService.getUserShots($stateParams.userId);
                        }]
                    },
                    controller: ["$scope", "$state", "author", "userShots", function ($scope, $state, author, userShots) {
                        $scope.user = author.data;
                        $scope.shots = userShots.data;
                        // console.log($scope.user);
                        console.log(userShots.data);


                    }]
                })
                .state("login", {
                    url: "/login",
                    templateUrl: "pages/route/login.html",
                    resolve: "",
                    controller: ""
                })
        }])
    .config(["lazyImgConfigProvider", function (lazyImgConfigProvider) {
        var scrollable = document.querySelector("#scrollable")
        lazyImgConfigProvider.setOptions({
            offset: 100,
            errorClass: 'error',
            successClass: 'success',
            onError: function () {
                // console.log("加载失败")
            },
            onSuccess: function () {
                console.log("加载成功");
            },
            container: angular.element(scrollable)
        })
    }])




