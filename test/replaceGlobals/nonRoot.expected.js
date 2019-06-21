(function(bli, bla) {
	sap.ui.define(["jQuery.sap.global"], function() {
		jQuery.sap.encodeXML("<xml></xml>");
	});

	if (bli) {
		sap.ui.define(["jQuery.sap.global"], function() {
			jQuery.sap.encodeXML("<val></val>");
		});
	}
})(0, 1);