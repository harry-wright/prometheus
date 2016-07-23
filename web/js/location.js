var apiGeolocationSuccess = function(position) {
	console.log("Latitude:\n" + position.coords.latitude);
	console.log("Longitude:\n" + position.coords.longitude);
	initMap(position.coords.latitude,position.coords.longitude);
};

var tryAPIGeolocation = function() {
	jQuery.post( "https://www.googleapis.com/geolocation/v1/geolocate?key=yOuRkEyHeRe", function(success) {
		apiGeolocationSuccess({coords: {latitude: success.location.lat, longitude: success.location.lng}});
  })
  .fail(function(err) {
    console.log("API Geolocation error! \n\n"+err);
  });
};

var browserGeolocationSuccess = function(position) {
	/* this works on mozilla but not on chrome without https */
	console.log("Latitude:\n" + position.coords.latitude);
	console.log("Longitude:\n" + position.coords.longitude);
	initMap(position.coords.latitude,position.coords.longitude);
};

var browserGeolocationFail = function(error) {
  switch (error.code) {
    case error.TIMEOUT:
      console.log("Browser geolocation error !\n\nTimeout.");
      break;
    case error.PERMISSION_DENIED:
      if(error.message.indexOf("Only secure origins are allowed") == 0) {
        tryAPIGeolocation();
      }
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Browser geolocation error !\n\nPosition unavailable.");
      break;
  }
};

var tryGeolocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
    	browserGeolocationSuccess,
      browserGeolocationFail,
      {maximumAge: 50000, timeout: 20000, enableHighAccuracy: true});
  }
};

tryGeolocation();

var map;
var markers = [];
var infoWindow;
var locationSelect;

/* &callback=initMap removed from html to stop loading before got coords */
function initMap(retlat,retlng) {

	// rounds text to 6 decimal places
	var retlat = retlat.toFixed(6);
	var retlng = retlng.toFixed(6);

	// test coords
	//var retlat = 42.348297;
	//var retlng = -71.073250;

	// converts text to float
	var retlat = parseFloat(retlat);
	var retlng = parseFloat(retlng);

	// adds gps coords to submit page
	document.getElementById("userLatitude").value = retlat;
	document.getElementById("userLongitude").value = retlng;

	var myLatLng = {lat: retlat, lng: retlng};

	map = new google.maps.Map(document.getElementById('map'), {
		styles: [{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#aee2e0"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#abce83"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#769E72"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#7B8758"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#EBF4A4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#8dab68"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#5B5B3F"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ABCE83"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#A4C67D"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#9BBF72"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#EBF4A4"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#87ae79"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#7f2200"},{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"},{"weight":4.1}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#495421"}]},{"featureType":"administrative.neighborhood","elementType":"labels","stylers":[{"visibility":"off"}]}],
		minZoom: 5,
		maxZoom: 18, 
		disableDefaultUI: false,
		zoom: 10,
		center: myLatLng
	});

	// when location select changes, selects item and shows infowindow
	locationSelect = document.getElementById("locationSelect");
	
	locationSelect.onchange = function() {
		var markerNum = locationSelect.options[locationSelect.selectedIndex].value;
		if (markerNum != "none"){
			google.maps.event.trigger(markers[markerNum], 'click');
		}
	};
	
	infoWindow = new google.maps.InfoWindow();

	var usrPos = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'You are here!',
		icon: "/img/pokemark.png",
		// stops overlapping user position
		zIndex: google.maps.Marker.MAX_ZINDEX + 1
	});

	// searches locations upon init
	searchLocations(retlat,retlng);

}

function clearLocations() {
	infoWindow.close();

	for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
	}

	markers.length = 0;
	locationSelect.innerHTML = "";

}

function searchLocations(retlat,retlng) {
	clearLocations(); 

	// gets user coords from marker page
	var lat = document.getElementById("userLatitude").value;
	var lng = document.getElementById("userLongitude").value;

	// gets radius select and gets xml report
	var radius = document.getElementById('radiusSelect').value;
	var searchUrl = 'php/genxml.php?lat=' + lat + '&lng=' + lng + '&radius=' + radius;

	downloadUrl(searchUrl, function(data) {
		var xml = parseXml(data);
		var markerNodes = xml.documentElement.getElementsByTagName("marker");
		// creates empty bounds variable
		var bounds = new google.maps.LatLngBounds();

		//have not accounted for extra xml columns generated
		for (var i = 0; i < markerNodes.length; i++) {
			var id = parseInt(markerNodes[i].getAttribute("id"));
			var pokeid = parseInt(markerNodes[i].getAttribute("pokeid"));
			var distance = parseFloat(markerNodes[i].getAttribute("distance"));
			var desc = markerNodes[i].getAttribute("desc");
			var latlng = new google.maps.LatLng(
				parseFloat(markerNodes[i].getAttribute("lat")),
				parseFloat(markerNodes[i].getAttribute("lng")));
			var pokemonName = findId(getName, pokeid);
			
			//passed in correct order
			createOption(pokeid, distance, i, pokemonName);
			createMarker(id, latlng, pokeid, pokemonName, desc);
			
			// extends map bounds
			bounds.extend(latlng);
		}

		//avoid oceaning user if no bounds are detected
		if (bounds == null) {
			map.fitBounds(bounds);
		}
		else {
			doNothing();
		};


		locationSelect.style.visibility = "visible";

		locationSelect.onchange = function() {
			var markerNum = locationSelect.options[locationSelect.selectedIndex].value;
			google.maps.event.trigger(markers[markerNum], 'click');
		};
	});
}

function createMarker(id, latlng, pokeid, pokemonName, desc) {
	var html = "<b>" + pokemonName + "</b><br /> Submission ID:" + id + "<br /><i>" + desc + "</i>";

	var marker = new google.maps.Marker({
		map: map,
		position: latlng,
		icon: "/img/pokemon/sprites/" + pokeid + ".png"
	});

	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(html);
		infoWindow.open(map, marker);
	});

	markers.push(marker);
}

function createOption(pokeid, distance, num, pokemonName) {
	var option = document.createElement("option");
	option.value = num;
	option.innerHTML = "#" + pokeid + " " + pokemonName + " (" + distance.toFixed(1) + ")";
	locationSelect.appendChild(option);
}

function downloadUrl(url, callback) {
	var request = window.ActiveXObject ?
	new ActiveXObject('Microsoft.XMLHTTP') :
		new XMLHttpRequest;

	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			request.onreadystatechange = doNothing;
			callback(request.responseText, request.status);
		}
      };

	request.open('GET', url, true);
	request.send(null);
}

function parseXml(str) {
	if (window.ActiveXObject) {
		var doc = new ActiveXObject('Microsoft.XMLDOM');
		doc.loadXML(str);
		return doc;
	} 

	else if (window.DOMParser) {
		return (new DOMParser).parseFromString(str, 'text/xml');
	}
}

function doNothing() {}

var getName = {
	"pokemon" : [
		{"id":5000,"type":"place","name":"Pokestop"},
		{"id":6000,"type":"place","name":"Gym"},
		{"id":1,"type":"pokemon","name":"Bulbasaur"},
		{"id":2,"type":"pokemon","name":"Ivysaur"},
		{"id":3,"type":"pokemon","name":"Venusaur"},
		{"id":4,"type":"pokemon","name":"Charmander"},
		{"id":5,"type":"pokemon","name":"Charmeleon"},
		{"id":6,"type":"pokemon","name":"Charizard"},
		{"id":7,"type":"pokemon","name":"Squirtle"},
		{"id":8,"type":"pokemon","name":"Wartortle"},
		{"id":9,"type":"pokemon","name":"Blastoise"},
		{"id":10,"type":"pokemon","name":"Caterpie"},
		{"id":11,"type":"pokemon","name":"Metapod"},
		{"id":12,"type":"pokemon","name":"Butterfree"},
		{"id":13,"type":"pokemon","name":"Weedle"},
		{"id":14,"type":"pokemon","name":"Kakuna"},
		{"id":15,"type":"pokemon","name":"Beedrill"},
		{"id":16,"type":"pokemon","name":"Pidgey"},
		{"id":17,"type":"pokemon","name":"Pidgeotto"},
		{"id":18,"type":"pokemon","name":"Pidgeot"},
		{"id":19,"type":"pokemon","name":"Rattata"},
		{"id":20,"type":"pokemon","name":"Raticate"},
		{"id":21,"type":"pokemon","name":"Spearow"},
		{"id":22,"type":"pokemon","name":"Fearow"},
		{"id":23,"type":"pokemon","name":"Ekans"},
		{"id":24,"type":"pokemon","name":"Arbok"},
		{"id":25,"type":"pokemon","name":"Pikachu"},
		{"id":26,"type":"pokemon","name":"Raichu"},
		{"id":27,"type":"pokemon","name":"Sandshrew"},
		{"id":28,"type":"pokemon","name":"Sandslash"},
		{"id":29,"type":"pokemon","name":"Nidoran_"},
		{"id":30,"type":"pokemon","name":"Nidorina"},
		{"id":31,"type":"pokemon","name":"Nidoqueen"},
		{"id":32,"type":"pokemon","name":"Nidoran_"},
		{"id":33,"type":"pokemon","name":"Nidorino"},
		{"id":34,"type":"pokemon","name":"Nidoking"},
		{"id":35,"type":"pokemon","name":"Clefairy"},
		{"id":36,"type":"pokemon","name":"Clefable"},
		{"id":37,"type":"pokemon","name":"Vulpix"},
		{"id":38,"type":"pokemon","name":"Ninetales"},
		{"id":39,"type":"pokemon","name":"Jigglypuff"},
		{"id":40,"type":"pokemon","name":"Wigglytuff"},
		{"id":41,"type":"pokemon","name":"Zubat"},
		{"id":42,"type":"pokemon","name":"Golbat"},
		{"id":43,"type":"pokemon","name":"Oddish"},
		{"id":44,"type":"pokemon","name":"Gloom"},
		{"id":45,"type":"pokemon","name":"Vileplume"},
		{"id":46,"type":"pokemon","name":"Paras"},
		{"id":47,"type":"pokemon","name":"Parasect"},
		{"id":48,"type":"pokemon","name":"Venonat"},
		{"id":49,"type":"pokemon","name":"Venomoth"},
		{"id":50,"type":"pokemon","name":"Diglett"},
		{"id":51,"type":"pokemon","name":"Dugtrio"},
		{"id":52,"type":"pokemon","name":"Meowth"},
		{"id":53,"type":"pokemon","name":"Persian"},
		{"id":54,"type":"pokemon","name":"Psyduck"},
		{"id":55,"type":"pokemon","name":"Golduck"},
		{"id":56,"type":"pokemon","name":"Mankey"},
		{"id":57,"type":"pokemon","name":"Primeape"},
		{"id":58,"type":"pokemon","name":"Growlithe"},
		{"id":59,"type":"pokemon","name":"Arcanine"},
		{"id":60,"type":"pokemon","name":"Poliwag"},
		{"id":61,"type":"pokemon","name":"Poliwhirl"},
		{"id":62,"type":"pokemon","name":"Poliwrath"},
		{"id":63,"type":"pokemon","name":"Abra"},
		{"id":64,"type":"pokemon","name":"Kadabra"},
		{"id":65,"type":"pokemon","name":"Alakazam"},
		{"id":66,"type":"pokemon","name":"Machop"},
		{"id":67,"type":"pokemon","name":"Machoke"},
		{"id":68,"type":"pokemon","name":"Machamp"},
		{"id":69,"type":"pokemon","name":"Bellsprout"},
		{"id":70,"type":"pokemon","name":"Weepinbell"},
		{"id":71,"type":"pokemon","name":"Victreebel"},
		{"id":72,"type":"pokemon","name":"Tentacool"},
		{"id":73,"type":"pokemon","name":"Tentacruel"},
		{"id":74,"type":"pokemon","name":"Geodude"},
		{"id":75,"type":"pokemon","name":"Graveler"},
		{"id":76,"type":"pokemon","name":"Golem"},
		{"id":77,"type":"pokemon","name":"Ponyta"},
		{"id":78,"type":"pokemon","name":"Rapidash"},
		{"id":79,"type":"pokemon","name":"Slowpoke"},
		{"id":80,"type":"pokemon","name":"Slowbro"},
		{"id":81,"type":"pokemon","name":"Magnemite"},
		{"id":82,"type":"pokemon","name":"Magneton"},
		{"id":83,"type":"pokemon","name":"Farfetch'd"},
		{"id":84,"type":"pokemon","name":"Doduo"},
		{"id":85,"type":"pokemon","name":"Dodrio"},
		{"id":86,"type":"pokemon","name":"Seel"},
		{"id":87,"type":"pokemon","name":"Dewgong"},
		{"id":88,"type":"pokemon","name":"Grimer"},
		{"id":89,"type":"pokemon","name":"Muk"},
		{"id":90,"type":"pokemon","name":"Shellder"},
		{"id":91,"type":"pokemon","name":"Cloyster"},
		{"id":92,"type":"pokemon","name":"Gastly"},
		{"id":93,"type":"pokemon","name":"Haunter"},
		{"id":94,"type":"pokemon","name":"Gengar"},
		{"id":95,"type":"pokemon","name":"Onix"},
		{"id":96,"type":"pokemon","name":"Drowzee"},
		{"id":97,"type":"pokemon","name":"Hypno"},
		{"id":98,"type":"pokemon","name":"Krabby"},
		{"id":99,"type":"pokemon","name":"Kingler"},
		{"id":100,"type":"pokemon","name":"Voltorb"},
		{"id":101,"type":"pokemon","name":"Electrode"},
		{"id":102,"type":"pokemon","name":"Exeggcute"},
		{"id":103,"type":"pokemon","name":"Exeggutor"},
		{"id":104,"type":"pokemon","name":"Cubone"},
		{"id":105,"type":"pokemon","name":"Marowak"},
		{"id":106,"type":"pokemon","name":"Hitmonlee"},
		{"id":107,"type":"pokemon","name":"Hitmonchan"},
		{"id":108,"type":"pokemon","name":"Lickitung"},
		{"id":109,"type":"pokemon","name":"Koffing"},
		{"id":110,"type":"pokemon","name":"Weezing"},
		{"id":111,"type":"pokemon","name":"Rhyhorn"},
		{"id":112,"type":"pokemon","name":"Rhydon"},
		{"id":113,"type":"pokemon","name":"Chansey"},
		{"id":114,"type":"pokemon","name":"Tangela"},
		{"id":115,"type":"pokemon","name":"Kangaskhan"},
		{"id":116,"type":"pokemon","name":"Horsea"},
		{"id":117,"type":"pokemon","name":"Seadra"},
		{"id":118,"type":"pokemon","name":"Goldeen"},
		{"id":119,"type":"pokemon","name":"Seaking"},
		{"id":120,"type":"pokemon","name":"Staryu"},
		{"id":121,"type":"pokemon","name":"Starmie"},
		{"id":122,"type":"pokemon","name":"Mr.Mime"},
		{"id":123,"type":"pokemon","name":"Scyther"},
		{"id":124,"type":"pokemon","name":"Jynx"},
		{"id":125,"type":"pokemon","name":"Electabuzz"},
		{"id":126,"type":"pokemon","name":"Magmar"},
		{"id":127,"type":"pokemon","name":"Pinsir"},
		{"id":128,"type":"pokemon","name":"Tauros"},
		{"id":129,"type":"pokemon","name":"Magikarp"},
		{"id":130,"type":"pokemon","name":"Gyarados"},
		{"id":131,"type":"pokemon","name":"Lapras"},
		{"id":132,"type":"pokemon","name":"Ditto"},
		{"id":133,"type":"pokemon","name":"Eevee"},
		{"id":134,"type":"pokemon","name":"Vaporeon"},
		{"id":135,"type":"pokemon","name":"Jolteon"},
		{"id":136,"type":"pokemon","name":"Flareon"},
		{"id":137,"type":"pokemon","name":"Porygon"},
		{"id":138,"type":"pokemon","name":"Omanyte"},
		{"id":139,"type":"pokemon","name":"Omastar"},
		{"id":140,"type":"pokemon","name":"Kabuto"},
		{"id":141,"type":"pokemon","name":"Kabutops"},
		{"id":142,"type":"pokemon","name":"Aerodactyl"},
		{"id":143,"type":"pokemon","name":"Snorlax"},
		{"id":144,"type":"pokemon","name":"Articuno"},
		{"id":145,"type":"pokemon","name":"Zapdos"},
		{"id":146,"type":"pokemon","name":"Moltres"},
		{"id":147,"type":"pokemon","name":"Dratini"},
		{"id":148,"type":"pokemon","name":"Dragonair"},
		{"id":149,"type":"pokemon","name":"Dragonite"},
		{"id":150,"type":"pokemon","name":"Mewtwo"},
		{"id":151,"type":"pokemon","name":"Mew"}
	]
};

function findId(getName, idToLookFor) {

    var categoryArray = getName.pokemon;
    
    for (var i = 0; i < categoryArray.length; i++) {
    
        if (categoryArray[i].id == idToLookFor) {
        
            return(categoryArray[i].name);
        }
    }
};