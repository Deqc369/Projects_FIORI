sap.ui.define([
		"APP_BAJAS_3428/APP_BAJAS_3428/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("APP_BAJAS_3428.APP_BAJAS_3428.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);