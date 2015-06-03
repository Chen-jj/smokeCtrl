angular.module("dateServices", [])
	.factory("rootTime", [function() {
		return function(time) {
		    //返回值
		    var targetTime = "";
		    //获取本天时间
		    var myDate = new Date();
		    /*
		     *example:2015/3/15 下午8:15:50 => ["2015", "3", "15"]
		     **/
		    var rawtoday = myDate.toLocaleString().split(" ")[0].split("/");
		    if (rawtoday[1].length == 1) {
		        rawtoday[1] = "0" + rawtoday[1];
		    }
		    if (rawtoday[2].length == 1) {
		        rawtoday[2] = "0" + rawtoday[2];
		    }
		    var today = rawtoday.join("-");

		    var date = time.split("T");
		    var pastDay = date[0];
		    var pastTime = date[1].substr(0, 5);

		    //非本天则显示日期，是本天则隐藏日期
		    if (pastDay == today) {
		        targetTime = pastTime;
		    } else {
		        var temp = pastDay.split("-");
		        targetTime = temp[0] + "年" + temp[1] + "月" + temp[2] + "日 " + pastTime;
		    }

		    return targetTime;
		}
	}]);