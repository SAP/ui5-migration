/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
	function() {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function(value) {
		 return function() {
		  return value;
		 };
		}(new Item({}));

		A.y = function(value) {
		 return function() {
		  return value;
		 };
		}(false);

		A.z = function(value) {
		 return function() {
		  return value;
		 };
		}(A.x);

		A.xxx = function(value) {
		 return function() {
		  return value;
		 };
		}(this.x);

		return A;
	}, /* bExport= */ true);