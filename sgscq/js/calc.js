/* global $,angular,generals_json */

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
            var calcGeneral=this;
            
            // 初始化
            calcGeneral.init = function() {
                // 武将列表使用另一个JS读取的JSON，考虑到网速问题不做异步了
                calcGeneral.generals=generals_json;
                
                // 初始化武将数据
                calcGeneral.general = {
                "name" : "",
                "prop" : 0,
                "prop_step" : 0,
                "type" : 1,
                "level" : 300,
                "star" : 0,
                "medicine" : 0,
                "fate" : 0,
                "fates" : [],
                "reincarnate" : 0.0,
                "skill" : 0.0,
                "equip" : 5000,
                "fight" : 900,
                "gem" : 2000
                };
                
                // 载入第一个武将
                calcGeneral.generalId="0";
                calcGeneral.changeGeneral();
                
                // 监视武将等级，自动同步修改装备等级
                $scope.$watch("calcGeneral.general.level", function() {
                    calcGeneral.general.equip=calcGeneral.equip();
                });
            };
            
            // 更换当前武将为选择的将
            calcGeneral.changeGeneral = function() {
                var newGeneral=calcGeneral.generals[calcGeneral.generalId];
                calcGeneral.general.name=newGeneral.name;
                calcGeneral.general.prop=newGeneral.prop;
                calcGeneral.general.prop_step=newGeneral.step;
                calcGeneral.general.type=newGeneral.type;
                calcGeneral.general.grade=newGeneral.grade;
                calcGeneral.general.fate=0;
                calcGeneral.general.fates=newGeneral.fate;
            };
            
            // 点击缘分按钮时，用JQ切换类，并计算激活的按钮的缘分数据总和
            calcGeneral.clickFate = function($event) {
                $($event.target).toggleClass("active").blur();
                var fateElems=$($event.target).parent().children(".active");
                var fate=0;
                fateElems.each(function(){
                    fate+=$(this).data("effect");
                });
                calcGeneral.general.fate=fate;
            };
            
            // 计算当前选择的装备的攻击
            calcGeneral.equip = function() {
                var base = parseInt(calcGeneral.quickEquip);
                // 装备等级一般是武将的1.2倍，百级以上土豪除外
                var level = Math.floor(calcGeneral.general.level * 1.2);
                switch (base) {
                    case 195:
                        return Math.floor((195+9.75*(level-1))*1.9);
                    break;
                    case 172:
                        return Math.floor((172+8.63*(level-1))*1.9);
                    break;
                    case 168:
                        return Math.floor((168+8.69*(level-1))*1.9);
                    break;
                    case 150:
                        return Math.floor((150+7.50*(level-1))*1.8);
                    break;
                    case 135:
                        return Math.floor((135+6.75*(level-1))*1.7);
                    break;
                    default:
                        return calcGeneral.general.equip;
                    break;
                }
            };
            
            // 选择技能/副将/装备时调用，修改对应数据
            calcGeneral.quick = function(type,value) {
                if (value != 0) {
                    calcGeneral.general[type]=parseFloat(value);
                }
            };
            
            // 计算武将面板属性
            calcGeneral.baseProp = function() {
                var 神突破加成=[1, 1.1, 1.2, 1.3, 1.45, 1.65];
                var 魔突破加成=[1, 1.125, 1.25, 1.4, 1.6, 2.01];
                var grade=parseInt(calcGeneral.general.grade);
                var star=parseInt(calcGeneral.general.star);
                var base=0;
                base = parseFloat(calcGeneral.general.prop);
                base += (parseFloat(calcGeneral.general.prop_step)*(parseInt(calcGeneral.general.level)-1));
                if (grade==1) {
                    base=base*神突破加成[star];
                }
                else if (grade==5) {
                    base=base*魔突破加成[star];
                }
                base += parseInt(calcGeneral.general.medicine);
                base = Math.floor(base);
                return base;
            };
            
            // 计算最终属性
            calcGeneral.prop = function() {
                var prop=0;
                var base = calcGeneral.baseProp();
                prop += base;
                prop += base * parseFloat(calcGeneral.general.fate)*0.01;
                prop += base * parseFloat(calcGeneral.general.reincarnate)*0.01;
                prop += base * parseFloat(calcGeneral.general.skill)*0.01;
                prop += parseInt(calcGeneral.general.equip);
                prop += parseInt(calcGeneral.general.fight);
                prop += parseInt(calcGeneral.general.gem);
                prop = Math.floor(prop);
                return prop;
            };
            
            calcGeneral.init();
        }],
        "controllerAs" : "calcGeneral"
    };
});

// 等级计算器的directive
app.directive("calcLevel", function() {
    return {
        "restrict" : "E",
        "templateUrl" : "calc-level.html",
        "controller" : ["$scope", function($scope){
            var calcLevel=this;
            
            // 初始化
            calcLevel.init = function() {
                // 武将列表使用另一个JS读取的JSON，考虑到网速问题不做异步了
                calcLevel.generalNames=generals_json;
                calcLevel.generalExps=generals_exps;
                calcLevel.generals=[];
                
                // 等级与经验互相换算
                calcLevel.level2exp=function(level,type) {
                    return calcLevel.generalExps[type][level-1] || 0;
                }
                // 由高到低
                calcLevel.exp2level=function(exp,type) {
                    var exps=calcLevel.generalExps[type];
                    for (var i=exps.length; i>=0; i--) {
                        if (exps[i] <= exp) {
                            return i+1;
                        }
                    }
                    return 0;
                }
                
                // 随机添加武将
                calcLevel.addGeneral=function() {
                    var id = Math.floor(Math.random()*calcLevel.generalNames.length);
                    var general={
                        "id" : id+"", // 为兼容select，必须用文本
                        "name" : "",
                        "level" : 200, // 等级从1开始
                        "type" : "shangshen_exp",
                        "exp" : 0,
                        "enabled" : true,
                        // 改变武将时计算经验
                        "changeGeneral" : function() {
                            this.name=calcLevel.generalNames[this.id].name;
                            this.type=calcLevel.generalNames[this.id].upgrade;
                            // 更换主将时根据经验换算等级
                            if (this.isMain) {
                                this.level=calcLevel.exp2level(this.exp,this.type)
                            }
                            this.changeLevel();
                        },
                        // 改变等级时计算经验
                        "changeLevel" : function() {
                            this.exp=calcLevel.level2exp(this.level,this.type);
                        }
                    };
                    general.changeGeneral();
                    calcLevel.generals.push(general);
                }
                
                // 添加2个武将
                for (var i=0; i<2; i++) {
                    calcLevel.addGeneral();
                }
                
                // 设置第一个为主将
                calcLevel.generals[0].isMain=true;
                
                // 计算总经验
                calcLevel.resultExp=function() {
                    var exp = 0;
                    for (var i=0; i<calcLevel.generals.length; i++) {
                        var general=calcLevel.generals[i];
                        if (general.enabled) {
                            exp += general.exp;
                        }
                    }
                    return exp;
                }
                // 计算总等级
                calcLevel.resultLevel=function() {
                    return calcLevel.exp2level(calcLevel.resultExp(),calcLevel.generals[0].type);
                };
            };
            
            calcLevel.init();
        }],
        "controllerAs" : "calcLevel"
    };
});