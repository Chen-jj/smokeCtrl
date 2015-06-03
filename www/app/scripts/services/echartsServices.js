angular.module("echartsServices", [])
    .factory("getBarOptions", [function() {
        return function(bp, type) {

            //---------------------初始化--------------------------------------------
            var i, len = bp.length, begin, end, beginTime = "", endTime = "", todayBP = [], xData, mpDataBegin, mpDataEnd;
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
            
            //---------------------获取当天最初与最后记录----------------------------
            for (i = len - 1; i >= 0; i--) {
                if (bp[i].date.split("T")[0] == today) {
                    todayBP.push(bp[i]);
                } else {
                    break;
                }
            }

            //----------------------获取当天最初与最后的记录数据--------------------------
            //血压
            if (type == 1) {
                if (todayBP.length == 0) {
                    begin = [0, 0, 0];
                    //-----------------------------
                    end = [0, 0, 0];
                } else if (todayBP.length == 1) {
                    begin = [];
                    begin.push(todayBP[0].dbp);
                    begin.push(todayBP[0].sbp);
                    begin.push(todayBP[0].heartRate);
                    beginTime = todayBP[0].date;
                    //-----------------------------
                    end = [0, 0, 0];
                } else if (todayBP.length > 1) {
                    begin = [], end = [];
                    begin.push(todayBP[todayBP.length - 1].dbp);
                    begin.push(todayBP[todayBP.length - 1].sbp);
                    begin.push(todayBP[todayBP.length - 1].heartRate);
                    beginTime = todayBP[todayBP.length - 1].date;
                    //-----------------------------
                    end.push(todayBP[0].dbp);
                    end.push(todayBP[0].sbp);
                    end.push(todayBP[0].heartRate);
                    endTime = todayBP[0].date;
                }

                xData = ['收缩压','舒张压','心率'];

                mpDataBegin = [
                                {value: begin[0],  xAxis: 0,  yAxis: begin[0]},
                                {value: begin[1],  xAxis: 1,  yAxis: begin[1]},
                                {value: begin[2],  xAxis: 2,  yAxis: begin[2]}
                              ]

                mpDataEnd   = [
                                {value: end[0],  xAxis: 0,  yAxis: end[0]},
                                {value: end[1],  xAxis: 1,  yAxis: end[1]},
                                {value: end[2],  xAxis: 2,  yAxis: end[2]}
                              ]
            }
            //血糖
            else if (type == 2) {
                if (todayBP.length == 0) {
                    begin = [0];
                    //-----------------------------
                    end = [0];
                } else if (todayBP.length == 1) {
                    begin = [];
                    begin.push(todayBP[0].record);
                    beginTime = todayBP[0].date;
                    //-----------------------------
                    end = [0];
                } else if (todayBP.length > 1) {
                    begin = [], end = [];
                    begin.push(todayBP[todayBP.length - 1].record);
                    beginTime = todayBP[todayBP.length - 1].date;
                    //-----------------------------
                    end.push(todayBP[0].record);
                    endTime = todayBP[0].date;
                }

                xData = ['血糖'];

                mpDataBegin = [
                                {value: begin[0],  xAxis: 0,  yAxis: begin[0]}
                              ]

                mpDataEnd   = [
                                {value: end[0],  xAxis: 0,  yAxis: end[0]}
                              ]
            }

            option = {
                //图表背景颜色：白色
                backgroundColor : "#f5f5f5",

                //图表与容器间距离
                grid: {
                  x:  15,
                  y:  50,
                  x2: 15,
                  y2: 30,
                  borderWidth: 0
                },

                //示范图例
                legend: {
                    data:['今天最早记录','今天最后记录'],
                    textStyle: {
                        fontFamily: "微软雅黑",
                        fontSize: 15
                    }
                },

                //横坐标
                xAxis : [
                    {
                        type : 'category',
                        data : xData,
                        axisLabel: {
                            textStyle: {
                                fontFamily: "微软雅黑",
                                fontSize: 16
                            }
                        }
                    }
                ],

                //纵坐标
                yAxis : [
                    {
                        type : 'value',
                        show : false
                    }
                ],

                //数据
                series : [
                    //数据1
                    {
                        name: '今天最早记录',
                        type: 'bar',
                        data: begin,
                        itemStyle: {
                            normal: {
                                color: "#4fc1e9"
                            }
                        },
                        //数据上提示
                        markPoint : {
                            data : mpDataBegin,
                            itemStyle: {
                              normal: {
                                color: "rgba(0,0,0,0)",
                                label: {
                                  textStyle: {
                                    color: "#4fc1e9",
                                    fontSize: 16
                                  }
                                }
                              }
                            }
                        }
                    },
                    //数据2
                    {
                        name: '今天最后记录',
                        type: 'bar',
                        data: end,
                        itemStyle: {
                            normal: {
                                color: "#ffcc50"
                            }
                        },
                        markPoint : {
                            data : mpDataEnd,
                            itemStyle: {
                              normal: {
                                color: "rgba(0,0,0,0)",
                                label: {
                                  textStyle: {
                                    color: "#ffcc50",
                                    fontSize: 16
                                  }
                                }
                              }
                            }
                        }
                    }
                ]
            };

            options = {
                option : option,
                beginTime : beginTime,
                endTime : endTime
            }

            return options;
        }
    }]);