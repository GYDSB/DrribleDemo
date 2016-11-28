/**
 * Created by guoyang on 2016/11/6.
 */
angular.module("myApp", ["ngMaterial", "ui.router", "ngMessages",
    "ngSanitize", "infinite-scroll", "angularLazyImg","ngTouch"])

    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.defaults.headers.common["Authorization"] = "Bearer c55bc43fc394e09f2905217c300272db380f9c224aa2a223454af2256b6386fa";
    }])
    .config(["$stateProvider", "$urlRouterProvider",
        function ($stateProvider, $urlRouterProvider) {
            //默认路由
            $urlRouterProvider.otherwise("/shots");
            $stateProvider
                .state("shots", {
                    url: "/shots?list&sort&timeframe",
                    templateUrl: "pages/route/shots.html",
                    cache:false,
                    resolve: {
                        likesInit: ["LikedService", function (LikedService) {
                            return LikedService.init();
                        }],
                        shotsInit: ["LikedService", "likesInit", function (LikedService, likesInit) {
                            var likes = likesInit.data
                            angular.forEach(likes, function (like) {
                                LikedService.likesList.push(like.shot.id);
                            })
                            // console.log("初始化完成" + LikedService.likesList)
                        }],
                        setParams:["ShotsService","$stateParams",function (ShotsService,$stateParams) {
                            ShotsService.setParams($stateParams);
                        }]
                    },
                    controller: [ "$scope", "$state", "ShotsService","$stateParams","LikedService","FormatService",
                        function ($scope, $state,  ShotsService,$stateParams,LikedService,FormatService) {
                            // var shots = ;
                            //初始数据获取page=1

                            //根据type判断排序方式
                            //sort:popular,comments,recent,views
                            //list:animated,attachments,debuts,playoffs,rebounds,teams
                            //timeframe:week,month,year,ever

                            $scope.shotsService=ShotsService;
                            // $scope.isPending=ShotsService.isPending;
                            // //参数数组
                            $scope.paramsArray=[
                                {
                                    key:'sort',
                                    values:['popular','comments','views','recent'],
                                    top:ShotsService.params['sort']||'popular'
                                },
                                {
                                    key:'list',
                                    values:['shots','animated','attachments','debuts','playoffs','rebounds','teams'],
                                    top:ShotsService.params['list']||'shots'
                                },
                                {
                                    key:'timeframe',
                                    values:['week','month','year','ever'],
                                    top:ShotsService.params['timeframe']||'Now'
                                }
                            ]
                            // //请求参数
                            $scope.params={
                                sort:"",
                                list:"",
                                timeframe:""
                            }
                            
                            //是否处于缓冲中
                            // $scope.isPending = $scope.shotsService.isPending;

                            $scope.isRecent=function (key) {
                                // console.log(key)
                                if($stateParams['sort']=='recent'&&key=='timeframe'){
                                    return true;
                                }
                                return false;
                            }
                            //格式化时间戳
                            $scope.timestamp=function (past) {
                                return FormatService.formatTime(past);
                            }
                            //格式化描述内容
                            $scope.description=function (descript) {
                                return FormatService.formatDescription(descript);
                            }

                            // console.log($scope.isPending);
                            $scope.nextPage = function () {
                                ShotsService.getShots();
                                $scope.isFinished=ShotsService.isFinished;
                            }

                            // like operation
                            $scope.toggleLike=function (shot) {
                                LikedService.toggleLike(shot);
                            }
                            $scope.isLikeShot=function (shotId) {
                                return LikedService.isLikeShot(shotId);
                            }

                            //shot-page路由跳转处理
                            $scope.goShot = function (shotId) {
                                $state.go('shotId', {"shotId": shotId});
                            }
                            //shot-user（shot作者）路由跳转处理
                            $scope.goUser = function (userId) {
                                $state.go('users', {"userId": userId});
                            }

                            //重新加载参数
                            $scope.resetParams=function (key,value) {
                                var param={}
                                param[key]=value
                                $state.go('shots',param,{reload:true});
                            }

                            //loading more shots
                            $scope.loadMoreShots=function () {
                                ShotsService.isContinued=true;
                                ShotsService.getShots();
                            }



                            // // //移动端Touch事件监听
                            // $scope.touchStart=function ($event) {
                            //     $event.stopPropagation();
                            //     $event.preventDefault();//阻止浏览器默认事件
                            //     console.log($event)
                            // }
                            // $scope.touchMove=function ($event) {
                            //     // console.log("touch move")
                            // }
                            //页面切换监听
                            // $scope.$on("$viewContentLoaded", function (event, viewConfig) {
                            //     // 获取任何视图设置的参数，以及一个特殊的属性：viewConfig.targetView
                            //     LoadingService.setLoad(false);
                            //     console.log("获取数据完成")
                            //     // console.log(LoadingService.isLoad())
                            // });

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
                            // console.log(LikedService.likesList);
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
                        // //初始化首次加载数据
                        // userShots: ["UserService", "$stateParams", function (UserService, $stateParams) {
                        //     UserService.getUserShots($stateParams.userId);
                        // }]
                    },
                    controller: ["$scope", "$state", "author", "UserService","$stateParams",
                        function ($scope, $state, author, UserService,$stateParams) {
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
                            $scope.loadMoreShots=function () {
                                UserService.isContinued=true;
                                UserService.getUserShots($stateParams.userId);
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




