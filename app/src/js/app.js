/**
 * Created by guoyang on 2016/11/6.
 */
angular.module("myApp", ["ngMaterial", "ui.router", "ngMessages", "ngSanitize", "infinite-scroll", "angularLazyImg"])

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
                            ShotsService.getShots();
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
                            console.log("初始化完成" + LikedService.likesList)
                        }]
                    },
                    controller: ["shotsData", "$scope", "$state", "LoadingService", "LikedService", "ShotsService",
                        function (shotsData, $scope, $state, LoadingService, LikedService, ShotsService) {
                            // var shots = ;
                            //初始数据获取page=1
                            $scope.shots = ShotsService.shots;
                            $scope.isPending = ShotsService.isPending;
                            // console.log($scope.isPending);
                            $scope.nextPage = function () {
                                // console.log(ShotsService.params);
                                ShotsService.getShots();
                            }


                            //shot-page路由跳转处理
                            $scope.goShot = function (shotId) {
                                $state.go('shotId', {"shotId": shotId});
                            }
                            //shot-user（shot作者）路由跳转处理
                            $scope.goUser = function (userId) {
                                $state.go('users', {"userId": userId});
                            }

                            $scope.sort = function (type) {
                                //    根据type判断排序方式
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
                            }],
                        isLike: ["LikedService", "$stateParams", "$q",
                            function (LikedService, $stateParams, $q) {
                                return LikedService.isUserLike($stateParams.shotId)
                                    .then(function (success) {
                                        return success;
                                    }).catch(function (error) {
                                        return error;
                                    })

                            }]
                    },
                    controller: ["$scope", "$state", "shot", "comments", "isLike", "FormatService", "LikedService",
                        function ($scope, $state, shot, comments, isLike, FormatService, LikedService) {
                            $scope.shot = shot.data;
                            $scope.comments = comments.data;
                            // console.log(isLike)
                            // $scope.likeFlag=true;
                            if (isLike.status == 200) {
                                $scope.likeFlag = true;
                            } else $scope.likeFlag = false;
                            $scope.isShare = false;
                            $scope.share = function () {
                                $scope.isShare = !$scope.isShare;
                            }
                            $scope.createTime = function (time) {
                                return FormatService.formatTime(time);
                            }

                            $scope.toggleLike = function (shot) {
                                if ($scope.likeFlag) {
                                    $scope.likeFlag = false;
                                    shot["likes_count"] -= 1;
                                    LikedService.removeLikeShot(shot.id);
                                }
                                else {
                                    $scope.likeFlag = true;
                                    shot["likes_count"] += 1;
                                    LikedService.addLikeShot(shot.id);
                                }
                            }

                            //评论排序
                            $scope.sortByNewestTime = function () {
                                $scope.comments.sort(function (a, b) {
                                    var t1 = new Date(a['created_at']);
                                    var t2 = new Date(b['created_at']);
                                    return t2 - t1;

                                })
                            }
                            $scope.sortByOldestTime = function () {
                                $scope.comments.sort(function (a, b) {
                                    var t1 = new Date(a['created_at']);
                                    var t2 = new Date(b['created_at']);
                                    return t1 - t2;
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
                        //初始化首次加载数据
                        userShots: ["UserService", "$stateParams", function (UserService, $stateParams) {
                            UserService.getUserShots($stateParams.userId);
                        }]
                    },
                    controller: ["$scope", "$state", "author", "userShots", "UserService","$stateParams",
                        function ($scope, $state, author, userShots, UserService,$stateParams) {
                            $scope.user = author.data;
                            $scope.shots = UserService.shots;
                            $scope.isPending=UserService.isPending;
                            $scope.nextPage = function () {
                                UserService.getUserShots($stateParams.userId);
                            }
                            $scope.showImg=function (images) {
                                // if(images['hidpi']!=null)return images['hidpi'];
                                // else if (images['normal']!=null) return images['normal'];
                                // else return images['teaser'];
                                // // if(images)c
                                console.log(images);

                            }
                            // console.log($scope.user);
                            // console.log(userShots.data);


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




