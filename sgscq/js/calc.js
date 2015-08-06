/* global $ */
/* global angular */

$(function () {
    // 需要JQ做的初始化只有tooltip，其他初始化由angular完成
    $("body").tooltip({selector: "[data-toggle='tooltip']"});
    $("#releasenotesbutton").tooltip({
        "html": "true",
        "placement": "top",
        "title": $("#releasenotes").html()
    });
});

var app=angular.module("calc",[]);

// 全局controller，用于增减模块等
app.controller("calcController", ["$compile","$scope", function($compile,$scope) {
    // 在最后一个武将计算器后添加一个新的
    this.addGeneral=function() {
        var newScope = $scope.$new(true);
        var generaldiv=$compile('<section class="container"><hr><calc-general></calc-general></section>')(newScope);
        $("calc-general").last().parent().after(generaldiv);
    };
}]);

// 武将计算器的directive
app.directive("calcGeneral", function() {
    return {
        "restrict" : "E",
        "templateUrl" : "calc-general.html",
        "controller" : ["$scope", function($scope){
            var calc=this;
            
            // 初始化
            calc.init = function() {
                // 武将列表使用另一个JS读取的JSON，考虑到网速问题不做异步了
                calc.generals=generals_json;
                
                // 初始化武将数据
                calc.general = {
                "name" : "",
                "prop" : 0,
                "prop_step" : 0,
                "type" : 1,
                "level" : 200,
                "star" : 0,
                "medicine" : 0,
                "fate" : 0,
                "fates" : [],
                "reincarnate" : 0.0,
                "skill" : 0.0,
                "equip" : 2000,
                "fight" : 600,
                "gem" : 1000
                };
                
                // 载入第一个武将
                calc.generalId="0";
                calc.changeGeneral();
                
                // 监视武将等级，自动同步修改装备等级
                $scope.$watch("calc.general.level", function() {
                    calc.general.equip=calc.equip();
                });
            };
            
            // 更换当前武将为选择的将
            calc.changeGeneral = function() {
                var newGeneral=calc.generals[calc.generalId];
                calc.general.name=newGeneral.name;
                calc.general.prop=newGeneral.prop;
                calc.general.prop_step=newGeneral.step;
                calc.general.type=newGeneral.type;
                calc.general.fate=0;
                calc.general.fates=newGeneral.fate;
            };
            
            // 点击缘分按钮时，用JQ切换类，并计算激活的按钮的缘分数据总和
            calc.clickFate = function($event) {
                $($event.target).toggleClass("active").blur();
                var fateElems=$($event.target).parent().children(".active");
                var fate=0;
                fateElems.each(function(){
                    fate+=$(this).data("effect");
                });
                calc.general.fate=fate;
            };
            
            // 计算当前选择的装备的攻击
            calc.equip = function() {
                var base = parseInt(calc.quickEquip);
                // 装备等级一般是武将的1.2倍，百级以上土豪除外
                var level = Math.floor(calc.general.level * 1.2);
                switch (base) {
                    case 195:
                        return Math.floor((195+9.75*(level-1))*1.9);
                    break;
                    case 172:
                        return Math.floor((172+8.63*(level-1))*1.9);
                    break;
                    case 150:
                        return Math.floor((150+7.50*(level-1))*1.9);
                    break;
                    case 135:
                        return Math.floor((135+6.75*(level-1))*1.9);
                    break;
                    default:
                        return calc.general.equip;
                    break;
                }
            };
            
            // 选择技能/副将/装备时调用，修改对应数据
            calc.quick = function(type,value) {
                if (value != 0) {
                    calc.general[type]=value;
                }
            };
            
            // 计算武将面板属性
            calc.baseProp = function() {
                var 神突破加成=[1, 1.1, 1.2, 1.3, 1.45, 1.65];
                var 魔突破加成=[1, 1.125, 1.25, 1.4, 1.6, 2.01];
                var base=0;
                base = parseFloat(calc.general.prop);
                base += (parseFloat(calc.general.prop_step)*(parseInt(calc.general.level)-1));
                if (calc.general.grade==1) {
                    base=base*神突破加成[parseInt(calc.general.star)];
                }
                else {
                    base=base*魔突破加成[parseInt(calc.general.star)];
                }
                base += parseInt(calc.general.medicine);
                base = Math.floor(base);
                return base;
            };
            
            // 计算最终属性
            calc.prop = function() {
                var prop=0;
                var base = calc.baseProp();
                prop += base;
                prop += base * parseFloat(calc.general.fate)*0.01;
                prop += base * parseFloat(calc.general.reincarnate)*0.01;
                prop += base * parseFloat(calc.general.skill)*0.01;
                prop += parseInt(calc.general.equip);
                prop += parseInt(calc.general.fight);
                prop += parseInt(calc.general.gem);
                prop = Math.floor(prop);
                return prop;
            };
            
            calc.init();
        }],
        "controllerAs" : "calc"
    };
});
