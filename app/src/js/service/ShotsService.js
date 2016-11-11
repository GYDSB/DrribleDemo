/**
 * Created by guoyang on 2016/11/6.
 */
//用于获取Drrible中shots信息
angular.module("myApp")
    .factory("ShotsService", ["$http", function ($http) {
        return {
            //获得默认格式的shots
            getShots: function () {
                return $http.get("https://api.dribbble.com/v1/shots");
            },
            //获得特定shot
            getAShot: function (shotId) {
                return $http.get("https://api.dribbble.com/v1/shots/" + shotId)
            }
        }
    }])
    .factory("UserService", ["$http", function ($http) {
        //    获取用户信息
        return {
            //当前用户信息
            getMyself: function () {
                return $http.get("https://api.dribbble.com/v1/user");
            },
            //其他用户信息
            getAUser: function (userId) {
                return $http.get("https://api.dribbble.com/v1/users/" + userId);
            }
        }
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
    .factory("LikedService", ["$http", function ($http) {
        return {
            likeShots:new Array(),
            isLike: function (shotId) {
                return $http.get("https://api.dribbble.com/v1/shots/" + shotId + "/like");
            },
            like_AShot: function (shotId) {
                return $http.post("https://api.dribbble.com/v1/shots/"+shotId+"/like",null);
            },
            unlike_AShot:function (shotId) {
                return $http.delete("https://api.dribbble.com/v1/shots/"+shotId+"/like");
            },
            list_likes:function () {
                return $http.get("https://api.dribbble.com/v1/user/likes");
            }
        }
    }])
    .factory("FormatService", [function () {
        return {
            formatTime:function (past) {
                //获取当前时间
                var curDate=new Date();
                var pastDate=new Date(past.toString());

                var diffSeconds=curDate-pastDate;
                //相差天数
                var day=Math.floor(diffSeconds/(24*3600*1000));
                //相差小时数
                var hour=Math.floor(diffSeconds/(3600*1000));

                var minute=Math.floor(diffSeconds/(60*1000));
                if (day>=0){
                    return pastDate.toDateString();
                }else if(hour>=0){
                    return "about "+hour+" hours ago";
                }else if(minute>=0){
                    return "about "+minute+" minute ago";
                }
                else {
                    return "1 minutes ago";
                }
            }

        }
    }])



