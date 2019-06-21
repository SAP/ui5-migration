// ${copyright}
/**
 * @fileOverview The <code>actions</code> contract.
 *               since 1.32 the <code>types</code> contract.
 */
sap.ui.define(["sap/ui2/srvc/chip", "sap/ui/thirdparty/jquery"], function(chip, jQuery) {
  "use strict";
  /*global jQuery, sap */

  // Note: jQuery might not yet be available!
  if (typeof jQuery === "function" && jQuery.sap) {
    // TODO: migration not possible. jQuery.sap.declare is deprecated. Use <code>sap.ui.define</code> instead.
    jQuery.sap.declare("sap.ui2.srvc.contracts.actions");
  }
  return 47;


});