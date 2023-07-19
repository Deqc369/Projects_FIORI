/*global location*/
var solicitud = "";
var fechaSol = "";//Add Marisol Ocampo 13/04/2021  variable global que guarda la fecha de solicitud
var datoS = [];//Add Marisol Ocampo 13/04/2021 array que guarda los datos del log de la solicitud seleccionada
sap.ui.define([
	"APP_BAJAS_3428/APP_BAJAS_3428/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"APP_BAJAS_3428/APP_BAJAS_3428/model/formatter"
], function(
	BaseController,
	JSONModel,
	History,
	formatter
) {
	"use strict";

	return BaseController.extend("APP_BAJAS_3428.APP_BAJAS_3428.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,

					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

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
			debugger;
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
			/*
 		 *@Autor: Marisol Ocampo
 		 *@Fecha: 13.04.2021
 		 *@Funcion: f_dialogo_serv
 		 *@Descripcion: Funcion para cargar los datos de la solcitud seleccionada segun el numero de solicitud
 		 */
  		f_dialogo_serv: function() {
			var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var modelo = this.getView().getModel("data");
			var solicitud2 = solicitud;
			var filterParameters = {
				$filter: "Nosolicitud eq '" + solicitud2 + "'"
			};
			var readmodel = this.f_read_entity(oModel, "/LogSet", filterParameters);
			datoS = readmodel;//llenado de array de solicitudes
			return readmodel;
		},
			/*
 		 *@Autor: Marisol Ocampo
 		 *@Fecha: 13.04.2021
 		 *@Funcion: f_dialogo_log
 		 *@Descripcion: Funcion para llenar elmodelo segun el numero de solicitud
 		 */
		f_dialogo_log: function(oEvent) {
		
			//Abrimos el Fragment
			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.log");
			var model = this.f_dialogo_serv();
			for (var i = 0; i < model.length; i++) {

				var hora = this.fnFormatTime(model[i].Hora.ms);
				var fecha = this.f_fecha(model[i].Fecha)
				model[i].Fecha = fecha;
				model[i].Hora = hora;
			}

			//Se instancia el nuevo modelo
			var oModel_textos = new sap.ui.model.json.JSONModel();

			var oModel_Actividad = {
				Actividad: model
			};
			oModel_textos.setData(oModel_Actividad);
			this.getView().setModel(oModel_textos);

		},
	/*
 		 *@Autor: Marisol Ocampo
 		 *@Fecha: 13.04.2021
 		 *@Funcion: f_fecha
 		 *@Descripcion: Funcion para darle formato a la fecha
 		 */
		f_fecha: function(model) {
		
			var anio = model.slice(0, -4);
			var mes = model.slice(4, -2);
			var dia = model.slice(-2);
			var Fecha = anio + "/" + mes + "/" + dia;

			return Fecha;
		},
	/*
 		 *@Autor: Marisol Ocampo
 		 *@Fecha: 13.04.2021
 		 *@Funcion: f_cerrar_add
 		 *@Descripcion: Funcion para cerrarfragment
 		 */
		f_cerrar_add: function() {
			this.closeDialog();
		},
			/*
 		 *@Autor: Marisol Ocampo
 		 *@Fecha: 13.04.2021
 		 *@Funcion: fnFormatTime
 		 *@Descripcion: Funcion para darle formato a la hora
 		 */
		fnFormatTime: function(hrs) {

			var hora, h, m, s;
			if (hrs !== 0) {
				var time = new Date(hrs);
				h = time.getUTCHours();
				if (h >= 0 && h <= 9) {
					h = "0" + h;
				}
				m = time.getUTCMinutes();
				if (m >= 0 && m <= 9) {
					m = "0" + m;
				}
				s = time.getUTCSeconds();
				if (s >= 0 && s <= 9) {
					s = "0" + s;
				}
				hora = h + ":" + m + ":" + s;

			} else {
				hora = "00:00:00";

			}
			return hora;
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			 
			var datos = sap.ui.getCore().datos;
			var Equipo = sap.ui.getCore().placa;

			var resultado = datos.find(solicitud => solicitud.Equipo === Equipo);

			var datos = {
				Placa: resultado.detalleSolicitudSet.results[0].Placa,
				Marca: resultado.detalleSolicitudSet.results[0].Marca,
				Causalrechazo: resultado.detalleSolicitudSet.results[0].Causalrechazo,
				Aprobador: resultado.detalleSolicitudSet.results[0].Aprobador,
				Estatus: resultado.detalleSolicitudSet.results[0].Estatus,
				Interlocutor: resultado.detalleSolicitudSet.results[0].Interlocutor,
				Noaviso: resultado.detalleSolicitudSet.results[0].Noaviso,
				Observaciones: resultado.detalleSolicitudSet.results[0].Observaciones,
				Subcanal: resultado.detalleSolicitudSet.results[0].Subcanal,
				Nivel:resultado.Nivel

			};
			solicitud = resultado.Nosolicitud;
			this.f_dialogo_serv();
			fechaSol = this.f_fecha(resultado.Fecha);//add Marisol Ocampo 13/04/2021 llenado de variable global
			this.getView().byId("fechaS").setText(fechaSol);//mapeo de fecha a la vista
			var oModel1 = new JSONModel(datos); // Only set data here.
			this.getView().setModel(oModel1, "detalle");
			if(datoS.length === 0){
			this.getView().byId("Hora").setText("Sin actividad");
			}else{
			datoS.reverse();//add Marisol Ocampo 13/04/2021 se ordena el arreglo de forma ascendente
			var fechaS = this.f_fecha(datoS[0].Fecha);//add Marisol Ocampo 13/04/2021 Se toma el primer dato, ya que es el mayor
			var horaS = this.fnFormatTime(datoS[0].Hora.ms);//add Marisol Ocampo 13/04/2021 formato de hora
			this.getView().byId("Hora").setText(fechaS + "--" + horaS);//add Marisol Ocampo 13/04/2021 Mapeo de fecha y hora ala vista
			}
				
			},

	});

});