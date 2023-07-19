var oModel = "";
var cargaMasiva = "";
var Equipo = ""; //equipo seleccionado en la ayuda de busqueda
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"APP_BAJAS_3428/APP_BAJAS_3428/controller/BaseController",
	"sap/m/MessageToast",
	"APP_BAJAS_3428/APP_BAJAS_3428/lib/xlsx",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"APP_BAJAS_3428/APP_BAJAS_3428/lib/FileSaver"
], function(Controller, BaseController, MessageToast, xlsx, JSONModel, MessageBox, Fragment, Dialog, FileSaver) {
	"use strict";

	return BaseController.extend("APP_BAJAS_3428.APP_BAJAS_3428.controller.Create", {
		onInit: function() {
			this.getRouter().getRoute("Create").attachPatternMatched(this._onMasterMatched, this);
			oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				Operacion: "1",
				Equipo: "",
				Diagnostico: "",
				Noaviso: "",
				Interlocutor: "",
				Aprobador: "",
				Mtobaja: "",
				cabeceraSolicitudSet: [{
					Nosolicitud: "",
					Placa: "",
					Tiposol: "",
					Equipo: "",
					Claseequipo: "",
					Pies: "",
					Diagnostico: "",
					Ano: "",
					Responsable: "",
					Regional: "",
					Activofijo: "",
					Valorlibros: "",
					Moneda: "",
					archivosAdjuntosSet: ["", "", ""],
					detalleSolicitudSet: []
				}],
				log_crecionSet: []
			});

			this.diagnosticos();
			this.tipoSolicitud();

		},

		_onMasterMatched: function() {
			debugger;
			console.log("funciona 2!!");
			oModel.getData().cabeceraSolicitudSet[0].archivosAdjuntosSet = ["", "", ""];
			var oModel_file = {
				Files: ""
			};
			oModeAdj = new JSONModel();
			oModeAdj.setData(oModel_file);
			this.getView().setModel(oModeAdj);
			console.log(oModel.getData());
		},

		//Add Marisol Ocampo 24/03/2020

		tipoSolicitud() {
			var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var readModel = this.f_read_entity(oModel, "/TipoSolicitudSet");

			var oModel_Solicitud = new JSONModel();

			oModel_Solicitud.setData(readModel);
			this.getView().setModel(oModel_Solicitud, "tipoSol");

		},
		//Fin Marisol Ocampo 24/03/2020

		diagnosticos() {
			debugger
			var tipoUsuario = "";
			var tipoSolicitud = "";
			var nivel = "";
			var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var readModel = this.f_read_entity(oModel, "/diagnosticosSet");
			var readModel_aux = [];

			readModel_aux.push([{
				Diagnostico: ""
			}])

			var oModel_Diagnosticos = new JSONModel();

			for (var a = 0; a < readModel.length; a++) {
				readModel_aux.push(readModel[a]);
			}

			for (var a = 0; a < readModel.length; a++) {

				tipoSolicitud = readModel[a].Diagnostico;

				for (var u = 0; u < sap.ui.getCore().statusN.datos.permisosSet.results.length; u++) {

					tipoUsuario = nivel = sap.ui.getCore().statusN.datos.permisosSet.results[u].TipoSol; //tipo al que tiene permiso el usuario (Sigma / perdida)
					nivel = sap.ui.getCore().statusN.datos.permisosSet.results[u].Nivel;
					tipoUsuario = tipoUsuario.toUpperCase();

					if (tipoSolicitud.indexOf(tipoUsuario) == 0 && nivel === "0001") {
						readModel_aux.push(readModel[a]);
						break;

					}
				}
			}

			//Add Marisol Ocampo 24/03/2020
			const uniqueArr = [];
			readModel_aux.forEach((item) => {
				//pushes only unique element
				if (!uniqueArr.includes(item)) {
					uniqueArr.push(item);
				}
			})
			oModel_Diagnosticos.setData(uniqueArr);
			//Fin Marisol Ocampo 24/03/2020
			this.getView().setModel(oModel_Diagnosticos, "diagnosticos");

		},

		handleExcelUpload: function(e) {
			var that = this;
			this.cargaMasiva = this._import(e.getParameter("files") && e.getParameter("files")[0], that);

		},

		handleIconTabBarSelect: function(oEvent) {

			var oBinding = this._oTable.getBinding("items"),
				sKey = oEvent.getParameter("key"),
				// Array to combine filters
				aFilters = [],
				oCombinedFilterG,
				oCombinedFilterKG,
				// Boarder values for Filter
				fMaxOkWeightKG = 1,
				fMaxOkWeightG = fMaxOkWeightKG * 1000,
				fMaxHeavyWeightKG = 5,
				fMaxHeavyWeightG = fMaxHeavyWeightKG * 1000;

		},

		_import: function(file, that) {

			var separar = file.name.split(" ");
			var nombre = separar[0] + separar[1] + separar[2];

			if (nombre !== "BajasActivosFijos" && nombre !== "BajasActivosFijos.xlsx") {
				that.byId("fileUploaderExcel").setValue("");
				MessageBox.error("Formato incorrecto");
				return;
			}

			if (file && window.FileReader) {
				var reader = new FileReader();
				var result = {},
					data;
				reader.onload = function(e) {
					data = e.target.result;
					var wb = XLSX.read(data, {
						type: 'binary'
					});

					var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets["solicitudes"]);

					var oModel = new JSONModel();
					oModel.setData(roa);

					that.getView().setModel(oModel, "carga");

					return result;

				}

				reader.readAsBinaryString(file);

			}

		},
		//Add Marisol Ocampo 28/09/2021
		abrir_adjuntos: function() {
			var oPersonalizationDialog = this._getDialog("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.cargarAdjuntos");
			oPersonalizationDialog.open();
		},
		onUploadComplete: function(oEvent) {

			var oFileUpload1 = sap.ui.getCore().getElementById("UploadCollection");
			oFileUpload1.setUploadUrl("/sap/opu/odata/sap/ZFILE_EX_SRV/FileSet");
			var domRef1 = oFileUpload1.getFocusDomRef();
			var file = domRef1.files[0];

			var Evento = e;

			if (file.size > 2000000) {
				MessageBox.error("El archivo supera el tamaño requerido " + "1.9MB");
				return;

			} else {
				reader.addEventListener("load", function(Evento) {

					var fileName = file.name;
					var fileType = file.type;
					//	var content = reader.result;

					var content = Evento.currentTarget.result.replace("data:" + file.type + ";base64,", "");

					that.postFileToBackend(fileName, fileType, content, posicion);
				}, false);

				if (file) {

					reader.readAsDataURL(file);
				}
			}
		},
		//Fin Marisol Ocampo 28/09/2021

		pruebalecturarchivo: function(e) {

			var id = ["adjuntos"];
			id.add["adjuntos"]
			id = e.mParameters.id.split("-");
			var reader = new FileReader();
			var final = id.length;
			final = final - 1;
			var num = id[final];
			var that = this;
			var posicion;
			var oFileUpload1 = sap.ui.getCore().getElementById("fileUploader1");
			this.oFileUpload1.setUploadUrl("C:\Users\mary3\Downloads");
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

		f_descargar_xslx: function() {

			var Url = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(Url, true);

			var readmodel = this.f_read_entity(oModel, "/ExcelSet");
			var data = readmodel[0].Contenido;
			var binary64 = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data;
			var image_data = atob(binary64.split(',')[1]);
			//var image_data = (data); 
			//var binary64 = "data:/" + "application/vnd.ms-excel" + ";base64," + base64;
			var arraybuffer = new ArrayBuffer(image_data.length);
			var view = new Uint8Array(arraybuffer);
			for (var i = 0; i < data.length; i++) {
				view[i] = image_data.charCodeAt(i) & 0xff;
			}
			try {
				// This is the recommended method:
				var blob = new Blob([arraybuffer], {
					type: 'application/octet-stream'
				});
			} catch (e) {
				// The BlobBuilder API has been deprecated in favour of Blob, but older
				// 			// browsers don't know about the Blob constructor
				// 			// IE10 also supports BlobBuilder, but since the `Blob` constructor
				// 			//  also works, there's no need to add `MSBlobBuilder`.
				var bb = new(window.WebKitBlobBuilder || window.MozBlobBuilder);
				bb.append(arraybuffer);
				var blob = bb.getBlob('application/octet-stream');
			}

			//Usage example:
			//  this.urltoFile(binary64, 'Bajas.xls','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
			///.then(function(file){ console.log(file);});

			// saveAs( new Blob ( [blob(wbout) ], {type:"application/octet-stream"}), 'test.xlsx' );
			saveAs(blob, "Bajas Activos Fijos.xlsx");

		},

		//return a promise that resolves with a File instance
		urltoFile: function(url, filename, mimeType) {
			return (fetch(url)
				.then(function(res) {
					return res.arrayBuffer();
				})
				.then(function(buf) {
					return new File([buf], filename, {
						type: mimeType
					});
				})
			);
		},

		onListItemPress: function(oEvent) {

			MessageToast.show("Pressed : " + oEvent.getSource().getTitle());
		},

		perdida: function(evt) {

			var diagnosticoSelec = this.byId("genre").getSelectedItem().getKey();
			var diagnostico = diagnosticoSelec.split("/");
			if (diagnostico[0] === "PERDIDA") {
				this.byId("fileUploader1").setVisible(false);
				this.byId("fileUploader2").setVisible(false);
				this.byId("aviso").setVisible(false);
				this.byId("Interlocutor").setVisible(false);
				this.byId("Aprobador").setVisible(false);
			} else {
				this.byId("fileUploader1").setVisible(true);
				this.byId("fileUploader2").setVisible(true);
				this.byId("aviso").setVisible(true);
				this.byId("Interlocutor").setVisible(true);
				this.byId("Aprobador").setVisible(true);
			}
		},

		f_bucarPlaca: function(evt) {
			debugger
			var placa = this.byId("txtPlaca").getValue();

			if (placa) {

				var cantidad = placa.split(" ");

				if (cantidad.length > 1) {
					MessageBox.error("Campo Placa no puede contener espacios");

					return;
				}

				//var sServiceUrl = this.getView().getModel().sServiceUrl;
				var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
				var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

				var filterParameters = {
					$filter: "Invnr eq '" + placa + "'"
				};

				var readmodel = this.f_read_entity(oModel, "/AydudaEquiposSet", filterParameters);

				var oModel_textos = new sap.ui.model.json.JSONModel();

				//Trabajamos con el modelo
				if (readmodel.length === 0) {
					MessageBox.error("No se encuentran equipos asociados a esta placa");
					return;
				}

				oModel_txt_contact = {
					list_equipos_t: [{
						Equnr: readmodel[0].Equnr,
						Invnr: readmodel[0].Invnr,
						Herst: readmodel[0].Herst
					}]
				};

				oModel_textos.setData(oModel_txt_contact);

				for (var i = 1; i < readmodel.length; i++) {
					var item_datos = {
						Equnr: readmodel[i].Equnr,
						Invnr: readmodel[i].Invnr,
						Herst: readmodel[i].Herst
					};

					oModel_txt_contact.list_equipos_t.push(item_datos);
					oModel_textos.setData(oModel_txt_contact);
				}
				//Llevar los datos a la tabla

				if (oModel_txt_contact.list_equipos_t.length !== 1) {
					this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.equipos");
					var list_equipos = sap.ui.getCore().getElementById("list_equipos_t");
					list_equipos.setModel(oModel_textos);
				} else {
					sap.ui.getCore().equipo = oModel_txt_contact.list_equipos_t[0].Equnr;
					this.onCreate();
				}

			} else {
				MessageBox.error("Campo Placa Obligatorio");
			}
		},

		cargaMasiva: function() {
			var doc = this.byId("fileUploaderExcel").getValue();

			if (doc === "") {
				MessageBox.error("No se ha seleccionado el Archivo");
				return;
			}

			var datos = this.getView().getModel("carga");
			var localdata = oModel.getData();
			if (datos !== undefined) {
				this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.espere");
				this._timeout = jQuery.sap.delayedCall(500, this, function() {

					var arreglo = datos.getData();

					if (arreglo.length === 0) {
						this.closeDialog();
						this.getView().getModel("carga").destroy();
						this.byId("fileUploaderExcel").setValue("");
						var msg = "No se encontraron datos en el formato";
						MessageBox.error(msg);

					}

					var arregloaux = {
						list: [{
							Equipo: String(arreglo[0].Equipo),
							Causalrechazo: String(arreglo[0].Diagnostico),
							Placa: String(arreglo[0].Placa),
							Noaviso: String(arreglo[0].Noaviso),
							Interlocutor: String(arreglo[0].Interlocutor),
							Aprobador: String(arreglo[0].Aprobador),
							//DocumentacionPDF: String(arreglo[0].DocumentacionPDF)
						}]
					};

					sap.ui.getCore().excel = arregloaux;
					//add Marisol Ocampo 26/06/2021
					var diag = String(arreglo[0].Diagnostico);
					var diagnostico = diag.split("/");

					if (diagnostico[0] === "PERDIDA") {
						arregloaux.list[0].Observaciones = "Z02";
					} else {
						arregloaux.list[0].Observaciones = "Z01";
					}

					for (var i = 1; i < arreglo.length; i++) {

						var list = {
							Equipo: String(arreglo[i].Equipo),
							Causalrechazo: String(arreglo[i].Diagnostico),
							Placa: String(arreglo[i].Placa),
							Noaviso: String(arreglo[i].Noaviso),
							Interlocutor: String(arreglo[i].Interlocutor),
							Aprobador: String(arreglo[i].Aprobador),
							Observaciones: "",

						};
						//add Marisol Ocampo 26/06/2021
						var diag = String(arreglo[i].Diagnostic);
						var diagnostico = diag.split("/");

						if (diagnostico[i] === "PERDIDA") {
							list.Observaciones = "Z02";
						} else {
							list.Observaciones = "Z01";
						}
						arregloaux.list.push(list);

					}

					for (var i = 0; i < arregloaux.list.length; i++) {
						localdata.cabeceraSolicitudSet[0].detalleSolicitudSet.push(arregloaux.list[i]);
					}

					localdata.Operacion = "4";

					var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
					var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

					var res = this.fnCreateEntity(Model, "/crearSolicitudSet", localdata);
					this.closeDialog();

					var oModel_ok = new sap.ui.model.json.JSONModel();
					var oModel_ok_contact = {
						list_ok: []
					};
					oModel_ok.setData(oModel_ok_contact);

					var oModel_bajas = new JSONModel(); // Only set data here.
					var oModel_errores = new JSONModel();

					try {
						//solicitudes procesadas con exito
						var resultados = res.datos.log_crecionSet.results;

						var bajas = [];
						var errores = [];

						for (var i = 0; i < resultados.length; i++) {
							if (resultados[i].Tipom == "E") {
								errores.push(resultados[i]);
							}
							if (resultados[i].Tipom == "S") {
								oModel_ok.oData.list_ok.push(resultados[i]);
							}
							if (resultados[i].Tipom == "B") {
								bajas.push(resultados[i]);
							}

						}
						var totales = {
							errores: errores.length,
							ok: oModel_ok.oData.list_ok.length,
							bajas: bajas.length
						}

						var oModelTotal = new JSONModel(totales); // Only set data here.

						oModel_bajas.setData(bajas);
						oModel_errores.setData(errores);

						oModel.oData.cabeceraSolicitudSet[0].detalleSolicitudSet = [];
					} catch (error) {
						MessageBox.error(error);
						oModel.oData.cabeceraSolicitudSet[0].detalleSolicitudSet = []
					}

					var oPersonalizationDialog = this._getDialog("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.cargaMasiva1");
					oPersonalizationDialog.setModel(oModel_ok);
					oPersonalizationDialog.setModel(oModel_bajas, "bajas"); //Equipos que ya fueron dados de baja
					oPersonalizationDialog.setModel(oModel_errores, "errores"); //Solicitudes que no se han podido crear
					oPersonalizationDialog.setModel(oModelTotal, "totales");

					oPersonalizationDialog.open();

					this.getView().getModel("carga").destroy();
					this.byId("fileUploaderExcel").setValue("");
				});
			} else {
				var msg = "No se ha seleccionado ningun archivo";
				MessageBox.error(msg);

			}
		},

		// previewFile: function(e) {

		// 	var id = [];
		// 	id = e.mParameters.id.split("-");
		// 	var reader = new FileReader();
		// 	var final = id.length;
		// 	final = final - 1;
		// 	var num = id[final];
		// 	var that = this;
		// 	var posicion;
		// 	switch (num) {
		// 		case "fileUploader":
		// 			posicion = 0;
		// 			break;
		// 		case "fileUploader1":
		// 			posicion = 1;
		// 			break;
		// 		case "fileUploader2":
		// 			posicion = 2;
		// 			break;
		// 		default:
		// 	}

		// 	var oFileUpload1 = this.getView().byId(num);
		// 	var domRef1 = oFileUpload1.getFocusDomRef();
		// 	var file = domRef1.files[0];

		// 	var Evento = e;
		// 	if (file.size > 2000000 ) {
		// 		MessageBox.error("El archivo supera el tamaño requerido " + "1.9MB");
		// 		return;

		// 	} else {
		// 		reader.addEventListener("load", function(Evento) {

		// 			var fileName = file.name;
		// 			var fileType = file.type;
		// 			//	var content = reader.result;

		// 			var content = Evento.currentTarget.result.replace("data:" + file.type + ";base64,", "");

		// 			that.postFileToBackend(fileName, fileType, content, posicion);
		// 		}, false);

		// 		if (file) {

		// 			reader.readAsDataURL(file);
		// 		}
		// 	}
		// },

		//Add Marisol Ocampo 28/09/2021
		// abrir_adjuntos: function() {
		// 	 
		// 	var oPersonalizationDialog = this._getDialog("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.cargarAdjuntos");
		// 	oPersonalizationDialog.open();
		// },

		abrir_adjuntos: function(oEvent) {
			debugger;
			var validar = this.getView().getModel("aceptar");

			// if (!validar.oData.valida) {
			// 	MessageBox.error("No cuenta con permisos para cargar adjuntos, Haz clic en el boton actualizar para recargar la bandeja.");
			// 	return;
			// }

			//placa = sap.ui.getCore().placa = oEvent.oSource.mAggregations.cells[0].mProperties.alt; //placa seleccionada
			this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.cargarAdjuntos");

			this.getView().getModel("base").oData.cabeceraSolicitudSet[0].archivosAdjuntosSet = [];

			var oModel_file = {
				Files: ""
			};
			oModeAdj = new JSONModel();
			oModeAdj.setData(oModel_file);

			this.getView().setModel(oModeAdj);

			Nplca = oEvent.oSource.mProperties.alt;

		},
		previewFile: function(e) {
			debugger
			var id = [];
			id = e.mParameters.id.split("-");
			var reader = new FileReader();
			var final = id.length;
			final = final - 1;
			var num = id[final];
			var that = this;
			var posicion;
			switch (num) {
				// case "fileUploader":
				// 	posicion = 0;
				// 	break;
				case "fileUploader1":
					posicion = 1;
					break;
				case "fileUploader2":
					posicion = 2;
					break;
				default:
			}

			var oFileUpload1 = this.getView().byId(num);
			if (oFileUpload1 === undefined) {
				oFileUpload1 = sap.ui.getCore().getElementById(num);
			}
			var domRef1 = oFileUpload1.getFocusDomRef();
			var file = domRef1.files[0];

			var Evento = e;
			if (file.size > 2000000) {
				MessageBox.error("El archivo supera el tamaño requerido " + "1.9MB");
				return;

			} else {
				reader.addEventListener("load", function(Evento) {

					var fileName = file.name;
					var fileType = file.type;
					//	var content = reader.result;

					var content = Evento.currentTarget.result.replace("data:" + file.type + ";base64,", "");
					if (sap.ui.getCore().Nplca) {
						var localDatao = oModel.getData()
						that.postFileToBackendAdjuntosmasivo(fileName, fileType, content, posicion, localDatao);
					} else {
						that.postFileToBackend(fileName, fileType, content, posicion);
					}

				}, false);

				if (file) {

					reader.readAsDataURL(file);
				}
			}
		},
		f_obtiene_equipo: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var title = oSelectedItem.getTitle();
			this.byId("txtPlaca").setValue(title);
			sap.ui.getCore().equipo = oSelectedItem.getDescription();
			this.closeDialog();
			this.onCreate();

		},

		showValueHelp: function() {
			alert("onsuggest");
		},

		handleErrorMessageBoxPress: function(res) {

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				res.datos.log_crecionSet.results[0].Mensaje, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		handleSuccessMessageBoxPress: function(res) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.success(
				res.datos.log_crecionSet.results[0].Mensaje, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		// postFileToBackend: function(fileName, fileType, content, posicion) {
		// 	 
		// 	var localdata = oModel.getData();

		// 	var oneMoreEntity = {};
		// 	oneMoreEntity['Filename'] = fileName;
		// 	oneMoreEntity['Tipodoc'] = fileType;
		// 	oneMoreEntity['Value'] = content; // btoa(content);
		// 	// localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet.push(oneMoreEntity);
		// 	localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet[posicion] = oneMoreEntity;
		// 	oModel.setData(localdata);

		// },

		//add Marisol Ocampo adjuntar archivos carga masiva
		postFileToBackendAdjuntosmasivo: function(fileName, fileType, content, posicion, localDatao) {
			debugger;
			var localData = localDatao;
			var sServiceUrl = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
			localData.Operacion = "6"; //Operacion que llama el filtro

			var equipo = sap.ui.getCore().Nplca;
			for (var i = 0; i < sap.ui.getCore().excel.list.length; i++) {
				// if( equipo === sap.ui.getCore().excel.list[i].Placa ){
				// 	localData.Equipo = sap.ui.getCore().excel.list[i].Equipo;
				// }
				var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

				var filterParameters = {
					$filter: "Invnr eq '" + equipo + "'"
				};

				var readmodel = this.f_read_entity(oModel, "/AydudaEquiposSet", filterParameters);
				// if( equipo === sap.ui.getCore().excel.list[i].Placa ){
				//   localData.Equipo = sap.ui.getCore().excel.list[i].Equipo;
				// }
				localData.Equipo = readmodel[0].Equnr;
			}

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
				for (var i = 0; i < localData.cabeceraSolicitudSet[0].archivosAdjuntosSet.length; i++) {
					if (localData.cabeceraSolicitudSet[0].archivosAdjuntosSet[i] === "") {
						localData.cabeceraSolicitudSet[0].archivosAdjuntosSet.splice(i, 1);
					}
				}
				var oModel_file = {
					Files: localData.cabeceraSolicitudSet[0].archivosAdjuntosSet
				};
				oModeAdj.setData(oModel_file);

				this.getView().setModel(oModeAdj);
			}

		},
		f_save_add: function() {
			var localData = oModel.getData();

			var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV"; //url servicio
			var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true); //model servicio
			var res = this.fnCreateEntity(Model, "/crearSolicitudSet", localData); // Consumimos el servicio
			oModel.getData().cabeceraSolicitudSet[0].archivosAdjuntosSet = []
			this.closeDialog();
		},

		//fin add adjuntar archivos carga masiva

		//add Marisol Ocampo carga varios archivos

		postFileToBackend: function(fileName, fileType, content, posicion) {
			debugger;
			var localdata = oModel.getData();
			var oneMoreEntity = {};
			oneMoreEntity['Filename'] = fileName;
			oneMoreEntity['Tipodoc'] = fileType;
			oneMoreEntity['Value'] = content; // btoa(content);
			// localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet.push(oneMoreEntity);
			localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet.push(oneMoreEntity); //marisol ocampo
			oModel.setData(localdata);
			sap.ui.getCore().archivos = localdata;
			var oModel_Solicitud = new JSONModel();
			for (var i = 0; i < localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet.length; i++) {
				if (localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet[i] === "") {
					localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet.splice(i, 1);
				}
			}
			oModel_Solicitud.setData(localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet);
			this.getView().setModel(oModel_Solicitud);
			oModeAdj = new JSONModel();
			var oModel_file = {
				Files: localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet
			};
			oModeAdj.setData(oModel_file);
			this.getView().setModel(oModeAdj);
			//	sap.ui.getCore().getElementById("archivo").getModel().refresh(true);
		},
		f_cerrar_add: function() {
			//oModel.getData().cabeceraSolicitudSet[0].archivosAdjuntosSet = []
			this.closeDialog();
		},

		// onRemoveLasRow: function() {
		// 	 
		// 	var oTable = sap.ui.getCore().getElementById("archivo");
		// 	var aSelectedItems = oTable.getSelectedItems();
		// 	for (var i = 0; i < aSelectedItems.length; i++) {
		// 		var oItemContextPath = aSelectedItems[i].getBindingContext().getPath();
		// 		var aPathParts = oItemContextPath.split("/");
		// 		var iIndex = aPathParts[aPathParts.length - 1]; //Index to delete into our array of objects

		// 		var oJSONData = this.getView().getModel().getData();
		// 		oJSONData.splice(iIndex, 1); //Use splice to remove your object in the array
		// 		this.getView().getModel().setData(oJSONData); //And set the new data to the model
		// 		sap.ui.getCore().getElementById("archivo").getModel().refresh(true);
		// 	}
		// },

		onCreate: function() {
			debugger
			if (this.validar()) {
				this.createFragment("APP_BAJAS_3428.APP_BAJAS_3428.view.fragment.espere");
				this._timeout = jQuery.sap.delayedCall(100, this, function() {

					var Placa = sap.ui.getCore().equipo,
						Diagnostico = this.byId("genre").getSelectedItem().getKey(),
						aviso = this.byId("aviso").getValue(),
						Interlocutor = this.byId("Interlocutor").getValue(),
						Aprobador = this.byId("Aprobador").getValue(),
						Mtobaja = "";

					var localdata = oModel.getData();
					//var localdata = sap.ui.getCore().archivos;
					//add Marisol Ocampo 26/06/2021
					var diagnostico = Diagnostico.split("/");
					if (diagnostico[0] === "PERDIDA") {
						localdata.Mtobaja = "Z02";
					} else {
						localdata.Mtobaja = "Z01";
					}
					//fin Marisol Ocampo 26/06/2021
					localdata.Operacion = "1";
					localdata.Equipo = Placa;
					localdata.Diagnostico = Diagnostico;
					localdata.Noaviso = aviso;
					localdata.Interlocutor = Interlocutor;
					localdata.Aprobador = Aprobador;

					oModel.setData(localdata);

					var lc_nombre_servicio = "/sap/opu/odata/sap/ZLO3428SEGW_CRE_BAJAS_SRV";
					var Model = new sap.ui.model.odata.ODataModel(lc_nombre_servicio, true);

					Model.setHeaders({
						"content-type": "application/json;charset=utf-8"
					});

					var res = this.fnCreateEntity(Model, "/crearSolicitudSet", localdata);
					this.closeDialog();
					var msg = "";
					this.localData = "";
					localdata.cabeceraSolicitudSet[0].archivosAdjuntosSet = [];
					oModel.getData().cabeceraSolicitudSet[0].archivosAdjuntosSet = []
					if (res.tipo === "E") {
						msg = "Error";
						MessageBox.error(msg);
					} else {
						if (res.datos.log_crecionSet.results[0].Tipom == 'E') {
							this.handleErrorMessageBoxPress(res);
						} else {
							this.handleSuccessMessageBoxPress(res);
							this.getView().byId("txtPlaca").setValue("");
							this.getView().byId("aviso").setValue("");
							this.getView().byId("Interlocutor").setValue("");
							this.getView().byId("Aprobador").setValue("");
							this.byId("genre").setValue("");
							this.byId("fileUploader1").setValue("");
							this.byId("fileUploader2").setValue("");
							oModeAdj.variable = null;

							this.getView().getModel().destroy();
						}

					}
				});

			}

		},

		validar: function() {

			var placa = this.byId('txtPlaca').getValue();
			if (placa == "") {
				("Campo Placa Obligatorio");
				return false;
			}

			var campos = "";
			var opcion = this.byId("genre").getSelectedItem().getKey();
			if (opcion == "SIGMA/Fuga de gas" || opcion == "SIGMA/motor malo") {
				if (this.byId('aviso').getValue() == "") {
					campos = " Aviso,";
				}
				if (this.byId('Interlocutor').getValue() == "") {
					campos += " Interlocutor,";
				}
				if (this.byId('Aprobador').getValue() == "") {
					campos += " Aprobador.";
				}
				if (campos !== "") {
					MessageBox.error("Campos Faltantes :" + campos);
					return false;
				}

			}
			return true;

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
			}
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf APP_BAJAS_3428.APP_BAJAS_3428.view.Create
			 */
			//	onInit: function() {
			//
			//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf APP_BAJAS_3428.APP_BAJAS_3428.view.Create
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf APP_BAJAS_3428.APP_BAJAS_3428.view.Create
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf APP_BAJAS_3428.APP_BAJAS_3428.view.Create
		 */
		//	onExit: function() {
		//
		//	}

	});

});