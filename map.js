var watchID;
var map;
var geocoder = new google.maps.Geocoder();
var isStart = false;
var accuracy;
var markers = new Array();
var geoOption = {
	enableHighAccuracy: true,
	timeout : 10000, 
	maximumAge: 0
};

window.addEventListener('load', function(){
	setTimeout(function(){window.scrollTo(0, 1)}, 100);
	document.addEventListener('touchmove', function(event){
		event.preventDefault();
	}, false);
	watchID = navigator.geolocation.watchPosition(init, errorCallback, geoOption);
	document.getElementById('btnStart').addEventListener('click', btnStartFunc,true);
	document.getElementById('btnClear').addEventListener('click', btnClearFunc,true);
	
	createDebugElement();
		
});
function init(pos){
	var date = getDate(pos.timestamp);
	var latlng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
	accuracy = pos.coords.accuracy;
	document.getElementById('information').innerHTML = 'Accuracy: '+accuracy+'<br />Update: '+date;
	var mapOption = {
		disableDefaultUI: true,
		zoom:16,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(document.getElementById('map'), mapOption);

	if(accuracy < 300){
		setMarker(latlng);
		navigator.geolocation.clearWatch(watchID);
	}else{
		showErrorMessage('位置情報の精度が低いため<br />マーカーを表示しません<br />精度：'+accuracy);
	}
}

function successCallback(pos){
	accuracy = pos.coords.accuracy;
	var date = getDate(pos.timestamp);
	var latlng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
	document.getElementById('information').innerHTML = 'Accuracy: '+accuracy+'<br />Update: '+date;
	geocoder.geocode({'latLng': latlng}, function(results, status){
		if(status == google.maps.GeocoderStatus.OK && results[1]){
			setMarker(latlng);	
		}else{
			showErrorMessage("Geocode was not successful for the following reason:<br />" + status);
		}	
	});
}

function errorCallback(error){
	var errorString = '';
	switch(error.code){
		case 1:
			errorString = '位置情報の取得が許可されていません。';
			break;
		case 2:
			errorString = '位置情報の取得が利用できません。';
			break;
		case 3:
			errorString = 'タイムアウトしました。<br />位置情報が取得できません。';
			break;
		default :
			break;
	}
	showErrorMessage(errorString);	
}

function getDate(timestamp){
	var dateObj = new Date(timestamp);
	return dateObj.getHours()+':'+dateObj.getMinutes()+':'+dateObj.getSeconds();
}

function setMarker(latlng){
	var markerImage=new google.maps.MarkerImage(
		"images/marker_flag.png",
		new google.maps.Size(14.0,23.0),
		new google.maps.Point(0,0),
		new google.maps.Point(7.0,11.0)
	);
	var markerShadowImage=new google.maps.MarkerImage(
		"images/shadow-marker_flag.png",
		new google.maps.Size(26.0,23.0),
		new google.maps.Point(0,0),
		new google.maps.Point(7.0,11.0)
	);
	var markerOption = {
		position: latlng,
		map: map,
		icon: markerImage,
		shadow: markerShadowImage,
		animation: google.maps.Animation.DROP
	}
	var marker = new google.maps.Marker(markerOption);
	markers.push(marker);
}


function btnStartFunc(){
	if(isStart == true){
		navigator.geolocation.clearWatch(watchID);
		this.setAttribute('src', 'images/btn_start.png');
		isStart = false;
	}else{
		this.setAttribute('src', 'images/btn_stop.png');
		isStart = true;
		watchID = navigator.geolocation.watchPosition(successCallback, errorCallback, geoOption);
	}
}

function btnClearFunc(){
	for(var i=0; i<markers.length; i++){
		markers[i].setMap(null);
	}
}

function showErrorMessage(error){
	var errorElement = document.createElement('div');
	errorElement.setAttribute('id','error');
	errorElement.style.display = 'block';
	errorElement.innerHTML = error;
	document.body.appendChild(errorElement);
	setTimeout(function(){
		document.body.removeChild(errorElement);
	},3000);
}
