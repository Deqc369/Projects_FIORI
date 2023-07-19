/*global location jhoan git*/
var nombreimg = "";
var placaimg = "";
var InstidBImg = "";
var oModel_txt_contact;
var Nivel = "";
var nivelAd = ""; //add Marisol Ocampo 16/06/2021 almacena el nivel del equipo cuando se visualizan los adjuntos
var nivelCa = "";
var servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
var arrakey = {};
var btnaceptar = {};
var btnV = true;
var oModeAdj;
var Nplca = "";
var Cantidad = "";
var telefono = false;
var escritorio = false;
sap.ui.define([
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"APP_BAJAS_3428/APP_BAJAS_3428/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"APP_BAJAS_3428/APP_BAJAS_3428/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"APP_BAJAS_3428/APP_BAJAS_3428/lib/FileSaver",
	"APP_BAJAS_3428/APP_BAJAS_3428/lib/pdf.worker",
	"APP_BAJAS_3428/APP_BAJAS_3428/lib/pdf",
	"APP_BAJAS_3428/APP_BAJAS_3428/lib/formatos"
], function(Button, ButtonType, Text, MessageToast, MessageBox, BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment,
	Dialog,
	FileSave, Pdfworker, pdf, formatos) {
	"use strict";

	return BaseController.extend("APP_BAJAS_3428.APP_BAJAS_3428.controller.Worklist", {
		oModel_global: null,
		selectedTable: null,
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			this.getRouter().getRoute("Create").attachPatternMatched(this._onMasterMatched, this); 
			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.espere");
			this._timeout = jQuery.sap.delayedCall(100, this, function() {
				debugger
				this.colsutaInicial(this.enviarModelos);
			});

			var oFilter = this.getView().byId("objectFilter"),
				that = this;

			oFilter.addEventDelegate({
				"onAfterRendering": function(oEvent) {
					var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
					var oButton = oEvent.srcControl._oSearchButton;
					oButton.setText(oResourceBundle.getText("Buscar"));
				}
			});
		},
		
		_onMasterMatched: function () {
			// this.getView().byId("notificar").setEnabled(false);
			console.log("funciona!!!");
		},
		
		enviarModelos: function(res, that) {
			 
			var dispositivo = sap.ui.Device.system.phone;
			if (dispositivo !== true) {
				escritorio = true;
				telefono = false;
			} else {
				escritorio = false;
				telefono = true;
			}

			if (res == "Offline") {
				MessageBox.error("No hay respuesta del servidor");
				that.closeDialog();
				return;
			}
			 
			if (res.datos.Equipo !== "") {
				var Snivel = {};
				if (res.datos.cabeceraSolicitudSet === null) {
					Cantidad = 0;
					var datos = {
						Ncantidad: Cantidad,
					};
				} else {

					Cantidad = res.datos.cabeceraSolicitudSet.results.length;

					var datos = {
						Ncantidad: Cantidad,
					};

				}

				Snivel = res.datos.statusnivelSet.results;
				var oModel1 = new JSONModel(datos); // Only set data here.
				that.getView().setModel(oModel1, "Ncantidad");

				var mostrar = true;
				var btnC = false;
				var btnM = false; //add Marisol Ocampo 24/06/2021
				var btnMtobajas = false;

				//validar si el usuario es pertenece al ultimo nivel
				var lc_niveles = res.datos.statusnivelSet.results.length;
				var ultimo_nivel = res.datos.statusnivelSet.results[lc_niveles - 1].Nivel;
				//validar segun los niveles del usuario que botones puede visualizar

				for (var a = 0; a < res.datos.permisosSet.results.length; a++) {

					if (res.datos.permisosSet.results[a].Nivel == '0001') {
						mostrar = false; //boton Rechazar
						btnC = true; //Crear solicitud
						btnM = true; //add Marisol Ocampo 24/06/2021
					} else if (res.datos.permisosSet.results[a].Nivel == ultimo_nivel) {
						mostrar = true; //boton Rechazar
						btnMtobajas = true; //boton solo visible en el ultimo nivel movimiento de bajas

					} else if (res.datos.permisosSet.results[a].Nivel != '0001') {
						mostrar = true; //boton Rechazar
					}
				}

				 
				that.Nivel = res.datos.Equipo;
				var datos = {
					name: res.datos.Aprobador,
					nivel: that.Nivel,
					visible: mostrar,
					btncrear: btnC,
					btnModificar: btnM, //add Marisol Ocampo 24/06/2021
					mtobajas: btnMtobajas,
					telefono: telefono,
					escritorio: escritorio
				};
				var oModel1 = new JSONModel(datos); // Only set data here.
				that.getView().setModel(oModel1, "data");
			} else {
				var datos = {
					name: "",
					nivel: "",
					visible: false,
					btnModificar: false, //add Marisol Ocampo 24/06/2021
					btncrear: false,
					mtobajas: false,
					telefono: telefono,
					escritorio: escritorio
				};
				var oModel1 = new JSONModel(datos); // Only set data here.
				that.getView().setModel(oModel1, "data");

				// MessageToast.show("Este usuario no esta asignado a ningun nivel en la tabla de parametrización");Marisol Ocampo
				MessageBox.information("Este usuario no esta asignado a ningun nivel en la tabla de parametrización");
			}

			if (res.tipo === "E") {
				Dialog.close();
				alert('error');
			} else {
				 
				if (res.datos.cabeceraSolicitudSet !== null) {
					var datos = res.datos.cabeceraSolicitudSet.results;
					for (var a = 0; a < datos.length; a++) {
						var solcitud = Number(datos[a].Nosolicitud);
						res.datos.cabeceraSolicitudSet.results[a].Nosolicitud = solcitud;
					}
				}
				that.oModel_global = new JSONModel(res.datos); // Only set data here.

				var oModel_textos = new sap.ui.model.json.JSONModel();

				if (res.datos.cabeceraSolicitudSet == null) {
					oModel_textos.setData({
						list_bajas: null
					});

				} else {
					oModel_textos.setData({
						list_bajas: res.datos.cabeceraSolicitudSet.results
					});

				}
				 
				var oModelMNA = new JSONModel();

				try {
					 
						// for (var b = 0; b < res.datos.cabeceraSolicitudSet.results.length; b++) {
						// var p = res.datos.cabeceraSolicitudSet.results[b];
						// p.Aktiv = "";
						// res.datos.cabeceraSolicitudSet.results[0]= p;
						// //modelo.oData[b].Aktiv = res[a].Aktiv;
						// }
					oModelMNA.setData(res.datos.cabeceraSolicitudSet.results);
					that.getView().setModel(oModelMNA, "oModelMNA");
					that.closeDialog();
debugger
					that.ayudasBusqueda(res);

				} catch (error) {
					debugger
					that.ayudasBusqueda(res);
					 
					that.getView().setModel(oModelMNA, "oModelMNA");
					that.closeDialog();
				}

			}

		},
		fnverimgen: function(oEvent) {
			var phone = sap.ui.Device.system.phone;
			if (phone !== true) {
				var path = $.sap.getModulePath("APP_BAJAS_3428.APP_BAJAS_3428", "/images/Cremhelado2019.png");
			}
			oEvent.getSource().setProperty("src", path);

		},
		fnverimgen1: function(oEvent) {
			var phone = sap.ui.Device.system.phone;
			if (phone === true) {
				var path = $.sap.getModulePath("APP_BAJAS_3428.APP_BAJAS_3428", "/images/Cremhelado.png");
			}
			oEvent.getSource().setProperty("src", path);

		},

		fn_add_adjunto: function(oEvent) {
			 
			var validar = this.getView().getModel("aceptar");

			// if (!validar.oData.valida) {
			// 	MessageBox.error("No cuenta con permisos para cargar adjuntos, Haz clic en el boton actualizar para recargar la bandeja.");
			// 	return;
			// }

			//placa = sap.ui.getCore().placa = oEvent.oSource.mAggregations.cells[0].mProperties.alt; //placa seleccionada
			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.addfile");

			this.getView().getModel("base").oData.cabeceraSolicitudSet[0].archivosAdjuntosSet = [];

			var oModel_file = {
				Files: ""
			};
			oModeAdj = new JSONModel();
			oModeAdj.setData(oModel_file);

			this.getView().setModel(oModeAdj);

			Nplca = oEvent.oSource.mProperties.alt;
		},
		pruebalecturarchivo: function(e) {
			 
			var id = [];
			id = e.mParameters.id.split("-");
			var reader = new FileReader();
			var final = id.length;
			final = final - 1;
			var num = id[final];
			var that = this;
			var posicion;
			var oFileUpload1 = this.getView().byId("fileUploader");
			oFileUpload1.setUploadUrl("prueba2.pdf");

			oFileUpload1.upload();
			var domRef1 = oFileUpload1.getFocusDomRef();
			var file = domRef1.files[0];
			if (file.size > 1472176) {
				MessageBox.error("El archivo supera el tamaño requerido " + "1.4MB");
				return;
			} else {
				var nombre = normalize(file.name);
			}
			var Evento = e;
			reader.addEventListener("load", function(Evento) {

				var fileName = nombre;
				var fileType = file.type;
				//	var content = reader.result;
				var content = Evento.currentTarget.result.replace("data:" + file.type + ";base64,", "");

				that.postFileToBackend(fileName, fileType, content, posicion);
			}, false);

			if (file) {

				reader.readAsDataURL(file);
			}
		},

		handleUploadComplete: function(oEvent) {
			 
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				var sMsg = "";
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}

				MessageToast.show(sMsg);
			}
		},

		previewFile: function(e) {
			 
			var id = [];
			id = e.mParameters.id.split("-");
			var reader = new FileReader();
			var final = id.length;
			final = final - 1;
			var num = id[final];
			var that = this;
			var posicion;
			var oFileUpload1 = sap.ui.getCore().getElementById("adjuntos");
			var domRef1 = oFileUpload1.getFocusDomRef();

			var file = domRef1.files[0];

			if (file.size > 1472176) {
				MessageBox.error("El archivo supera el tamaño requerido " + "1.4MB");
				return;

			} else {

				var nombre = normalize(file.name);
			}

			var Evento = e;
			reader.addEventListener("load", function(Evento) {

				var fileName = nombre;
				var tipo = fileName.split(".");
				if (tipo.length === 3) {
					fileName = tipo[0] + tipo[1] + "." + tipo[2];
				}
				var fileType = file.type;
				//	var content = reader.result;
				var content = Evento.currentTarget.result.replace("data:" + file.type + ";base64,", "");

				that.postFileToBackend(fileName, fileType, content, posicion);
			}, false);

			if (file) {

				reader.readAsDataURL(file);
			}
		},
		postFileToBackendAdjuntosmasivo: function(fileName, fileType, content, posicion) {
			var modelo = this.getView().getModel("base"); //Obtener modelo
			var localData = modelo.getData();
			localData.Operacion = "6"; //Operacion que llama el filtro
			localData.Equipo = Nplca
			var oneMoreEntity = {};
			oneMoreEntity['Filename'] = fileName;
			oneMoreEntity['Tipodoc'] = fileType;
			oneMoreEntity['Value'] = content; // btoa(content);

			var datos = localData.cabeceraSolicitudSet[0].archivosAdjuntosSet;
			var resultado = datos.find(solicitud => solicitud.Filename === fileName);
			if (resultado) {
				MessageBox.error("Este archivo ya fue cargado.");
			} else {
				localData.cabeceraSolicitudSet[0].archivosAdjuntosSet.push(oneMoreEntity);
				//Agregamos datos a la vist
				oModeAdj = new JSONModel();
				var oModel_file = {
					Files: localData.cabeceraSolicitudSet[0].archivosAdjuntosSet
				};
				oModeAdj.setData(oModel_file);

				this.getView().setModel(oModeAdj);
			}

		},
			postFileToBackend: function(fileName, fileType, content, posicion) {
			var modelo = this.getView().getModel("base"); //Obtener modelo
			var localData = modelo.getData();
			localData.Operacion = "6"; //Operacion que llama el filtro
			localData.Equipo = Nplca
			var oneMoreEntity = {};
			oneMoreEntity['Filename'] = fileName;
			oneMoreEntity['Tipodoc'] = fileType;
			oneMoreEntity['Value'] = content; // btoa(content);

			var datos = localData.cabeceraSolicitudSet[0].archivosAdjuntosSet;
			var resultado = datos.find(solicitud => solicitud.Filename === fileName);
			if (resultado) {
				MessageBox.error("Este archivo ya fue cargado.");
			} else {
				localData.cabeceraSolicitudSet[0].archivosAdjuntosSet.push(oneMoreEntity);
				//Agregamos datos a la vist
				oModeAdj = new JSONModel();
				var oModel_file = {
					Files: localData.cabeceraSolicitudSet[0].archivosAdjuntosSet
				};
				oModeAdj.setData(oModel_file);

				this.getView().setModel(oModeAdj);
			}

		},
		f_save_add: function() {
			 
			var modelo = this.getView().getModel("base"); //Obtener modelo
			var localData = modelo.getData();
			var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV"; //url servicio
			var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true); //model servicio
			var res = this.fnCreateEntity(Model, "/crearSolicitudSet", localData); // Consumimos el servicio
			this.closeDialog();
		},

		colsutaInicial: function(callback) {
			debugger 
			var estructura = ({
				Operacion: "2",
				Equipo: "",
				Diagnostico: "",
				Noaviso: "",
				Interlocutor: "",
				Aprobador: "",
				cabeceraSolicitudSet: [{
					Nosolicitud: "",
					//STATUS_SOL:"",
					Placa: "",
					Nivel: "",
					Fecha: "",
					Sociedad: "",
					Tiposol: "",
					Equipo: "",
					Claseequipo: "",
					Pies: "",
					Diagnostico: "",
					Ano: "",
					Responsable: "",
					Emplazamiento: "",
					Regional: "",
					Activofijo: "",
					Valorlibros: "",
					Moneda: "",
					Eqktu: "",
					Mtobaja: "",
					archivosAdjuntosSet: [],
					detalleSolicitudSet: []
				}],
				log_crecionSet: [],
				obtenerfiltroSet: [],
				statusnivelSet: [],
				permisosSet: [],

			});

			var oModel = new JSONModel(estructura);
			this.getView().setModel(oModel, "base");

			var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

			var res = this.fnCreateEntity(Model, "/crearSolicitudSet", estructura);
			if (res.datos.cabeceraSolicitudSet !== null) {
				var lista = [];
				// for (var i = 0; i < res.datos.cabeceraSolicitudSet.results.length; i++) {
				// 	if (res.datos.cabeceraSolicitudSet.results[i].StatusSol !== "F") {
				// 		lista.push(res.datos.cabeceraSolicitudSet.results[i])
				// 	}
				// 	if (res.datos.cabeceraSolicitudSet.results[i].StatusSol === "B") {
				// 		lista[i].StatusSol = "En proceso de aprobacion"
				// 	}
				// 	if (res.datos.cabeceraSolicitudSet.results[i].StatusSol === "C") {
				// 		lista[i].StatusSol = "Proceso cancelado"
				// 	}
				// 	if (res.datos.cabeceraSolicitudSet.results[i].StatusSol === "D") {
				// 		lista[i].StatusSol = "Dado de baja"
				// 	}
				// 	if (res.datos.cabeceraSolicitudSet.results[i].StatusSol === "E") {
				// 		lista[i].StatusSol = "En espera de baja"
				// 	}
				// 	if (res.datos.cabeceraSolicitudSet.results[i].StatusSol === "F") {
				// 		lista[i].StatusSol = "Aprobada"
				// 	}
				// }
				for (var i = 0; i < res.datos.cabeceraSolicitudSet.results.length; i++) {
					if (res.datos.cabeceraSolicitudSet.results[i].StatusSol !== "F" && res.datos.cabeceraSolicitudSet.results[i].StatusSol !== "E" ) {
						lista.push(res.datos.cabeceraSolicitudSet.results[i]);
					}
				}
				for (var i = 0; i < lista.length; i++) {
					if (lista[i].StatusSol === "B") {
						lista[i].StatusSol = "En proceso de aprobacion"
					}
					if (lista[i].StatusSol === "C") {
						lista[i].StatusSol = "Proceso cancelado"
					}
					if (lista[i].StatusSol === "D") {
						lista[i].StatusSol = "Dado de baja"
					}
					if (lista[i].StatusSol === "E") {
						lista[i].StatusSol = "En espera de baja"
					}
					if (lista[i].StatusSol === "F") {

						lista[i].StatusSol = "Aprobada"
					}
				}
				res.datos.cabeceraSolicitudSet.results = lista;
				debugger
				sap.ui.getCore().datos = res.datos.cabeceraSolicitudSet.results; //MArisol OCampo
			}

			//res.datos.cabeceraSolicitudSet.results = lista;
			sap.ui.getCore().statusN = res;
debugger
			var that = this;
			// res.datos.cabeceraSolicitudSet.results.length]
			callback(res, that);
		},

		fechaalta: function() {
		debugger
			var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);
			var res = this.f_read_entity(Model, "/fechaaltaSet");
			var datos = sap.ui.getCore().datos;
			var oModel_Solicitud = new JSONModel();
		 
			var oModelMNA2 = this.getView().getModel("oModelMNA");
			if (oModelMNA2 !== undefined) {
				for (var a = 0; a < res.length; a++) {
					for (var b = 0; b < oModelMNA2.oData.length; b++) {
						// var dateFormatted = this.fnFormatTime(res[a].Aktiv);
						// res[a].Aktiv = dateFormatted;
						if (res[a].Anln1 === oModelMNA2.oData[b].Activofijo) {
				
			// var date = new Date(res[a].Aktiv);
			// var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
   // 			pattern: "dd/MM/yyyy"
			// 	});
			oModelMNA2.oData[b].Aktiv  = res[a].Aktivf;
							
							
						//var dateFormatted = this.fnFormatTime(res[a].Aktiv);
						//oModelMNA2.oData[b].Aktiv = res[a].Aktiv;
						//oModelMNA2.oData[b].Aktiv = dateFormatted;
					    //res[a].Aktiv = dateFormatted;
						//var p = oModelMNA.oData[b];
						// p.Aktiv = res[a].Aktiv;
						// oModelMNA.oData[b] = p;
						// //modelo.oData[b].Aktiv = res[a].Aktiv;
						// }else{
						// 	if(oModelMNA.oData[b].Aktiv == undefined){
						// var p = oModelMNA.oData[b];
						// p.Aktiv = "";
						// oModelMNA.oData[b] = p;	
					//	}
						
						}
					}
				}
			
				// for (var a = 0; a < res.length; a++) {
				// 	if (oModelMNA.oData.length !== null) {
				// 		for (var b = 0; b < oModelMNA.oData.length; b++) {
				// 			var dateFormatted = this.fnFormatTime(res[a].Aktiv);
				// 			if (dateFormatted !== "NaN/NaN/NaN") {
				// 				res[a].Aktiv = dateFormatted;
				// 			} else {
				// 				res[a].Aktiv = '';
				// 			}
				// 			// if (modelo.oData[b].Activofijo === "") {
				// 			// 	var p = modelo.oData[b];
				// 			// 	p.Aktiv = res[a].Aktiv;
				// 			// 	modelo.oData[b] = p;
				// 			// }
				// 			// if (modelo.oData[b].Activofijo !== undefined) {
				// 			// 	if (res[a].Anln1 === modelo.oData[b].Activofijo) {
				// 			// 		var p = modelo.oData[b];
				// 			// 		p.Aktiv = res[a].Aktiv;
				// 			// 		modelo.oData[b] = p;
				// 			// 	}

				// 			//}
				// 		}
				// 	}
				// }
		 
				//	oModel_Solicitud.setData(readModel);
			
				
			
			}
				this.getView().setModel(oModelMNA2, "oModelMNA");
			this.getView().byId(("mySmartTableId")).setModel(oModelMNA2, "oModelMNA");
					var oModelMNA3 = this.getView().getModel("oModelMNA");
		},
		/*
		 *@Autor: Marisol Ocampo
		 *@Fecha: 13.04.2021
		 *@Funcion: fnFormatTime
		 *@Descripcion: Funcion para darle formato a la hora
		 */
		fnFormatTime: function(hrs) {
debugger
			var hora, h, m, s;
			if (hrs !== 0) {
				var date = new Date(hrs);
				h = date.getUTCDay();
				if (h >= 0 && h <= 9) {
					h = "0" + h;
				}
				m = date.getUTCMonth();
				if (m >= m && h <= 9) {
					m = "0" + m;
				}
				s = date.getFullYear()

				hora = h + "/" + m + "/" + s;

			} else {
				hora = "00:00:00";

			}
			return hora;
		},
		//Add Marisol Ocampo 24/03/2020

		MovBajas() {

			var aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {

				var sServiceUrl = this.getView().getModel().sServiceUrl;
				var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
				//Abrimos el Fragment
				this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.MtoBajas");
				var oLista = sap.ui.getCore().getElementById("list_Movimiento");
				//Realizamos read a la entidad

				var readmodel = this.f_read_entity(oModel, "/MovBajasSet");

				//Se instancia el nuevo modelo
				var oModel_textos = new sap.ui.model.json.JSONModel();

				//Trabajamos con el modelo
				oModel_txt_contact = {
					list_Movimiento: [{
						movBajas: readmodel[0].Mvtobajas,
						Descripcion: readmodel[0].Descripcion
					}]
				};

				oModel_textos.setData(oModel_txt_contact);

				for (var i = 0; i < readmodel.length; i++) {
					var item_datos = {
						movBajas: readmodel[i].Mvtobajas,
						Descripcion: readmodel[i].Descripcion
					};

					oModel_txt_contact.list_Movimiento.push(item_datos);
					oModel_textos.setData(oModel_txt_contact);
				}

				//Llevar los datos a la tabla
				oLista.setModel(oModel_textos);
			} else {
				MessageBox.error("No hay solicitudes seleccionadas");
			}

		},

		//fin Marisol Ocampo 24/03/2020
		ayudasBusqueda: function(res) {
			 debugger
			//Add Marisol Ocampo 22/06/2021
			var readModel_auxnivel = [];
			var oModel_Nivel = new JSONModel();
			readModel_auxnivel.push({
				Nivel: ""
			}, )
			for (var i = 0; i < res.datos.statusnivelSet.results.length; i++) {
				readModel_auxnivel.push({
					Nivel: res.datos.statusnivelSet.results[i].Nivel.replace(/^(0+)/g, '')
				}, )
			}
			oModel_Nivel.setData(readModel_auxnivel);
			this.getView().setModel(oModel_Nivel, "nivel");
			//Fin Marisol Ocampo 22/06/2021
			//Add Marisol Ocampo 22/06/2021
			// var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			// var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			// var readModel = this.f_read_entity(oModel, "/diagnosticosSet");
			var readModel_aux = [];
			var oModel_Diagnosticos = new JSONModel();
			// for (var a = 0; a < readModel.length; a++) {
			// 	readModel_aux.push(readModel[a]);
			// }
			// var tamaño = readModel.length + 1;
			// readModel_aux.push([{
			// 	Diagnostico: ""
			// }])
			readModel_aux.push({
				Diagnostico: ""
			}, )
			readModel_aux.push({
				Diagnostico: "PERDIDA"
			})
			readModel_aux.push({
					Diagnostico: "SIGMA"
				})
				//readModel_aux.reverse();
			oModel_Diagnosticos.setData(readModel_aux);
			this.getView().setModel(oModel_Diagnosticos, "diagnosticos");
			//Fin Marisol Ocampo 22/06/2021

			var oModel_Diagnosticos = new JSONModel();
			var sServiceUrl = this.getView().getModel().sServiceUrl;
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, false);
			var add = [];
			var readModel = this.f_read_entity(oModel, "/AyudaCentrodeEmplazamientoSet");
			readModel.unshift(add);
			//borrar duplicados por oficina de ventas
			var oficinas = [...new Set(readModel.map(x => x.Oficina + " " + "-" + " " + x.Bezei))];

			var arreglo = {
				list: [{
					oficina: oficinas[0]
				}]
			};

			for (var i = 1; i < oficinas.length; i++) {
				var list = {
					oficina: oficinas[i]
				};
				arreglo.list.push(list);
			}
			//add Marisol Ocampo 24/06/2021
			var centros = [...new Set(readModel.map(x => x.Emplazamiento + " " + "-" + " " + x.Name1))];

			var arregloC = {
				list: [{
					Emplazamiento: centros[0]
				}]
			};
			for (var i = 1; i < centros.length; i++) {
				var list = {
					Emplazamiento: centros[i]
				};
				arregloC.list.push(list);
			}
			arreglo.list[0] = "";
			arregloC.list[0] = "";
			var oModel_centros = new JSONModel();
			var oModel_oficinas = new JSONModel();
			oModel_centros.setData(arregloC.list);
			//fin Marisol Ocampo 24/06/2021
			oModel_oficinas.setData(arreglo.list);
			this.getView().setModel(oModel_centros, "centros");
			this.getView().setModel(oModel_oficinas, "list");
			debugger
			this.fechaalta();

		},

		obtenerfiltro: function() {
			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.espere");

			this._timeout = jQuery.sap.delayedCall(100, this, function() {

				var modelo = this.getView().getModel("base"); //Obtener modelo
				var localData = modelo.getData(); //Modelo local
				localData.Operacion = "5"; //Operacion que llama el filtro
				//Obtenemos los datos de la viems
				var emplazamientoC = (this.getView().byId("slName").getSelectedKey()).split('-'); //add Marisol Ocampo 24/06/2021
				var emplazamiento = emplazamientoC[0].trim(); //add Marisol Ocampo 24/06/2021
				var ano = this.getView().byId("ano").getValue();
				var placa = this.getView().byId("nPlaca").getValue();
				//Add Marisol Ocampo 22/06/2021 adicion del filtro placa
				var ActFijo = this.getView().byId("ActFijo").getValue();
				//var nEquipo = this.getView().byId("nEquipo").getValue(); Comentado por Marisol Ocampo 17/06/2021 Se solicita eliminar este filtro
				var OfVentasC = this.getView().byId("OfVentas").getSelectedKey().split('-'); //add Marisol Ocampo 24/06/2021
				var OfVentas = OfVentasC[0].trim(); //add Marisol Ocampo 24/06/2021
				var Status_sol = this.getView().byId("EstadoSol").getSelectedKey();
				var Diagnostico = this.getView().byId("CateCausal").getSelectedKey();
				//Fin Marisol Ocampo 22/06/2021 adicion del filtro placa
				var fecha = this.getView().byId("Fecha").getValue();
				if (this.byId("nivel").getSelectedItem() !== null) {
					var nivel = this.byId("nivel").getSelectedItem().getKey();
				}
				var filtro = {}; //Modelo para guardar la data obtenida
				 
				if (ActFijo.length === 8) {
					ActFijo = '0000' + ActFijo;
				}
				if (ActFijo.length === 9) {
					ActFijo = '000' + ActFijo;
				}
				if (ActFijo.length === 10) {
					ActFijo = '00' + ActFijo;
				}
				if (ActFijo.length === 11) {
					ActFijo = '0' + ActFijo;
				}
				if (ano != "") {
					var arrAno = ano.split('-');
					var newAno = arrAno[0].trim();
					var newAnoH = arrAno[1].trim();
				} else {
					newAno = "";
					newAnoH = "";
				}
				//Configuramos el formato de fecha de acuerdo a como lo necesita SAP
				if (fecha != "") {
					var arr = fecha.split('-');
					var arr1 = arr[0].split('/');
					var arr2 = arr[1].split('/');
					//if(arra1[1] > 10)
					var newfecha = arr1[0] + arr1[1] + arr1[2];
					var newfecha2 = arr2[0] + arr2[1] + arr2[2];
				} else {
					newfecha = "";
					newfecha2 = "";
				}
				filtro['Emplazamiento'] = emplazamiento;
				// for(var i=0; i<fechas.length;i++){

				filtro['Ano'] = newAno;
				filtro['Anoh'] = newAnoH;
				// }
				//filtro['Equipo'] = nEquipo; Comentado por Marisol Ocampo 17/06/2021 Se solicita eliminar este filtro
				filtro['Oficina'] = OfVentas;
				if (fecha != "") {
					filtro['Fecha'] = newfecha.replace(/ /g, "");
					filtro['Fechah'] = newfecha2.replace(/ /g, "");
				} else {
					filtro['Fecha'] = newfecha2;
					filtro['Fechah'] = newfecha2;
				}
				filtro['Nivel'] = nivel;
				//Add Marisol Ocampo 22/06/2021 adicion del filtro placa
				filtro['Placa'] = placa;
				filtro['Activofijo'] = ActFijo;
				filtro['StatusSol'] = Status_sol;
				filtro['Diagnostico'] = Diagnostico;
				if(filtro.Diagnostico != ""){
				filtro['Diagnostico'] = Diagnostico + '*';
				}
				//Fin Marisol Ocampo 22/06/2021 adicion del filtro placa
				if (filtro.Emplazamiento == "" && filtro.Nivel == "" && filtro.Fecha == "" && filtro.Oficina == "" && filtro.Placa == "" &&
					filtro.Activofijo == "" && filtro.StatusSol == "" && filtro.Diagnostico == "" && filtro.Fechah == "" && filtro.Ano == "" &&
					filtro.Anoh == "" ) {
					MessageBox.error("Debe seleccionar al menos un filtro.");
					this.closeDialog();
					return;
					}

				if (sap.ui.getCore().statusN.datos.permisosSet == null) {
					MessageBox.error("Este usuario no esta asignado a ningun nivel en la tabla de parametrización.");
					this.closeDialog();
					return;
				}
				/* deshabilita boton aceptar
					btnV = false;
					btnaceptar = {
						valida: btnV
					};
					var oModel_btn = new JSONModel(btnaceptar);
					this.getView().setModel(oModel_btn, "aceptar");*/

				localData.obtenerfiltroSet[0] = filtro; //Mapeamos la data al modelo
				var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV"; //url servicio
				var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true); //model servicio
				var res = this.fnCreateEntity(Model, "/crearSolicitudSet", localData); // Consumimos el servicio
				 
				var oModelMNA = new JSONModel();

				try {

					if (res.datos.cabeceraSolicitudSet == null) {
						var Cantidad = 0;
					} else {
						//var Cantidad = res.datos.cabeceraSolicitudSet.results.length;
						var Cantidad = 0;
						var lista = [];
						var result = [];
						for (var i = 0; i < res.datos.cabeceraSolicitudSet.results.length; i++) {
							if (res.datos.cabeceraSolicitudSet.results[i].StatusSol !== "F" && res.datos.cabeceraSolicitudSet.results[i].StatusSol !== "E") {
								lista.push(res.datos.cabeceraSolicitudSet.results[i]);
								Cantidad = Cantidad + 1;
							}
						}
						for (var i = 0; i < lista.length; i++) {
							if (lista[i].StatusSol === "B") {
								lista[i].StatusSol = "En proceso de aprobacion"
							}
							if (lista[i].StatusSol === "C") {
								lista[i].StatusSol = "Proceso cancelado"
							}
							if (lista[i].StatusSol === "D") {
								lista[i].StatusSol = "Dado de baja"
							}
							if (lista[i].StatusSol === "E") {
								lista[i].StatusSol = "En espera de baja"
							}
							if (lista[i].StatusSol === "F") {

								lista[i].StatusSol = "Aprobada"
							}
							lista[i].Aktiv = '';
						}
						res.datos.cabeceraSolicitudSet.results = lista;
						if(	sap.ui.getCore().statusN.datos.cabeceraSolicitudSet == null){
						 				
						oModelMNA.setData(lista);
						this.oModel_global = new JSONModel(res.datos); // Only set data here.
						}else{
						sap.ui.getCore().statusN.datos.cabeceraSolicitudSet.results = lista;
						 
						oModelMNA.setData(res.datos.cabeceraSolicitudSet.results);
						this.oModel_global = new JSONModel(res.datos); // Only set data here.
					}
					 
}
					var datos = {
						Ncantidad: Cantidad,
					};

					var oModel1 = new JSONModel(datos); // Only set data here.
					this.getView().setModel(oModel1, "Ncantidad");
					 
					this.getView().setModel(oModelMNA, "oModelMNA");
					debugger
					this.fechaalta();
				
					this.closeDialog();
				} catch (error) {
				 
					this.getView().setModel(oModelMNA, "oModelMNA");
					this.fechaalta();
					this.closeDialog();
				}

			});
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			debugger
			sap.ui.getCore().datos = this.oModel_global.oData.cabeceraSolicitudSet.results;
			sap.ui.getCore().placa = oEvent.oSource.mAggregations.cells[0].mProperties.alt; //placa seleccionada
			this.getRouter().navTo("object", {
				Placa: '12345'
			});

		},

		actualizarMtodebaja: function(mtoBaja) {
			 
			var actualizar = ({
				Operacion: "8",
				Equipo: "",
				Diagnostico: "",
				Noaviso: "",
				Interlocutor: "",
				Aprobador: "",
				cabeceraSolicitudSet: []
			});

			var aSelectedProducts = this.byId("table").getSelectedItems();
			actualizar.Diagnostico = mtoBaja;

			for (var k = 0; k < aSelectedProducts.length; k++) {

				var datos = {};
				var oProduct = aSelectedProducts[k];
				var oProductId = oProduct.mAggregations.cells[0].mProperties.alt;

				datos['Placa'] = oProductId;

				actualizar.cabeceraSolicitudSet.push(datos);
				//validar si las solicitudes pertenecen al usuario logueado
			}

			var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

			Model.setHeaders({
				"content-type": "application/json;charset=utf-8"
			});

			var res = this.fnCreateEntity(Model, "/crearSolicitudSet", actualizar);
			this.onInit();
		},

		onUnlistObjects: function(evt) {

			 
			var oModel_btn = new JSONModel(btnaceptar);
			this.getView().setModel(oModel_btn, "aceptar");

			var oparcion = evt.oSource.mProperties.type;
			var actualizar = ({
				Operacion: "3",
				Equipo: "",
				Diagnostico: "",
				Noaviso: "",
				Interlocutor: "",
				Aprobador: "",
				cabeceraSolicitudSet: []
			});

			var aSelectedProducts, i, sPath, oProduct, oProductId;
			var tipoSolicitud = "";
			var tipoUsuario = "";
			var tipoc = "";
			var contadorN = 0; //solicitudes seleccionadas de otros usuarios
			var contadoraux = 0;
			var contador = 0;
			var contadorErrores = 0;
			var mensaje = "";
			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					oProduct = aSelectedProducts[i];
					//	
					oProductId = oProduct.mAggregations.cells[0].mProperties.alt;
					//	sPath = oProduct.getBindingContext().getPath();

					var datos = {};
					var niv = aSelectedProducts[i].mAggregations.cells[14].mProperties.text; //nivel
					var cadena = "";
					var ultimoN = sap.ui.getCore().statusN.datos.statusnivelSet.results.length;
					var diferencia = 0;

					if (oparcion == "Accept") {
						actualizar.Equipo = "1";
						//	niv = parseInt(niv) + 1;
						var diagnostico = (aSelectedProducts[i].mAggregations.cells[7].mProperties.text).split("/");
					
						cadena = "" + (parseInt(niv) + 1) + "";
						datos['Placa'] = oProductId;
						datos['Nivel'] = cadena;
						datos['Diagnostico'] = aSelectedProducts[i].mAggregations.cells[7].mProperties.text;
						datos['Emplazamiento'] = aSelectedProducts[i].mAggregations.cells[16].mProperties.text;
						datos['Nosolicitud'] = aSelectedProducts[i].mAggregations.cells[2].mProperties.text;

						//validar si las solicitudes pertenecen al usuario logueado
						 
						tipoSolicitud = aSelectedProducts[i].mAggregations.cells[7].mProperties.text; //tipo de la solicitud
						var nivSoli = aSelectedProducts[i].mAggregations.cells[14].mProperties.text;
						if (nivSoli == ultimoN) {
							if (aSelectedProducts[i].mAggregations.cells[18].mProperties.text == "") {
								MessageBox.error(
									"El campo movimiento de baja es obligatorio para todas las solicitudes por favor completa he intenta de nuevo.");
								return;
							}
						}
						 
						tipoSolicitud = tipoSolicitud.toUpperCase();
						contadoraux = contador;
						for (var u = 0; u < sap.ui.getCore().statusN.datos.permisosSet.results.length; u++) {

							tipoUsuario = sap.ui.getCore().statusN.datos.permisosSet.results[u].TipoSol; //tipo al que tiene permiso el usuario (Sigma / perdida)
							tipoUsuario = tipoUsuario.toUpperCase();

							if (aSelectedProducts[i].mAggregations.cells[14].mProperties.text == sap.ui.getCore().statusN.datos.permisosSet.results[u].Nivel &&
								aSelectedProducts[i].mAggregations.cells[16].mProperties.text == sap.ui.getCore().statusN.datos.permisosSet.results[u].Regional
							) {
								if (tipoSolicitud.indexOf(tipoUsuario) == 0) {
									contador++;
									actualizar.cabeceraSolicitudSet.push(datos);
								} else {
									contadorErrores++;
								}

							}

						}

						if (contador == contadoraux) {
							contadorN++;
						}

					} else {
						actualizar.Equipo = "2";
						niv = parseInt(this.Nivel) - 1;
						cadena = "" + niv + "";
						datos['Placa'] = oProductId;
						datos['Nivel'] = cadena;
						actualizar.cabeceraSolicitudSet.push(datos);

					}
				}

				var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
				var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

				Model.setHeaders({
					"content-type": "application/json;charset=utf-8"
				});

				if (contadorN > 0) {
					MessageBox.error("Algunas solicitudes escogidas pertenecen a otro usuario por favor intenta de nuevo");
					return;
				}
				 
				var res = this.fnCreateEntity(Model, "/crearSolicitudSet", actualizar);
 
				var oModelMNA = new JSONModel();

				if (res.tipo === "E") {
					alert('error');
				} else {

					if (res.datos.cabeceraSolicitudSet == null) {
						 
						oModelMNA.setData(null);
						Cantidad = 0;
						var datos = {
							Ncantidad: Cantidad,
						};
					} else {
						 
						oModelMNA.setData(res.datos.cabeceraSolicitudSet.results);
						Cantidad = res.datos.cabeceraSolicitudSet.results.length;
						var datos = {
							Ncantidad: Cantidad,
						};

					}
					var oModel1 = new JSONModel(datos); // Only set data here.
					this.getView().setModel(oModel1, "Ncantidad");
					 
     				this.getView().setModel(oModelMNA, "oModelMNA");
					if (res.datos.Diagnostico === "1") {
						MessageBox.error("Falta configuracion del siguiente Nivel en la tabla de parametrización");
					} else if (res.datos.Diagnostico === "2") {
						MessageBox.success("Solicitud dada de baja con exito");
					} else {
						if (contadorErrores > 0 && contador == 1) {
							mensaje = "Solicitud procesada con exito " + contador;

						} else if (contadorErrores > 0 && contador > 1) {
							mensaje = "Solicitudes procesadas " + contador;
						} else {
							mensaje = "Solicitud Procesada con exito";
						}

						MessageBox.success(mensaje);

					}

				}

			} else {
				MessageBox.error("No hay solicitudes seleccionadas");
			}
		},

		f_abrirmoticocanc: function() {
			var oPersonalizationDialog = this._getDialog("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.causalCance");
			oPersonalizationDialog.open();
		},
		f_aceptar: function() {

			 
			if (arrakey.nivel == undefined || arrakey.causal == undefined) {
				MessageBox.error("Nivel y Causal son obligatorios");
				return;
			}

			var txtData = sap.ui.getCore().getElementById("Observaciones");

			var datos = this.getView().getModel("data");
			var modelo = this.getView().getModel("base");
			var Nivel = datos.oData.nivel;

			var localdata = modelo.getData();

			localdata.Operacion = "3"; //inica que se cambiara de nivel una solicitud
			localdata.Aprobador = datos.oData.name;
			localdata.Equipo = "2"; //inidica que se esta rechazando
			localdata.Interlocutor = Nivel; //se aprovecha este campo para enviar el nivel actual de usuario logueado 

			var oneMoreEntity = {};
			oneMoreEntity['Causalrechazo'] = arrakey.causal;
			oneMoreEntity['Observaciones'] = txtData._lastValue;

			localdata.cabeceraSolicitudSet[0].detalleSolicitudSet.push(oneMoreEntity);

			var aSelectedProducts, i, sPath, oProduct, oProductId;
			var contError = 0;
			var contNop = 0; //solicitudes que se intentan rechazar y son de otros niveles
			var conOkaux = 0;
			var conOK = 0;
			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {

					oProduct = aSelectedProducts[i];
					oProductId = oProduct.mAggregations.cells[0].mProperties.alt;

					var datos = {};
					var niv = "";
					var cadena = "";
					niv = arrakey.nivel;
					var nivel_actual = parseInt(aSelectedProducts[i].mAggregations.cells[14].mProperties.text);
					var nivelNuevo = parseInt(niv);

					if (nivel_actual <= nivelNuevo) {
						contError++;
					} else {
						var oneMoreEntity = {};
						oneMoreEntity['Causalrechazo'] = arrakey.causal;
						oneMoreEntity['Observaciones'] = txtData._lastValue;
						cadena = "" + niv + "";
						datos['Placa'] = oProductId;
						datos['Nivel'] = niv; //nuevo nivel para la solicitudes 
						datos['Diagnostico'] = aSelectedProducts[i].mAggregations.cells[7].mProperties.text;
						datos['Emplazamiento'] = aSelectedProducts[i].mAggregations.cells[16].mProperties.text;
						datos['Nosolicitud'] = aSelectedProducts[i].mAggregations.cells[2].mProperties.text;

						var tipoSolicitud = aSelectedProducts[i].mAggregations.cells[7].mProperties.text; //tipo de la solicitud
						var tipoUsuario = "";
						tipoSolicitud = tipoSolicitud.toUpperCase();
						conOkaux = conOK;
						for (var u = 0; u < sap.ui.getCore().statusN.datos.permisosSet.results.length; u++) {

							tipoUsuario = sap.ui.getCore().statusN.datos.permisosSet.results[u].TipoSol; //tipo al que tiene permiso el usuario (Sigma / perdida)
							tipoUsuario = tipoUsuario.toUpperCase();

							if (aSelectedProducts[i].mAggregations.cells[14].mProperties.text == sap.ui.getCore().statusN.datos.permisosSet.results[u].Nivel &&
								aSelectedProducts[i].mAggregations.cells[16].mProperties.text == sap.ui.getCore().statusN.datos.permisosSet.results[u].Regional
							) {
								if (tipoSolicitud.indexOf(tipoUsuario) == 0) {
									conOK++;
									localdata.cabeceraSolicitudSet.push(datos);

								} else {
									contError++;
								}

							}

						}

						if (conOkaux == conOK) {
							contNop++;
						}

					}

				}

				var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
				var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

				Model.setHeaders({
					"content-type": "application/json;charset=utf-8"
				});
			 
				var oModelMNA = new JSONModel();

				if (localdata.cabeceraSolicitudSet.length == 1) {
					MessageBox.error("No cuenta con permisos para rechazar estas solicitudes.");
					return;
				}

				if (contNop > 0) {
					MessageBox.error("Algunas solicitudes escogidas pertenecen a otro usuario por favor intenta de nuevo.");
					return;
				}

				var res = this.fnCreateEntity(Model, "/crearSolicitudSet", localdata);

				if (res.datos.Diagnostico === "1") {
					MessageBox.error("Falta configuracion del Nivel a rechazar en la tabla de parametrización.");
					return;
				}

				if (res.tipo === "E") {
					alert('error');
				} else {
					 
					if (res.datos.cabeceraSolicitudSet == null) {
					
						oModelMNA.setData(null);
					} else {
						 
						oModelMNA.setData(res.datos.cabeceraSolicitudSet.results);
					}
					var msj = ""
					if (contError > 0) {
						msj = "Solicitudes rechazadas " + conOK + " .";
					} else {
						msj = "Proceso exitoso"
					}

					MessageBox.success(msj);
					 
					this.getView().setModel(oModelMNA, "oModelMNA");
					this.f_cerrarFragment();

					this.onInit(); //Add Marisol Ocampo 09/03/2020
				}

			}

		},

		f_open_dialog_login: function() {
			 
			 
			 
			 

			arrakey = {};
			var permiso = false;
			var equipo = "";
			var aSelectedProducts = this.byId("table").getSelectedItems();

			for (var k = 0; k < aSelectedProducts.length; k++) {
				var datos = {};
				var oProduct = aSelectedProducts[k];
				var oProductId = oProduct.mAggregations.cells[0].mProperties.alt;
			}
			for (var u = 0; u < sap.ui.getCore().statusN.datos.cabeceraSolicitudSet.results.length; u++) {
				if (sap.ui.getCore().statusN.datos.cabeceraSolicitudSet.results[u].Equipo === oProductId) {
					equipo = sap.ui.getCore().statusN.datos.cabeceraSolicitudSet.results[u];
				}
			}
			for (var i = 0; i < sap.ui.getCore().statusN.datos.permisosSet.results.length; i++) {
				if (sap.ui.getCore().statusN.datos.permisosSet.results[i].Nivel == equipo.Nivel) {
					permiso = true;
				}
			}
			if (permiso) {
				if (this.byId("table").getSelectedItems().length) {
					var oPersonalizationDialog = this._getDialog("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.filtro");
					oPersonalizationDialog.open();
				} else {
					MessageBox.error("No hay solicitudes selecccionadas");
				}
			} else {
				MessageBox.error("Las solicitud no está asignada a su nivel, por esta razón no podrá ser liberada, ni rechazada");

			}
		},
		onApproveDialog: function() {
			 
			var that = this;
			var dialog = new Dialog({
				title: 'Confirmar',
				type: 'Message',
				content: new Text({
					text: "¿Está seguro de que desea cancelar la solicitud de baja ? "
				}),

				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'Aceptar',
					press: function() {

						dialog.close();
						that.f_cancelar();

					}
				}),
				endButton: new Button({
					text: 'Rechazar',
					press: function() {

						dialog.close();

					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		f_cancelarvali: function() {
			 
			var equipos = this.oModel_global.oData.cabeceraSolicitudSet.results; //add Marisol Ocampo 22/06/2021
			var aSelectedProducts, sPath, oProduct, oProductId, Equipo;
			aSelectedProducts = this.byId("table").getSelectedItems();
			oProduct = aSelectedProducts[0];
			Equipo = oProduct.mAggregations.cells[0].mProperties.alt;
			for (var i = 0; i <= equipos.length - 1; i++) {
				if (equipos[i].Equipo == Equipo && equipos[i].StatusSol !== 'C') {
					nivelCa = equipos[i].Nivel;
				}
			}
			if (nivelCa === "0001") {
				this.f_abrirmoticocanc();
			} else {
				MessageBox.error("La  solicitud no se encuentra en el nivel inicial o ya esta cancelada");
				this.f_cerrarFragment();
			}
		},

		f_cancelar: function() {
			 
			var txtcanc = sap.ui.getCore().getElementById("motCan").getValue(); //marisol
			if (txtcanc === "") {
				MessageBox.error("Motivo de cancelacion obligatorio");
			} else {
				var contadoraux = 0;
				var contador = 0;
				var contadorN = 0;
				var equipos = this.oModel_global.oData.cabeceraSolicitudSet.results; //add Marisol Ocampo 22/06/2021

				var aSelectedProducts, sPath, oProduct, oProductId, Equipo;
				aSelectedProducts = this.byId("table").getSelectedItems();
				oProduct = aSelectedProducts[0];
				Equipo = oProduct.mAggregations.cells[0].mProperties.alt;
				var solicitud = oProduct.mAggregations.cells[2].mProperties.text;
				var readmodel = this.f_consulta_adjuntos(Equipo);

				for (var i = 0; i <= equipos.length - 1; i++) {
					if (equipos[i].Equipo == Equipo && equipos[i].StatusSol !== 'C') {
						nivelCa = equipos[i].Nivel;
					}
				}

				if (nivelCa === "0001") {
					for (var i = 0; i < readmodel.length; i++) {
						this.f_eliminar_fileAdjuntos(readmodel[i].Placa, readmodel[i].Filename, readmodel[i].InstidB)
					}

					//Fin add Marisol Ocampo 22/06/2021
					for (var i = 0; i < aSelectedProducts.length; i++) {

						var tipoSolicitud = aSelectedProducts[i].mAggregations.cells[7].mProperties.text;
						tipoSolicitud = tipoSolicitud.toUpperCase();

						contadoraux = contador;

						for (var u = 0; u < sap.ui.getCore().statusN.datos.permisosSet.results.length; u++) {

							var tipoUsuario = sap.ui.getCore().statusN.datos.permisosSet.results[u].TipoSol; //tipo al que tiene permiso el usuario (Sigma / perdida)
							tipoUsuario = tipoUsuario.toUpperCase();

							if (aSelectedProducts[i].mAggregations.cells[14].mProperties.text == sap.ui.getCore().statusN.datos.permisosSet.results[u].Nivel &&
								aSelectedProducts[i].mAggregations.cells[16].mProperties.text == sap.ui.getCore().statusN.datos.permisosSet.results[u].Regional
							) {
								if (tipoSolicitud.indexOf(tipoUsuario) == 0) {
									contador++;
								}
							}
						}
						if (contador == contadoraux) {
							contadorN++;
						}
					}

					if (contadorN > 0) {
						MessageBox.error("Algunas solicitudes escogidas pertenecen a otro usuario por favor intenta de nuevo");
						return;
					}

					var modelo = this.getView().getModel("base"); //Obtener modelo
					var localData = modelo.getData();
					localData.Operacion = "7"; //Operacion que llama el filtro
					localData.Equipo = Equipo;
					localData.Aprobador = txtcanc;
					localData.Interlocutor = solicitud;

					var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV"; //url servicio
					var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true); //model servicio
					var res = this.fnCreateEntity(Model, "/crearSolicitudSet", localData); // Consumimos el servicio
					if (res.datos.Diagnostico !== null) {
						if (res.datos.Diagnostico === "1") {
							//	this.f_eliminar_fileAdjuntos(  Equipo, nombreimg,  InstidBImg) {
							MessageBox.success("Proceso de baja Cancelado con exito");
							this.onInit();
							this.f_cerrarFragment();
						} else {
							MessageBox.error("Error al Cancelar el Proceso");
						}
					}
				} // else {
				// 	MessageBox.error("La  solicitud no se encuentra en el nivel inicial o ya esta cancelada");
				// 	this.f_cerrarFragment();
				// }
			}
		},

		onListItemPress: function(oEvent) {
			 
			MessageToast.show("Pressed : " + oEvent.getSource().getTitle());
		},

		f_consulta_adjuntos: function(placa) {
			 
			var oModelMNA = new JSONModel();
			//var file = 'LineaTiempo.pdf'
			var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV"; //url servicio
			var oModel = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

			var filterParameters = {
				$filter: "Placa eq '" + placa + "'"
			};
			var readmodel = this.f_read_entity(oModel, "/archivosAdjuntosSet", filterParameters);

			return readmodel;

		},
		f_eliminar_file: function() {

			var placa = placaimg;
			var file = nombreimg;
			var InstidB = InstidBImg;
			 
			var oModelMNA = new JSONModel();
			var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			var filterParameters = {
				$filter: "Placa eq '" + placa + "'   and Filename eq '" + file + "' and InstidB eq '" + InstidB + "'"
			};

			var permiso = 0;
			var cont;
			for (cont = 0; cont < sap.ui.getCore().statusN.datos.permisosSet.results.length; cont++) {
				if (sap.ui.getCore().statusN.datos.permisosSet.results[cont].Nivel == '0001') {
					permiso = permiso + 1;
				}

			}

			if (permiso == 0) {
				MessageBox.error("Solo en el nivel 1 se pueden eliminar adjuntos.");
				return;
			}

			var readmodel = this.f_read_entity(oModel, "/archivosAdjuntosSet", filterParameters);

			this.closeDialog();
			//	this.f_cerrar_adjunto();

		},

		f_eliminar_fileAdjuntos: function(placaimg, nombreimg, InstidBImg) {

			var placa = placaimg;
			var file = nombreimg;
			var InstidB = InstidBImg;
			 
			var oModelMNA = new JSONModel();
			var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			var filterParameters = {
				$filter: "Placa eq '" + placa + "'   and Filename eq '" + file + "' and InstidB eq '" + InstidB + "'"
			};

			var permiso = 0;
			var cont;
			for (cont = 0; cont < sap.ui.getCore().statusN.datos.permisosSet.results.length; cont++) {
				if (sap.ui.getCore().statusN.datos.permisosSet.results[cont].Nivel == '0001') {
					permiso = permiso + 1;
				}
			}

			if (permiso == 0) {
				MessageBox.error("Solo en el nivel 1 se pueden eliminar adjuntos.");
				return;
			}

			var readmodel = this.f_read_entity(oModel, "/archivosAdjuntosSet", filterParameters);

			//this.closeDialog();
			//	this.f_cerrar_adjunto();

		},

		f_dialogo_nivel: function() {
			 
			var sServiceUrl = this.getView().getModel().sServiceUrl;
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			var modelo = this.getView().getModel("data");
			var Nivel = modelo.oData.nivel;

			//Abrimos el Fragment
			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.nivel");
			var oLista = sap.ui.getCore().getElementById("list_puesto_t");
			//Realizamos read a la entidad
			var filterParameters = {
				$filter: "Nivel eq '" + Nivel + "'"
			};
			var nivelFil = sap.ui.getCore().statusN.datos.permisosSet.results[0].Nivel;
			var readmodel = this.f_read_entity(oModel, "/AyudaNivelesSet", filterParameters);

			//Se instancia el nuevo modelo
			var oModel_textos = new sap.ui.model.json.JSONModel();

			//Trabajamos con el modelo
			oModel_txt_contact = {
				list_puesto_t: [{
					Nivel: readmodel[0].Nivel,
					Estatus: readmodel[0].Estatus
				}]
			};

			oModel_textos.setData(oModel_txt_contact);

			for (var i = 1; i < nivelFil - 1; i++) {
				var item_datos = {
					Nivel: readmodel[i].Nivel,
					Estatus: readmodel[i].Estatus
				};

				oModel_txt_contact.list_puesto_t.push(item_datos);
				oModel_textos.setData(oModel_txt_contact);
			}
			//Llevar los datos a la tabla
			oLista.setModel(oModel_textos);
		},

		f_dialogo_caulsal: function() {
			 
			this.f_obtiene_puesto(); //Add Marisol Ocampo 18/06/2021 
			var sServiceUrl = servicio;
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var Nivel = arrakey.nivel; /*nivel seleccionado en la ayuda de busque anterior*/

			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.causales");

			var oLista = sap.ui.getCore().getElementById("list_causales_t");
			//Realizamos read a la entidad
			var filterParameters = {
				$filter: "Nivel eq '" + Nivel + "'"
			};

			var readmodel = this.f_read_entity(oModel, "/AyudaCausalesSet", filterParameters);

			//Obtenemos controles del Fragment

			//Se instancia el nuevo modelo
			var oModel_textos = new sap.ui.model.json.JSONModel();

			//Trabajamos con el modelo
			oModel_txt_contact = {
				list_causales_t: [{
					Nivel: readmodel[0].Nivel,
					Decripcion: readmodel[0].Decripcion
				}]
			};

			oModel_textos.setData(oModel_txt_contact);

			for (var i = 1; i < readmodel.length; i++) {
				var item_datos = {
					Nivel: readmodel[i].Nivel,
					Decripcion: readmodel[i].Decripcion
				};

				oModel_txt_contact.list_causales_t.push(item_datos);
				oModel_textos.setData(oModel_txt_contact);
			}
			//Llevar los datos a la tabla
			oLista.setModel(oModel_textos);

		},

		f_cerrar_adjunto: function(evt) {
			 
			this.closeDialog();
			var opcion = true;
			this.ver_imagen(evt, opcion);
		},
		f_cerrar_add: function() {
			this.closeDialog();
		},

		f_obtiene_puesto: function(evt) {
			 
			//var puesto = this.f_obtiene_Datos_F("001", evt);// comentado por Marisol Ocampo 16/06/2021 
			arrakey['nivel'] = '0001'; //add por Marisol Ocampo 16/06/2021 se guarda por defecto el nivel inicial
			//	this.closeDialog();
		},

		f_actualiza_mto: function(evt) {
			 
			var oSelectedItem = evt.getParameter("selectedItem");
			var mto_baja = oSelectedItem.getTitle();

			this.actualizarMtodebaja(mto_baja);

		},

		f_obtiene_causal: function(evt) {
			 

			var causal = this.f_obtiene_Datos_F("txtCausal", evt);
			arrakey['causal'] = causal;
			this.closeDialog();
		},

		_handleUnlistActionResult: function(sProductId, bSuccess, iRequestNumber, iTotalRequests) {
			 
			// we could create a counter for successful and one for failed requests
			// however, we just assume that every single request was successful and display a success message once
			if (iRequestNumber === iTotalRequests) {
				MessageBox.error(this.getModel("i18n").getResourceBundle().getText("StockRemovedSuccessMsg", [iTotalRequests]));
			}
		},

		ver_imagen: function(oEvent, opcion) {
			 
			var data = "";
			var equipos = this.oModel_global.oData.cabeceraSolicitudSet.results; //add Marisol Ocampo 16/06/2021

			if (!opcion) {
				var placa = oEvent.oSource.mProperties.alt;
				//add Marisol Ocampo 16/06/2021 se guarda el nivel del equipo seleccionado
				for (var i = 0; i < equipos.length; i++) {
					if (equipos[i].Equipo == placa) {
						var nivel1 = equipos[i].Nivel;
						nivelAd = nivel1;
					}
				}
				//Fin add Marisol Ocampo 16/06/2021
				placaimg = placa;
				var readmodel = this.f_consulta_adjuntos(placa);

				this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.adjuntos");

				//Trabajamos con el modelo
				var oModel_txt_contact = {
					list_adjuntos_t: [{
						name: readmodel[0].Filename,
						tipo: readmodel[0].Tipodoc,
						binario: readmodel[0].Value,
						InstidB: readmodel[0].InstidB

					}]
				};
				var oLista = sap.ui.getCore().getElementById("list_adjuntos_t");

				var oModel_textos = new sap.ui.model.json.JSONModel();

				oModel_textos.setData(oModel_txt_contact);

				for (var i = 1; i < readmodel.length; i++) {
					var item_datos = {
						name: readmodel[i].Filename,
						tipo: readmodel[i].Tipodoc,
						binario: readmodel[i].Value,
						InstidB: readmodel[i].InstidB
					};

					oModel_txt_contact.list_adjuntos_t.push(item_datos);
					oModel_textos.setData(oModel_txt_contact);
				}

				oLista.setModel(oModel_textos);

				sap.ui.getCore().adjuntos = oModel_txt_contact;
			} else {
				 
				this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.adjuntos");
				var oLista = sap.ui.getCore().getElementById("list_adjuntos_t");

				var oModel_textos = new sap.ui.model.json.JSONModel();
				var oModel_txt_contact = sap.ui.getCore().adjuntos;
				var archivos = oModel_txt_contact.list_adjuntos_t;
				var resultado = archivos.find(solicitud => solicitud.name === nombreimg);

				oModel_textos.setData(oModel_txt_contact);
				oLista.setModel(oModel_textos);

			}

		},
		f_ver_file: function(oEvent) {
			 
			var archivos = [];
			var nivel = nivelAd;
			//data:image/gif;base64,
			var name = oEvent.getParameters().selectedItem.getProperty("title");
			nombreimg = name;
			var tipo = name.split(".");
			var adjunto = sap.ui.getCore().adjuntos;
			archivos = adjunto.list_adjuntos_t;
			var resultado = archivos.find(solicitud => solicitud.name === name);
			var deco = resultado.binario;
			InstidBImg = resultado.InstidB;
			//Organizar binario
			if (tipo[1] === 'PDF' || tipo[1] == 'pdf' || tipo[2] == 'pdf' || tipo[2] == 'PDF') {
				//data:application/pdf;base64
				var binary64PDF = "data:application/" + tipo[1] + ";base64," + deco;
			} else {
				var binary64 = "data:/" + "image" + tipo[1] + ";base64," + deco;
				if (nivel === '0001') {
					var data = {
						name: binary64,
						visible: true
					};
				} else {
					var data = {
						name: binary64,
						visible: false
					}
				};

			}
			var phone = sap.ui.Device.system.phone;
			var oModel1 = new JSONModel(data); // Only set data here.
			if (tipo[1] === 'pdf' || tipo[1] === 'PDF' || tipo[2] == 'pdf' || tipo[2] == 'PDF') {

				if (phone) {
					this._fnPdfJS(deco);
				} else {
					this._fnPdfJS(binary64PDF, nivel);
				}

			} else {
				this.closeDialog();
				this._oDialog = sap.ui.xmlfragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.Visualizar", this);
				this._oDialog.setModel(oModel1, "data");
				this._oDialog.open();
			}

		},

		update: function() {
			 
			this._oList.getBinding("items").refresh();
		},

		NavToCreate: function(oEvent) {
			 debugger;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getRouter().navTo("Create");

		},

		NavToUpdate: function() {
			 
			 
			var equipos = this.oModel_global.oData.cabeceraSolicitudSet.results; //add Marisol Ocampo 22/06/2021
			var aSelectedProducts, sPath, oProduct, oProductId, Equipo;
			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length > 0) {
				oProduct = aSelectedProducts[0];
				var Equipo = oProduct.mAggregations.cells[0].mProperties.alt;

				for (var i = 0; i < equipos.length; i++) {
					if (equipos[i].Equipo == Equipo) {
						nivelCa = equipos[i].Nivel;
					}
				}

				if (nivelCa === "0001") {
					var aSelectedProducts = this.byId("table").getSelectedItems();
					for (var k = 0; k < aSelectedProducts.length; k++) {
						var datos = {};
						var oProduct = aSelectedProducts[k];
						var oProductId = oProduct.mAggregations.cells[0].mProperties.alt;

						datos['Placa'] = oProductId;
					}
					debugger
					sap.ui.getCore().datos = this.oModel_global.oData.cabeceraSolicitudSet.results;
					sap.ui.getCore().placa = datos['Placa']; //placa seleccionada
					this.getRouter().navTo("update", {
						Placa: '12345'
					});

				} else {
					MessageBox.error("Solicitud en un nivel diferente al inicial");
				}
			} else {
				MessageBox.error("Debe de seleccionar solo  una solicitud");
			}

		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			/*	var oViewModel = this.getModel("worklistView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object:{
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();*/
		},

		onSearch: function(oEvent) {
			 
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("Placa", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			 
			var oTable = this.byId("table");
			//	oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			 
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Placa")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			 
			/*	var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}*/

		},
		_fnPdfJS: function(oData, nivel) {
			 
			var phone = sap.ui.Device.system.phone;

			if (phone) {
				this._fnPdfJS_base(oData, nivel);
			} else {

				var archivos = [];
				this.closeDialog();
				this._oDialog = sap.ui.xmlfragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.ViewerPDF", this);
				var oLista = sap.ui.getCore().getElementById("idFrame");
				this.getView().addDependent(this._oDialog);
				//var oHtml = this.getView().byId("idFrame");

				oLista.setContent(
					"<div style=\"width:100%;height:470px;\" id=\"divPdf\"><iframe id=\"pdfFrame\" style=\"width:100%;height:100%;\" src=\"" +
					oData +
					"\"></iframe></div>");

				//	oLista.setContent(
				//		"<div style=\"width:100%;height:100%;\" id=\"divPdf\"><iframe id=\"pdfFrame\" style=\"width:100%;height:100%;\" src=\"" + oData +
				//		"\"></iframe></div>");
				 
				this._oDialog.open();
				var that = this;
				//add Marisol Ocampo 16/06/2021 visibilidad del boton eliminar solo en el nivel inicial
				if (nivel === '0001') {
					sap.ui.getCore().getElementById("botonE").setVisible(true)
				} else {
					sap.ui.getCore().getElementById("botonE").setVisible(false)
				}
				//fin add Marisol Ocampo 16/06/2021
			}

		},
		//validar campo cedula
		validarAnio: function() {
			var validarInt = this.byId("ano").getValue();
			var rexMail = /^([0-9])*$/;

			if (rexMail.test(validarInt) === false) {
				this.byId("ano").setValueState(sap.ui.core.ValueState.Error);
			} else {
				this.byId("ano").setValueState(sap.ui.core.ValueState.None);
			}
		},

		_fnPdfJS_base: function(oDato) {

			var that = this;

			var pdfData = atob(oDato);
			// Loaded via <script> tag, create shortcut to access PDF.js exports.
			//	var pdfjsLib = window['pdfjs-dist/build/pdf'];
			// alert(pdfjsLib );

			// The workerSrc property shall be specified.
			pdfjsLib.GlobalWorkerOptions.workerSrc = Pdfworker;

			// Using DocumentInitParameters object to load binary data.
			var loadingTask = pdfjsLib.getDocument({
				data: pdfData
			});
			loadingTask.promise.then(function(pdf) {

				// Fetch the first page
				var pageNumber = 1;
				pdf.getPage(pageNumber).then(function(page) {
					var scale = 2;
					var viewport = page.getViewport(scale);
					that.closeDialog();
					that.fnCreateFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.ViewerPDF");

					// Prepare canvas using PDF page dimensions

					var canvas = document.getElementById('the-canvas');
					var context = canvas.getContext('2d');
					canvas.height = viewport.height;
					canvas.width = viewport.width;

					// Render PDF page into canvas context
					var renderContext = {
						canvasContext: context,
						viewport: viewport
					};
					var renderTask = page.render(renderContext);
					renderTask.then(function() {

					});
				});
			}, function(reason) {
				// PDF loading error
				console.error(reason);
			});
		},

		fnCreateFragment: function(url) {

			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(url, this);
			}
			this.getView().addDependent(this._oDialog);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		}

	});
});