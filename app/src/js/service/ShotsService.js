/**
 * Created by guoyang on 2016/11/6.
 */
//用于获取Drrible中shots信息
angular.module("myApp")
    .factory("Base", [function () {
        return {
            url: "https://api.dribbble.com/v1",
            suffix: "?t=" + new Date().getTime(),
        }
    }])
    .factory("ShotsService", ["Base", "$http", function (Base, $http) {
        var service = {
            //获得默认格式的shots
            params: {
                "page": 1,
                "per_page": 12,
                "sort":'popular',
                "timeframe":'now',
                "list":'shots'
            },

            //缓冲状态
            isPending: false,
            //点击加载状态
            isFinished:false,
            isContinued:false,
            //shots列举完毕
            isEndOfShots:false,
            
            shots: new Array(),
            
            setParams: function (params) {
                // console.log("init",params);
                service.shots=[];
                service.params['page']=1;
                for(var key in params){
                    service.params[key]=params[key];
                }
                // console.log(service.params)
            },
            getShots: function () {
                if (service.isPending)
                    return;

                if (service.params["page"] > 4) {
                    console.log("点击加载更多");
                    if(service.isContinued);
                    else {
                        service.isPending=false;
                        service.isFinished=true;
                        return;
                    }
                    service.isContinued=false;
                    // return;
                }
                service.isPending = true;

                var url = Base.url + '/shots';
                $http.get(url, {params: service.params}).then(function (success) {
                    var items = success.data;
                    if(items.length==0){
                        service.isEndOfShots=true;
                        service.isPending = false;
                    }
                    else{
                        angular.forEach(items, function (item) {
                            service.shots.push(item);
                        })
                        service.params['page'] += 1;
                        service.isPending = false;
                    }
                },function (error) {

                });

            },
            //获得特定shot
            getAShot: function (shotId) {
                return $http.get(Base.url + "/shots/" + shotId + Base.suffix);
            },
        }
        return service;
    }])
    .factory("CommentsService", ["Base", "$http", function (Base, $http) {
        var service = {
            getComments: function (shotId) {
                return $http.get(Base.url + '/shots/' + shotId + '/comments');
            }
        }
        return service;
    }])
    .factory("UserService", ["Base", "$http", function (Base, $http) {
        //    获取用户信息
        var service = {
            params: {
                "page": 1,
                "per_page": 12,
            },
            //is pending shot data
            isPending: false,
            //is continuing loading shots
            isContinued:false,
            isEndOfShots:false,
            shots:new Array(),
            //当前用户信息
            getMyself: function () {
                return $http.get(Base.url + "/user");
            },
            //其他用户信息
            getAUser: function (userId) {
                return $http.get(Base.url + "/users/" + userId);
            },
            getUserShots: function (userId) {
                if (service.isPending)
                    return;
                service.isPending = true;
                //当page翻页至4时开始根据用户选择按需加载,每次加载一页
                if(service.params['page']>4){
                    console.log("点击加载更多");
                    if(service.isContinued);
                    else {
                        service.isPending=false;
                        return;
                    }
                    service.isContinued=false;
                }
                var url =Base.url + "/users/" + userId + "/shots";

                $http.get(url, {params: service.params}).then(function (success) {
                    var items = success.data;
                    angular.forEach(items, function (item) {
                        service.shots.push(item);
                    })
                    service.params['page'] += 1;
                    service.isPending = false;
                },function (error) {
                    console.log("shot 加载完毕");
                });
            }
        }
        return service;
    }])
    .factory("LoadingService", [function () {
        var isLoading = true;
        return {
            isLoad: function () {
                return isLoading;
            },
            setLoad: function (flag) {
                isLoading = flag;
            }
        }
    }])
    //判断已授权用户对shot的like属性
    .factory("LikedService", ["Base", "$http", "$q", function (Base, $http, $q) {
        // likesList (Array)
        var service = {
            likesList: [],
            init: function () {
                return service.getLikeShots();
            },
            getLikeShots: function () {
                var deferred = $q.defer();
                $http.get(Base.url + "/user/likes" + Base.suffix).then(function (success) {
                    deferred.resolve(success);
                }, function (error) {
                    deferred.reject(error);
                })
                return deferred.promise;
            },
            addLikeShot: function (shotId) {
                service.likesList.push(shotId);
                // console.log(service.likesList)
                return $http.post(Base.url + "/shots/" + shotId + "/like", null);
            },
            removeLikeShot: function (shotId) {
                var index = service.likesList.indexOf(shotId);
                service.likesList.splice(index, 1);
                // console.log(service.likesList);
                return $http.delete(Base.url + "/shots/" + shotId + "/like");
            },
            isLikeShot: function (shotId) {
                if (service.likesList.indexOf(shotId) != -1) {
                    return true;
                }
                else
                    return false;
            },
            toggleLike: function (shot) {
                if (service.isLikeShot(shot.id)) {
                    service.removeLikeShot(shot.id);
                    shot["likes_count"] -= 1;
                    console.log('unlike');
                }
                else {
                    service.addLikeShot(shot.id);
                    shot["likes_count"] += 1;
                    console.log('like');
                }
            },
            isUserLike: function (shotId) {
                return $http.get(Base.url + "/shots/" + shotId + "/like" + Base.suffix)
            },

        }
        return service;
    }])
    .factory("FormatService", [function () {
        return {
            formatTime: function (past) {
                //获取当前时间
                var curDate = new Date();
                var pastDate = new Date(past);

                var diffSeconds = curDate - pastDate;
                //相差天数
                var day = Math.floor(diffSeconds / (24 * 3600 * 1000));
                //相差小时数
                var hour = Math.floor(diffSeconds / (3600 * 1000));

                var minute = Math.floor(diffSeconds / (60 * 1000));
                if (day > 0) {
                    return pastDate.toDateString();
                } else if (hour > 0) {
                    return "about " + hour + " hours ago";
                } else if (minute > 0) {
                    return minute + " minute ago";
                }
                else {
                    return "1 minutes ago";
                }
            }
        }
    }])



