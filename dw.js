//Oscar Tigreros 1326645
//Vida Artificial Universidad del Valle 2015
var debug = false;

var daisyWorld = {


	//tipo de margaritas, aqui se pueden añadir otras para ver resultado de diversidad
	margaritas: [ 
		{
			/*para otros tipos de margarita se cambia el albedo para que tengan disinta tonalidad,
			 la temperatura ideal de crecimiento y la temperatura maxima. En Enable es para activar o no la
			 margarita y que esta sea tomada en cuenta o no con el modelo*/
			"Tipo": "Blanca",
			"Albedo": 0.75,
			"Temperatura_Ideal": 22.5,
			"Maxmia_Temperatura": 40,
			"Enable": true
		},
		{
			"Tipo": "Negra",
			"Albedo": 0.25,
			"Temperatura_Ideal": 22.5,
			"Maxmia_Temperatura": 40,
			"Enable": true
		}
	],

	// Variable que representa el Albedo del Suelo
	albedo_tierra: 0.5,

	//Variable que representa el Albedo del planeta
	albedo_planeta: 0,

	//Variable que representa la temperatura del planeta
	temp_planeta: 0,

	//Constante de la densidad del flujo solar (Solar flux density)
	solar_flux_density: 1000,

	//Constante de Stefan-Boltzmann
	stefan_boltzman: 0.0000000567032,
	
	//Constante de facilidad de trasnmitir calor de unarea a otra
	trans_temp: 0.12,

	//constante de tasa de muerte de las margaritas
	tasa_muerte: 0.3,

	//Constante de pasos del modelo
	Steps: 1000,



	ejecutar: function(LuminosidadInicial, LuminosidadFinal, PasosLuminosidad){
		if(debug){$("#resp").append("-> ejecutar");}
		var LuminosidadInicial = parseFloat(LuminosidadInicial);		
		var LuminosidadFinal = parseFloat(LuminosidadFinal);
		var PasosLuminosidad = parseFloat(PasosLuminosidad);
		this.iniciar();

		var iteraciones = Math.floor((LuminosidadFinal- LuminosidadInicial)/PasosLuminosidad);
		var luminosidad_actual = LuminosidadInicial;
		//console.log(this.albedo_planeta);
		for (var i =0; i < iteraciones; i++) {
			
			var temp = this.runSteps(luminosidad_actual);
			temp["Lumens"] = {
				"Inicial": LuminosidadInicial,
				"Final": LuminosidadFinal,
				"Pasos": PasosLuminosidad,
				"Actual": luminosidad_actual,
			};
			//this.mostrar_datos("<hr>t. planeta: "+this.temp_planeta+"<br>")
		luminosidad_actual = luminosidad_actual + PasosLuminosidad;
		//console.log(luminosidad_actual);
		}

	},

	iniciar: function(){
		if(debug){$("#resp").append("-> iniciar");}
		//reiniciar valores

		for (var i = 0; i < this.margaritas.length; i++){
			this.margaritas[i]["Temperatura"] = 0;
			this.margaritas[i]["Tasa_nacimiento"] = 0;
			this.margaritas[i]["Converger"] = 0;
			this.margaritas[i]["Area"] = 0;
			this.margaritas[i]["Area_anterior"] = 0;
		}
		this.albedo_planeta = 0;
		this.albedo_tierra = 0.5;
	},

	reiniciar_poblacion: function(){
		console.log("poblacion negras "+this.margaritas[1]["Area"]);
		console.log("poblacion blancas "+this.margaritas[0]["Area"]);
		for(var i = 0; i < this.margaritas.length; i++){
			if(this.margaritas[i]["Area"] <= 0.01){
				this.margaritas[i]["Area"] = 0.01;
			}
			if(this.margaritas[i]["Area"] >= 1){
				this.margaritas[i]["Area"] = 1;
			}
			
		}

	},

	mostrar_datos: function(str){
		//tp = Math.round(tp);
		if(debug){$("#resp").append("<br>"+str);}
	},

	runSteps: function(Lumens){
		if(debug){$("#resp").append("<br> -> runSteps");}
		var converger = 0;
		
		//console.log(this.albedo_planeta);
		this.reiniciar_poblacion();

		for (var i = 0; i < this.Steps; i++) {
			
			//console.log("albedo_planeta:");
			//console.log(this.albedo_planeta);

			this.calcularPlanetaAlbedo();
			this.calcularTemperaturaPlaneta(Lumens);
			this.calcularTemperaturaLocal(Lumens);
			this.calcularTasaNacimiento();
			this.calcularCambioArea();
			this.reiniciar_poblacion();

			//this.mostrar_datos("Step ["+i+"]"+" -> no logro hallar las variables para traer los datos que necesito (this.algoquenecesite)");
		}

		//console.log(daisyWorld);

		return daisyWorld;// retornar temperatura planeta, poblacion margaritas, step.
	},

	calcularPlanetaAlbedo: function(){
		//console.log("albedo_planetaX: "+this.albedo_planeta);
		var sum = 0;
		var poblacion_total = 0;

		for (var i = 0; i < this.margaritas.length; i++) {
			if (this.margaritas[i]["Enable"]) {
				sum += this.margaritas[i]["Albedo"] * this.margaritas[i]["Area"];
				//console.log(this.margaritas[0]["Area"]);
				poblacion_total += this.margaritas[i]["Area"];

			}
		}
		
		//console.log(poblacion_total)
		sum += Math.max((1 - poblacion_total), 0) * this.albedo_tierra;
		this.albedo_planeta = sum;
		//console.log(sum)
		return	this.albedo_planeta;
	},

	calcularTemperaturaPlaneta: function(Luminosidad){
		
		//console.log(this.albedo_planeta)
		var T = Math.sqrt(Math.sqrt((Luminosidad * this.solar_flux_density * (1 - this.albedo_planeta)) / this.stefan_boltzman));
		this.temp_planeta = T;
		//console.log(this.temp_planeta-273)
		return this.temp_planeta;
	},

	calcularTemperaturaLocal: function(Luminosidad){
		//console.log(this.temp_planeta-273)
		for (var i = 0; i < this.margaritas.length; i++) {
			if(this.margaritas[i]["Enable"]){
				this.margaritas[i]["Temperatura"] = Math.sqrt(Math.sqrt(((this.trans_temp * Luminosidad * this.solar_flux_density * (this.albedo_planeta - this.margaritas[i]["Albedo"])) / this.stefan_boltzman) + Math.pow(this.temp_planeta,4)));
			}
		}	
	},

	calcularTasaNacimiento: function(){
		//console.log(this.margaritas[1]["Temperatura"]- 273)
		//console.log("Tasa nacimiento Blancas: "+this.margaritas[0]["Tasa_nacimiento"]);
		//console.log("Tasa nacimiento Negras: "+this.margaritas[1]["Tasa_nacimiento"]);
		//console.log(this.margaritas[1]["Tasa_nacimiento"]);

		for (var i = 0; i < this.margaritas.length; i++) {
			if(this.margaritas[i]["Enable"]){
				this.margaritas[i]["Tasa_nacimiento"] = (1-(Math.pow(((this.margaritas[i]["Temperatura"]- 273)-this.margaritas[i]["Temperatura_Ideal"]),2)/Math.pow((this.margaritas[i]["Temperatura_Ideal"]-this.margaritas[i]["Maxmia_Temperatura"]),2)));
			}
		}
	},

	calcularCambioArea: function(){
		//console.log(this.margaritas[0]["Tasa_nacimiento"]);
		//console.log(this.margaritas[0]["Area"]);
		//console.log(((this.margaritas[0]["Tasa_nacimiento"] * tierra) - this.tasa_muerte));
		var tierra = 1;
		for (var i = 0; i < this.margaritas.length; i++) {
			if(this.margaritas[i]["Enable"]){
				tierra += this.margaritas[i]["Area"] 
			}
		}

		for (var i = 0; i < this.margaritas.length; i++) {
			if(this.margaritas[i]["Enable"]){
				this.margaritas[i]["Area"] += this.margaritas[i]["Area"] * ((this.margaritas[i]["Tasa_nacimiento"] * tierra) - this.tasa_muerte);
			}
		}
	}
}