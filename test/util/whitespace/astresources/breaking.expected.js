// ${copyright}
/**
 * @fileOverview QUnit integration 'feature' test for client side target resolution.
 *
 * This is a 'feature' integration test, it must declare one module
 * via <code>sap.ushell_abap.test.featureTest.module</code>.
 *
 * The test checks that target resolution of SAPUI5 applications happens in client side.
 *
 */
sap.ui.define([], function () {
    "use strict";
    /* global start stop asyncTest ok strictEqual */

    sap.ushell_abap.test.featureTest.module("Client Side Resolution", "DefaultFLP.testData.json");

    function testApplicationIsResolvedClientSide (sApplicationKind) {
        var aRequests = window.performance.getEntriesByType("resource").filter(function (oEntry) {
            return /[$]batch/.test(oEntry.name);
        });

        strictEqual(aRequests.length, 0, sApplicationKind + " applications are resolved client-side");
    }

    asyncTest("check prerequisite: required target mappings are configured", function () {
        var fnGetJson = sap.ushell_abap.test.prerequisiteTester.getJson;
        var fnTestTargetMappingsPrerequisite = sap.ushell_abap.test.prerequisiteTester.testTargetMappings;

        fnGetJson("/sap/bc/ui2/start_up?so=%2A&action=%2A&sap-client=120&shellType=FLP&depth=0")
            .done(function (oJson) {
                ok(true, "Got JSON back from startup response");

                fnTestTargetMappingsPrerequisite([{
                    query: {
                        semanticObject: "Action",
                        semanticAction: "toappnavsample",
                        formFactors: {
                            desktop: true,
                            tablet: true,
                            phone: true
                        },
                        signature: {
                            additionalParameters: "allowed"
                        }
                    }
                }], oJson.targetMappings);

            })
            .fail(function (sError) {
                ok(false, "Got JSON back from startup response");
            })
            .always(function () {
                start();
            });
    });

    asyncTest("Test target is resolved client-side", function () {
        var fnNavigateAndWait = sap.ushell_abap.test.featureTest.navigateAndWait;
        var fnNavigateHomeAndWait = sap.ushell_abap.test.featureTest.navigateHomeAndWait;

        fnNavigateAndWait({
                description: "Open AppNavSample",
                navigateTo: "Action-toappnavsample",
                waitOnComponent: "sap.ushell.demo.AppNavSample"
            })
            .then(testApplicationIsResolvedClientSide.bind(null,"sapui5"))
            .then(fnNavigateHomeAndWait)
            .then(
                fnNavigateAndWait.bind(null, {
                    description: "Open product details",
                    navigateTo: "Action-toWdaProductDetails?productId=HT-1010&sap-ushell-navmode=inplace",
                    waitOnApplicationType: "NWBC"
                }))
            .then(testApplicationIsResolvedClientSide.bind(null,"non-sapui5"));
    });
});