sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		externo: function (equipo) {

			var res = equipo.replace(/^0+/, '');
			return res;
		},

		fooBar: function (iInteger) {
			
			if (iInteger !== null) {
				var ano = iInteger.substr(0, 4);
				var mes = iInteger.substr(4, 2);
				var dia = iInteger.substr(6, 2);
				return ano + "/" + mes + "/" + dia;
			} else {
				return null;
			}

		},

		status: function (statusN) {
			
			
			var retorno = "";
			
			if(statusN === ""){
				return "";
			}else{
				
			for(var e=0; e<sap.ui.getCore().statusN.datos.permisosSet.results.length;e++)
			{
				
			//	var nsatus = "000" + statusN;
				var nsatus = sap.ui.getCore().statusN.datos.permisosSet.results[e].Nivel;
				var status = sap.ui.getCore().statusN;
				var araryS = status.datos.statusnivelSet.results;
				var resultado = araryS.find(Desp => Desp.Nivel === nsatus);
				
				if(e==sap.ui.getCore().statusN.datos.permisosSet.results.length - 1){
					retorno = retorno + resultado.Estatus+ " . ";	
				}else{
					retorno = retorno + resultado.Estatus+ " , ";	
				}
			
			}	
				
			
			return retorno;		
			}

		}

	};

});