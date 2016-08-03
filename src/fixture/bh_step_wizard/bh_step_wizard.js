var $scope = $("#bhStepWizard");
var $control = $("#control", $scope);
var $result = $("mark", $scope);

$control.bhStepWizard({
    items: [//必填, 步骤参数集合 可以有title,stepId,active,finished字段
        { stepId: "step1", title: "步骤向导-1" },
        { stepId: "step2", title: "步骤向导-2" },
        { stepId: "step3", title: "步骤向导-3" },
        { stepId: "step4", title: "步骤向导-4" },
        { stepId: "step5", title: "步骤向导-5" },
        { stepId: "step6", title: "步骤向导-6" }
    ],
    active: "step3",//可选, 当前激活项的stepId
    contentContainer: $(".container", $scope),//可选, 正文的容器选择器,默认值为$("body")
    finished: ['step2'], //可选, 当前已完成项的stepId数组,默认值为[]
    isAddClickEvent: true, //可选, 步骤条是否可点,默认值为true
    change: function () { } //可选, 焦点项变化的回调,默认值为null
});

$scope.on('click', '[data-action]', function (e) {
    var $target = $(e.target);
    $result.text("");
    var stepid = $control.bhStepWizard("getActiveItem");
    var action = $target.attr("data-action");
    switch (action) {
        case "isLastStep":
            var isLastStep = $control.bhStepWizard("isLastStep");
            $result.text(isLastStep);
            break;
        case "changeToActive":
            $control.bhStepWizard("changeToActive", "step1");
            break;
        case "changeToFinished":
            $control.bhStepWizard("changeToFinished", stepid);
            break;
        case "getStepIdByIndex":
            $result.text($control.bhStepWizard("getStepIdByIndex", 1));
            break;
        case "getFinishedIndexs":
            $result.text($control.bhStepWizard("getFinishedIndexs"));
            break;
        case "resetFinishedItems":
            $control.bhStepWizard("resetFinishedItems", [stepid]);
            break;
        case "deleteItem":
            $control.bhStepWizard("deleteItem", stepid);
            break;
        case "showItem":
            $control.bhStepWizard("showItem", stepid);
            break;
        case "hideItem":
            $control.bhStepWizard("hideItem", stepid);
            break;
        default:
            $control.bhStepWizard(action);
            break;
    }
});