import anime = require("../lib/anime.min.js");
import Decimal = require("../lib/break_infinity.min.js");
import ADNotations = require("../lib/ad-notations.min.js");

import * as ZIA from "./achievements"; // Zelo Incremental Achievements File
import * as ZIM from "./script"; // Zelo Incremental Main File
import * as ZIP from "./prestige"; // Zelo Incremental Prestige File
import * as ZAL from "./alert"; // Zelo Alert File

export var layers = [];
export var gamedata = { // Keep everything in one spot
	zelocoin: new Decimal(2),
	ps: new Decimal(0),
	maxlayer: new Decimal(5),
	coinboost: new Decimal(1),
	prestiges: new Decimal(0),
	resources: {
		zinc: new Decimal(0),
	},
	zincshop: [],
}

export var keys = {};
window.onkeyup = function(e) { keys[e.keyCode] = false; }
window.onkeydown = function(e) { keys[e.keyCode] = true; }

export var buffer = new Decimal(0);
export const VERSION = "1.3beta2";
export const SAVEVERSION = "1.2"; // when changes will disturb the saving/loading

export var pshopbuttons = [];

export const scientificwhen = new Decimal(1e+5);

export class Category {
	constructor(public cinfo: CategoryInfo) {
		let categorybutton = document.createElement("button");
		document.getElementById("category-container").appendChild(categorybutton);
		categorybutton.id = "category" + cinfo.id;
		categorybutton.className = "category";
		categorybutton.innerHTML = cinfo.name;
		if (cinfo.color) {
			categorybutton.style.backgroundColor = cinfo.color;
		}
		if (cinfo.open || cinfo.open == false) {
			document.getElementById(cinfo.id).style.display = "none";
		}
	}
}

export class Layer {
	constructor(public linfo: LayerInfo) {
		linfo.percent = new Decimal(1);
		//let layerbutton = new Element({
		//	type: "button",
		//	append: "layer",
		//	id: "layer" + linfo.id,
		//	innerHTML: "<b>" + linfo.amount + "</b><br>Layer " + linfo.id + "<br>" + DecimalFormat(linfo.cost) + " Zelocoin",
		//	onclick: function(){LayerCheck(linfo)}
		//})
		let layerbutton = document.createElement("button");
		document.getElementById("layer").appendChild(layerbutton);
		layerbutton.id = "layer" + linfo.id;
		layerbutton.innerHTML = "<b>" + linfo.amount + "</b><br>Layer " + linfo.id + "<br>" + DecimalFormat(linfo.cost) + " Zelocoin";
		layerbutton.onclick = function(){LayerCheck(linfo)};
	}
}

export class Element {
	constructor(public ei: ElementInfo) {
		let element = document.createElement(ei.type);
		if (ei.append) {
			document.getElementById(ei.append).appendChild(element);
		}
		if (ei.innerHTML) {element.innerHTML = ei.innerHTML;}
		if (ei.id) {element.id = ei.id;}
		if (ei.onclick) {element.onclick = ei.onclick;}
		if (ei.class) {element.className = ei.class; }
	}
}

layers[0] = new Layer({id:1,cost: new Decimal(2),amount: new Decimal(0)});

export function LayerCheck(linfo: LayerInfo) {
	if (!layers[linfo.id] && !gamedata.maxlayer.greaterThanOrEqualTo(layers.length)) {
		window.alert("You've reached the max layer! Increase the max layer in the Prestige Shop.");
		return;
	}
	if (gamedata.zelocoin.gte(linfo.cost)) {
		gamedata.zelocoin = gamedata.zelocoin.minus(linfo.cost);
		linfo.amount = linfo.amount.plus(1);
		linfo.amount.toNumber();
		linfo.cost = linfo.cost.times(2);
		if (!layers[linfo.id]) {
			layers[linfo.id] = new Layer({id:linfo.id+1,cost: new Decimal(("1e+" + Number(linfo.id*2))),amount:new Decimal(0)});
		}
		UpdateLayer(linfo);
		UpdateZelocoins();
	}
}


export function RespawnLayers() {
	for (let i = 0; i < layers.length; i++) {
		let layerbutton = document.createElement("button");
		document.getElementById("layer").appendChild(layerbutton);
		layerbutton.id = "layer" + layers[i].linfo.id;
		layerbutton.innerHTML = "<b>" + df(layers[i].linfo.amount) + "</b><br>Layer " + layers[i].linfo.id + "<br>" + df(layers[i].linfo.cost) + " Zelocoin";
		layerbutton.onclick = function(){LayerCheck(layers[i].linfo)};}
}

export interface LayerInfo {
	id: number;
	cost: any;
	amount: any;
	percent?: any;
}

export interface ElementInfo {
	type: string;
	id?: string;
	class?: string;
	onclick?: any;
	append?: string;
	innerHTML?: any;
}

export interface CategoryInfo {
	id: string;
	name: string;
	color?: string;
	open?: boolean;
}

export function Save(auto?: boolean) {
	//if (!auto) {
		if (window.confirm("Are you sure you want to save?")) { 
			var selectElement = (document.getElementById("themeform")) as HTMLSelectElement
			var themeindex = selectElement.selectedIndex;
			var selectElement1 = (document.getElementById("notationform")) as HTMLSelectElement
			var notationindex = selectElement1.selectedIndex;

			localStorage.setItem("gamedata",JSON.stringify(gamedata));
			localStorage.setItem("layers",JSON.stringify(layers));

			localStorage.setItem("zinc_Temp",JSON.stringify(gamedata.resources.zinc));
			// localStorage.setItem("zirconium_Temp",JSON.stringify(ZIM.zirconium));
	
			localStorage.setItem("achievements",JSON.stringify(ZIA.achievements));
			//console.log(ZIA.achievements);
			localStorage.setItem("completedAchievements",JSON.stringify(ZIA.completedAchievements));
			localStorage.setItem("theme",themeindex.toString());
			localStorage.setItem("notation",notationindex.toString());
			localStorage.setItem("version",SAVEVERSION); // remember to change this each version	
		}
	/*} else { // bad bad bad bad
		localStorage.setItem("layers",JSON.stringify(layers));
		localStorage.setItem("gamedata.zelocoin",gamedata.zelocoin);
		localStorage.setItem("gamedata.ps",gamedata.ps);

		localStorage.setItem("coinboost",coinboost);
		localStorage.setItem("maxlayer",maxlayer);

		localStorage.setItem("zinc",ZIP.zinc);
		localStorage.setItem("zirconium",ZIP.zirconium);

		localStorage.setItem("achievements",JSON.stringify(ZIA.achievements));
		//console.log(ZIA.achievements);
		localStorage.setItem("completedAchievements",JSON.stringify(ZIA.completedAchievements));
		localStorage.setItem("theme",document.body.getAttribute("theme"));	
		localStorage.setItem("version",SAVEVERSION); // remember to change this each version	
	}*/
}

export function AskLoad() {
	if (window.confirm("Are you sure you want to load?")) {
		Load();
	}
}
export function Load() {
	if (localStorage.getItem("version") != SAVEVERSION) {
			window.alert("The save-version your save is on is '" + localStorage.getItem("version") + "', although the current save-version is '" + SAVEVERSION + "'. Things may/may not work in your save. To fix this, press the save button to update the save-version.");
	}
	//var selectElement = (document.getElementById("themeform")) as HTMLSelectElement
	//var index = selectElement.selectedIndex;
	var selectElement1 = (document.getElementById("notationform")) as HTMLSelectElement
	var notationindex = selectElement1.selectedIndex;
	ZIM.ChangeNotation(Number(localStorage.getItem("notation")));
	//var zincP = JSON.parse(localStorage.getItem("zinc_Temp"));
	//console.log(zincP);
	//zincP.ic.amount = new Decimal(zincP.ic.amount);
	//ZIM.Zincc(gamedata.resources.zinc,zincP);
	//var zirconiumP = JSON.parse(localStorage.getItem("zirconium_Temp"));
	//console.log(zirconiumP);
	//zirconiumP.ic.amount = new Decimal(zirconiumP.ic.amount);
	// ZIM.Zirconiumc(ZIM.zirconium,zirconiumP);
	// console.log(ZIM.zirconium);

	gamedata = JSON.parse(localStorage.getItem("gamedata"));

	gamedata.coinboost = new Decimal(gamedata.coinboost);
	gamedata.ps = new Decimal(gamedata.ps);
	gamedata.zelocoin = new Decimal(gamedata.zelocoin);
	gamedata.maxlayer = new Decimal(gamedata.maxlayer);
	gamedata.prestiges= new Decimal(gamedata.prestiges);

	gamedata.resources.zinc = new Decimal(gamedata.resources.zinc);
	document.getElementById("zincsay").innerHTML = "You have " + gamedata.resources.zinc + " zinc.";

	layers = JSON.parse(localStorage.getItem("layers"));
	for (let i = 0; i < layers.length; ++i) {
			layers[i].linfo.amount = new Decimal(layers[i].linfo.amount);
			layers[i].linfo.cost = new Decimal(layers[i].linfo.cost);
			if (document.getElementById("layer"+layers[i].linfo.id) == null) {
				layers[i].linfo = {
					id: layers[i].linfo.id,
					cost: new Decimal(layers[i].linfo.cost),
					amount: new Decimal(new Decimal(layers[i].linfo.amount)),
					percent: new Decimal(layers[i].linfo.percent)
				}
					//new Layer({id:layers[i].linfo.id,cost: new Decimal(layers[i].linfo.cost),amount:new Decimal(layers[i].linfo.amount)});
				//console.log(layers[i].linfo);
			}
	}

	//ZIA.ChangeAchievements(ZIA.achievements,JSON.parse(localStorage.getItem("achievements")));
	ZIA.ChangeAchievements(ZIA.completedAchievements,JSON.parse(localStorage.getItem("completedAchievements")));
	//console.log(ZIA.achievements);
	//console.log(JSON.parse(localStorage.getItem("achievements")));
	// var pshop = JSON.parse(localStorage.getItem("pshop"));
	// for (let i = 0; i < pshopbuttons.length; ++i) {
	// 	pshopbuttons[i].psbinfo.cost = new Decimal(pshop[i]);
	// }

	if (localStorage.getItem("theme") != "0") {
			document.getElementById("css").setAttribute("rel","stylesheet");
			document.getElementById("css").setAttribute("href","../lib/css/themes/" + ZIM.themes[localStorage.getItem("theme")][0] + ".css");
	}

	document.getElementById("categoryachievements").innerHTML = "Achievements " + ZIA.completedAchievements.length + "/" + ZIA.achievements.length;
	UpdateZelocoins();
	if (!ZIA.achievements[4].achieved) { // keep an eye out for this
			ZIA.achievements[4].achieved = true;
			console.log(ZIA.achievements[4].achieved);
			ZIA.AchievementCheck();
	}
}

export function Tick() {
	gamedata.ps = new Decimal(0);
	for (var i = layers.length-2; i >= 0; i--) {
		let flinfo = layers[i].linfo;
		//console.log(flinfo);
		buffer = buffer.plus(flinfo.amount).times(flinfo.percent);
		//console.log("layer" + flinfo.id);
		//console.log(document.getElementById("layer" + flinfo.id).style.background);
		//buffer = buffer.times(flinfo.amount**10); //quick and fast numbers, for debugging
		if (i != layers.length-1) {
			//console.log(layers[i+1]);
			flinfo.amount = flinfo.amount.plus(layers[i+1].linfo.amount.times(layers[i+1].linfo.percent));
			// layers[i+1].linfo.amount = layers[i+1].linfo.amount.times(flinfo.percent);
		}
		UpdateLayer(flinfo);
	}
	// console.log(buffer);
	// console.log(layers);
	gamedata.ps = gamedata.ps.plus(buffer).times(gamedata.resources.zinc.div(100).times(ZIM.zincboost).plus(1));
	//gamedata.zelocoin = gamedata.zelocoin.plus(gamedata.ps);
	UpdateZelocoins();
	buffer = new Decimal(0);
}

export function UpdatePS() {
	gamedata.zelocoin = gamedata.zelocoin.plus(gamedata.ps.div(ZIM.gtnth*2));
	// console.log(gamedata.ps);
	// console.log(gamedata.zelocoin);
	UpdateZelocoins();
}

export function UpdateLayer(linfo: LayerInfo) {
	if (document.getElementById("layer").getAttribute("category") == "layercategory") {
		if (linfo.percent.gt(1)) {
			document.getElementById("layer"+linfo.id).innerHTML = "<span id='boost'>(⟵ x" + df(linfo.percent) + ") </span><b>" + df(linfo.amount) + "</b><br>Layer " + linfo.id + "<br>" + df(linfo.cost) + " Zelocoin";
		} else {
			document.getElementById("layer"+linfo.id).innerHTML = "<b>" + df(linfo.amount) + "</b><br>Layer " + linfo.id + "<br>" + df(linfo.cost) + " Zelocoin";
		}
	}
}

export function UpdateZelocoins() {
	document.getElementById("coin").innerHTML = df(gamedata.zelocoin.floor()) + " zelocoins";
	if (gamedata.resources.zinc.eq(0)) {
		document.getElementById("ps").innerHTML = "You are making " + df(gamedata.ps) + " zelocoins per second.";
	} else {
		document.getElementById("ps").innerHTML = "You are making " + df(gamedata.ps) + " (x" + gamedata.resources.zinc.div(100).plus(1).times(ZIM.zincboost).toFixed(2) + ") zelocoins per second.";
	}
}

export function DecimalFormat(decimal: Decimal) {
	if(decimal.greaterThanOrEqualTo(scientificwhen)) {
		return ZIM.usingNotation.format(decimal,2,0);
	} else {return decimal.toString()};
}

export function PrestigeReset() { // this shouldn't be a function
	gamedata.zelocoin = new Decimal(2);
	gamedata.ps = new Decimal(0);
	layers = [];
	document.getElementById("layer").innerHTML = "";
	layers[0] = new Layer({id:1,cost: new Decimal(2),amount: new Decimal(0)});
}

export function CoinBoost(decimal: Decimal) { // or this
	gamedata.coinboost = gamedata.coinboost.plus(decimal);
}

export function MaxLayerChange(decimal: Decimal) { // kinda needed
	gamedata.maxlayer = gamedata.maxlayer.plus(decimal);
	document.getElementById("maxlayer").innerHTML = "The Max Layer is " + gamedata.maxlayer.toString();
}

export function AddPercentage(num: string, add: number) {
	//console.log(Number(num)-1);
	//console.log(add);
	layers[Number(num)-1].linfo.percent = layers[Number(num)-1].linfo.percent.plus(add);
}

export function OpenCategory(cg: Category) {
	document.getElementById(cg.cinfo.id).style.display = "block";
}

export function CloseCategory(cg: Category) {
	document.getElementById(cg.cinfo.id).style.display = "none";
}

export var df = (decimal) => DecimalFormat(decimal); // shorthand
