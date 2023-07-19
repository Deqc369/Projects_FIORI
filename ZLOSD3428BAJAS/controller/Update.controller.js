/*global location*/
var solicitud = "";
var equipo ="";
var fechaSol = "";//Add Marisol Ocampo 13/04/2021  variable global que guarda la fecha de solicitud
var datoS = [];//Add Marisol Ocampo 13/04/2021 array que guarda los datos del log de la solicitud seleccionada
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"APP_BAJAS_3428/APP_BAJAS_3428/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"APP_BAJAS_3428/APP_BAJAS_3428/model/formatter"
], function(Controller, BaseController, JSONModel, History, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("APP_BAJAS_3428.APP_BAJAS_3428.controller.Update", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		//add Marisol Ocampo 29/06/2021 se guarda el nivel del equipo seleccionado
		onInit: function() {
		
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,

					delay: 0
				});

			this.getRouter().getRoute("update").attachPatternMatched(this._onObjectMatched2, this);
		
		},
		
			/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
		
		diagnosticos:function() {
		 
			var tipoUsuario = "";
		    var	tipoSolicitud = "";
			var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var readModel = this.f_read_entity(oModel, "/diagnosticosSet");
		    var readModel_aux = [];

			var oModel_Diagnosticos = new JSONModel();
		
			for (var a = 0; a < readModel.length; a++) {
				readModel_aux.push(readModel[a]);
			}
			
			 for(var a = 0; a < readModel.length; a++ ){
				
			tipoSolicitud = readModel[a].Diagnostico;
			
			for (var u = 0; u < sap.ui.getCore().statusN.datos.permisosSet.results.length; u++) {
				
			tipoUsuario = sap.ui.getCore().statusN.datos.permisosSet.results[u].TipoSol; //tipo al que tiene permiso el usuario (Sigma / perdida)
			tipoUsuario = tipoUsuario.toUpperCase();
			
				if (tipoSolicitud.indexOf(tipoUsuario) == 0) {
				readModel_aux.push(readModel[a]);
				break;
							
			      	}
		        }
		      }
			oModel_Diagnosticos.setData(readModel_aux );
			this.getView().setModel(oModel_Diagnosticos, "diagnosticos");

		},

			/*
 		 *@Autor: Marisol Ocampo
 	
			/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched2: function(oEvent) {
		
			var datos = sap.ui.getCore().datos;
			var Equipo = sap.ui.getCore().placa;

			var resultado = datos.find(solicitud => solicitud.Equipo === Equipo);
			equipo  =  resultado.Equipo;
			var datosM = {
				Placa: resultado.detalleSolicitudSet.results[0].Equipo,
				Aprobador: resultado.detalleSolicitudSet.results[0].Aprobador,
				Interlocutor: resultado.detalleSolicitudSet.results[0].Interlocutor,
				Noaviso: resultado.detalleSolicitudSet.results[0].Noaviso,
				Diagnostico: resultado.Diagnostico,
			};
				var Diagnostico= resultado.Diagnostico;
			   this.getView().byId("txtPlacam").setValue(datosM.Placa);//mapeo de fecha a la vista
			   this.getView().byId("txtaviso").setValue(datosM.Noaviso);
			   this.getView().byId("txtdiagnostico").setValue(datosM.Diagnostico);
			   this.getView().byId("txtinterlocutor").setValue(datosM.Interlocutor);
			   this.getView().byId("txtaprobador").setValue(datosM.Aprobador);
			   this.diagnosticos();
			 },
			
			mapeo: function(){
			var diagn = this.byId("genre").getSelectedItem().getKey();
			this.getView().byId("txtdiagnostico").setValue(diagn);
			},
			
			actualizar: function() {
		
			var actualizar = ({
				Operacion: "9",
				Diagnostico: "",
				Noaviso: "",
				Interlocutor: "",
				Aprobador: "",
				cabeceraSolicitudSet: []
			});
			  
			   var Placa = this.getView().byId("txtPlacam").getValue();//mapeo de fecha a la vista
			   actualizar.Noaviso = this.getView().byId("txtaviso").getValue();
			   actualizar.Diagnostico = this.getView().byId("txtdiagnostico").getValue();
			   actualizar.Interlocutor = this.getView().byId("txtinterlocutor").getValue();
			   actualizar.Aprobador = this.getView().byId("txtaprobador").getValue();
			   var datos = {};
			   datos['Placa'] = Placa;
			   actualizar.cabeceraSolicitudSet.push(datos);
			 
			var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

			Model.setHeaders({
				"content-type": "application/json;charset=utf-8"
			});

			var res = this.fnCreateEntity(Model, "/crearSolicitudSet", actualizar);
				MessageBox.success("Solicitud modificada con exito");
			this.onInit();
		}
	});

});