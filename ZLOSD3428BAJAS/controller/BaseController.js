sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/library"
], function(Controller, UIComponent, JSONModel, mobileLibrary) {
	"use strict";
	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("APP_BAJAS_3428.APP_BAJAS_3428.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return UIComponent.getRouterFor(this);

		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
		 
			return this.getView().setModel(oModel, sName);
		},

		f_cerrarFragment: function() {
			var oPersonalizationDialog = this._getDialog("com.nutresa.bajas.ZLOSD3428BAJAS.view.fragment.nivel");

			if (this.oPersonalizationDialog) {
				this.oPersonalizationDialog.close();
				this.oPersonalizationDialog.destroy(true);
				this.oPersonalizationDialog = undefined;
			}
		},

		fnCreateEntity: function(pModelo, pEntidad, pDatoEndidad) {

			var vMensaje = null;
			var oMensaje = {};

			var fnSucess = function(data, response) {

				oMensaje.tipo = "S";
				oMensaje.datos = data;
			};
			var fnError = function(e) {
				if (e.response) {
					vMensaje = JSON.parse(e.response.body);
					vMensaje = vMensaje.error.message.value;

					oMensaje.tipo = "E";
					oMensaje.msjs = vMensaje;
				} else {
					oMensaje = "Offline";
				}

			};

			pModelo.create(pEntidad, pDatoEndidad, null, fnSucess, fnError, false);

			return oMensaje;
		},

		createFragment: function(url) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(url, this);
			}
			this.getView().addDependent(this._oDialog);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		_getDialog: function(p_ruta) {
			if (this.oPersonalizationDialog) {
				return this.oPersonalizationDialog;
			}
			this.oPersonalizationDialog = sap.ui.xmlfragment(p_ruta, this);
			this.getView().addDependent(this.oPersonalizationDialog);
			return this.oPersonalizationDialog;
		},

		closeDialog: function() {
			//	this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;

		},

		f_adjuntar: function(oEvent) {
 
			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.addfile");

			var oModel_file = {
				Files: ""
			};
			var oModeAdj = new JSONModel();
			oModeAdj.setData(oModel_file);

			this.getView().setModel(oModeAdj);
 
			sap.ui.getCore().Nplca = oEvent.oSource.mProperties.title;
		},

		f_read_entity: function(p_modelo, p_entidad, p_filters) {
			var mensaje;

			var fnSuccess = function(data, response) {
				mensaje = data.results; //data.Texto;
			};
			var fnError = function(e) {
				mensaje = JSON.parse(e.response.body);
				mensaje = mensaje.error.message.value;
				mensaje = "error" + "-" + mensaje;
			};

			p_modelo.read(p_entidad, null, p_filters, false, fnSuccess, fnError);

			return mensaje;
		},

		f_obtiene_Datos_F: function(data, evt) {

			var co;
			var title, txtData;
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				if (data === "txtNivel") {
					txtData = sap.ui.getCore().getElementById(data);
					title = oSelectedItem.getTitle();
					title = title;
					co = oSelectedItem.getDescription();
					sap.ui.getCore().getElementById(data).setValue(co);
					return title;
				} else if (data === "txtCausal") {
					txtData = sap.ui.getCore().getElementById(data);
					title = oSelectedItem.getTitle();
					title = title;
					co = oSelectedItem.getDescription();
					sap.ui.getCore().getElementById(data).setValue(co);
					return co;
				}
			}
			evt.getSource().getBinding("items").filter([]);

		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function() {
			var aHistoryEntries = [];

			return function(oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function(oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function(oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()
	});

});