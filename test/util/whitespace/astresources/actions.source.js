// ${copyright}
/**
 * @fileOverview The <code>actions</code> contract.
 *               since 1.32 the <code>types</code> contract.
 */
(function () {
  "use strict";
  /*global jQuery, sap */

  // Note: jQuery might not yet be available!
  if (typeof jQuery === "function" && jQuery.sap) {
    jQuery.sap.declare("sap.ui2.srvc.contracts.actions");
    jQuery.sap.declare("sap.ui2.srvc.contracts.types");
    jQuery.sap.require("sap.ui2.srvc.chip");
  }
  return 47;


}());
