function startWysiwyg() {

	$('.new-container').empty();
	$.ajaxSetup({ cache: false });

	$("#cisMaps").on('mouseover','.picker',function(){
		$(this).children('.picker_description').show();
	});
	$("#cisMaps").on('mouseout','.picker',function(){
		$(this).children('.picker_description').hide(); 
	});
	

	getPickers();
	
	showingEditor();
	if ($('.editor-button').attr('clicked') != "true") {
		$('.picker-container').empty();
	}
}
function showingEditor() {
	$('#cisMaps').click(function(evt){
		// Getting coordinates
		var posX = $(this).offset().left;
        var posY = $(this).offset().top;
		var e = evt.target;
        var x = evt.pageX - posX;
        var y = evt.pageY - posY;
        // Showing editor
        if ($('.editor-button').attr('clicked') == "true") {
        	$('#editor').show().css('left', x + 20).css('top', y).draggable();
        	$('#editor2').hide();
        	addingPicker(x, y);
    	}
    	else {
    		$('#editor').hide();
    		$('#editor2').hide();
    		$('.new-picker').hide();
    	}
	});
	// Do nothing on click
	$('#editor, #editor2').click(function(e) {
		e.stopPropagation();
	});
}
function addingPicker(x, y) {
	x = x - 10;
	y = y - 8;
	$('.new-picker').show().css('left', x).css('top', y).draggable();
	$('.setPicker').unbind().click(function(e) {
		setPicker($('.new-picker'), true);
	});
}
// Reading json file with picker information
function getPickers() {
	$('.lastPicker').hide();
	$('.picker-container').empty();
	$.getJSON( "js/json/map.json", function( data ) {
	  var items = [];
	  $.each( data, function( key, val ) {
	  	if(val.image == "img/"){
	  		if (val.description != ""){
	  			var popup = "<div class='picker_description'>" + 
	  							"<p class='no-img'>"+val.description+"</p>" +
	  						"</div>";
	  		}
	  		else{
	  			popup="";
	  		}
	  	}
	  	else {
	  		var popup = "<div class='picker_description'>" +
	  						"<img src='"+val.image+"'/>" +
		  					"<p>"+val.description+"</p>" +
		  				"</div>";
	  	}
	  	validUrl= "'#'"
	  	if (val.url != "" && val.url != undefined){
	  		validUrl = "'http://" + val.url + "' target='_blank'";
	  	}

	  	if( $('.name-reg').text() == val.region) {
	  		var positionX = val.coordinates[0] / val.cisDimensions[0] * 100;
	  		var positionY = val.coordinates[1] / val.cisDimensions[1] * 100;
		  	var div = 
		  	"<div class='picker ui-widget-content' style='left:" + positionX + "%; top:" + positionY + "%;' left='" + val.coordinates[0] + "' top='" + val.coordinates[1] + "'>" +
			  	"<img class='" + val.picker + "' src='../img/pins/"+ val.picker + ".svg'/>" +
			  	"<a href=" + validUrl + ">" +
			  		"<span class='picker-name' style='font-size: " + val.fontSize + "px;'>" + val.name + "</span>" + 
		  		"</a>" +
		  		popup +
		  	"</div>";
		    items.push(div);
	  	}
	  });
	 
	  $( "<div/>", {
	    "class": "picker-container", 
	    html: items.join( "" )
	  }).appendTo( "#cisMaps" );
	}).done(function() {
		$( ".editor-button" ).click(function() {
			$('.picker').draggable();
			if ($('.editor-button').attr('clicked') == "true") {
				$('.picker').draggable('enable');
			}
			else {
				$('.picker').draggable('disable');
			}
		});
		var picker = "";
		$('.picker').click(function(e) {
			e.stopPropagation();
			picker = $(this);
			var x = picker.position().left;
			var y = picker.position().top;
			var firstX = parseInt($(this).attr('left'));
			var firstY = parseInt($(this).attr('top'))
			if ($('.editor-button').attr('clicked') == "true") {
				$('#editor').hide();
				$('.new-picker').hide();
				$('.delPicker').click(function() {
					picker.hide();
					$('#editor2').hide();
					deletePicker(firstX, firstY);
				});
				$('#editor2').show().show().css('left', x + 20).css('top', y + 10).draggable();
				editPicker($(this), firstX, firstY);
			}
			else {
				$('#editor2').hide();
			}
		});
	})
	.fail(function() {
	    console.log( "error" );
  	});
}
// Saving to json
var lastTop = 0;
var lastLeft = 0;
function setPicker(picker, editor) {
	
	var div;
	var item = {};
	if (picker.position().left !== 0 && editor === true) {
		x = Math.round(picker.position().left + 15);
		y = Math.round(picker.position().top - 5);
	}
	else if (picker.position().left !== 0 ) {
		x = Math.round(picker.position().left);
		y = Math.round(picker.position().top);
	}
	if (editor === true) {
		item = {
			"region" : $('.name-reg').text(),
			"coordinates": [x, y],
			"picker": $('input[name="icon"]:checked').val(),
			"name": $('#name').val(),
			"url": $('#url').val(),
			"targetFrame": $('#target').val(),
			"fontSize": $('input[name="font-size"]:checked').val(),
			"image": 'img/' + $('#imageName').val(),
			"description": $('#description-area').val(),
			"cisDimensions": [$('#cisMaps').width(), $('#cisMaps').height()]
		}
	}
	else{
		item = {
			"region" : $('.name-reg').text(),
			"coordinates": [x, y],
			"picker": $('input[name="icon2"]:checked').val(),
			"name": $('#name2').val(),
			"url": $('#url2').val(),
			"targetFrame": $('#target2').val(),
			"fontSize": $('#font-size2:checked').val(),
			"image": 'img/' + $('#imageName2').val(),
			"description": $('#description-area2').val(),
			"cisDimensions": [$('#cisMaps').width(), $('#cisMaps').height()]
		}
	}
	if (item.coordinates[0] !== lastLeft && item.coordinates[1] !== lastTop || editor !== true) {
		// Sending data
		var deleted = false;
		var json = JSON.stringify(item);
		var xhr = new XMLHttpRequest();
		$.ajax({
		  method: "POST",
		  url: "server/server.php",
		  data: { json: json, deleted: deleted }
		})
		  .done(function() {
		  	$('.new-picker').hide();
		  	$('.lastPicker').show();
		  });
		lastLeft = item.coordinates[0];
		lastTop = item.coordinates[1];
	  	// Adding new item to interface
	  	if(item.image == "img/"){
	  		if (item.description != ""){
	  			var popup = "<div class='picker_description'>" + 
	  							"<p class='no-img'>"+item.description+"</p>" +
	  						"</div>";
	  		}
	  		else{
	  			popup="";
	  		}
	  	}
	  	else {
	  		var popup = "<div class='picker_description'>" +
	  						"<img src='"+item.image+"'/>" +
		  					"<p>"+item.description+"</p>" +
		  				"</div>";
	  	}
	  	validUrl= "'#'"
	  	if (item.url != "" && item.url != undefined){
	  		validUrl = "'http://" + item.url + "' target='_blank'";
	  	}
		div = 
		  	"<div class='picker lastPicker ui-widget-content' style='left:" + item.coordinates[0] + "px; top:" + item.coordinates[1] + "px;' left='" + item.coordinates[0] + "' top='" + item.coordinates[1] + "'>" +
			  	"<img class='" + item.picker + "' src='../img/pins/"+ item.picker + ".svg'/>" +
			  	"<a href=" + validUrl + ">" +
			  		"<span class='picker-name' style='font-size: " + item.fontSize + "px;'>" + item.name + "</span>" + 
		  		"</a>" +
		  		popup +
		  	"</div>";
	  	$('.new-container').append(div);


	  	$('.lastPicker').draggable();
	  	$('.lastPicker').click(function(e) {
	  		e.stopPropagation();
			newPicker = $(this);
			var x = newPicker.position().left;
			var y = newPicker.position().top;
			var firstX = parseInt($(this).attr('left'));
			var firstY = parseInt($(this).attr('top'))
			if ($('.editor-button').attr('clicked') == "true") {
				$('#editor').hide();
				$('.new-picker').hide();
				$('.delPicker').click(function() {
					newPicker.hide();
					$('#editor2').hide();
					deletePicker(firstX, firstY);
				});
				$('#editor2').show().css('left', x + 20).css('top', y + 10).draggable();
				editPicker(newPicker, firstX, firstY);
			}
  		})

	  	
	}
	// Removing values from inputs and close editor
	$('#name').val('');
	$('#url').val('');
	$('#target').val('');
	$('#fontSize').val('');
	$('#color').val('');
	$('#icon').val('redDot');
	$('#description-area').val('');
	$('#editor').hide();
	$('#imageName').val('')

	// callback();
}

function deletePicker(x, y) {
	var json = JSON.stringify({coordinates: [x, y]});
	var deleted = true;
	var xhr = new XMLHttpRequest();
	xhr.open('POST','server/server.php',true);
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.send('json=' + json + '&deleted=' + deleted);
}

function editPicker(picker, x, y) {
	$('#name2').val(picker.find('.picker-name').text());
	$('#url2').val(picker.find('a').attr('href').substring(7));
	$('#target2').val(picker.find('.picker-name').text());
	$('input[value="' + picker.find('.picker-name').css('font-size').slice(0, -2) + '"]').prop('checked', true);
	$('#color2').val('');
	$('input[value="' + picker.find('img').attr('class') + '"]').prop('checked', true);
	$('#description-area2').val(picker.find('.picker_description p').text());
	if (picker.find('.picker_description img').attr('src') !== undefined) {
		$('#imageName2').val(picker.find('.picker_description img').attr('src').substring(4));
	}
	$('.setPicker2').unbind().click(function() {
		deletePicker(x, y);
		setPicker(picker, false);
		picker.hide();
		$('#editor2').hide();
	})
}