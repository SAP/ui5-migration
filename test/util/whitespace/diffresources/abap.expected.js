sap.ui.require([
    "sap/ushell_abap/bootstrap/evo/abap.load.launchpad",
    "sap/ushell/services/Container"
, "sap/ui/thirdparty/jquery"], function (fnLoadLaunchpad, oContainer, jQuery) {
    /* global QUnit sinon jQuery start*/
    "use strict";

    var oAddContractStub;

    var fnRequireSpy = sinon.stub(sap.ui, "require"),
        fnGetUriParameters = sinon.stub(jQuery.sap, "getUriParameters").returns({

        });
});
