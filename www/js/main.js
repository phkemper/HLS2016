/**
* SuperNurse mail script.
*
* @author		Paul kemper <phkemper@tauros.eu>
* @version		1.0 2015-09-15
* @package		SuperNurse
*/

/***********************************************************************************************************************
*
* CONSTANTS
*
**********************************************************************************************************************/

var HOST = 'http://backend.learning-summit.nl';	// Back end host URL, exclusing terminating /
var LANG = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'en';	// Language code of interface

// Send as GET parameters with loadPage() function.
var loadPageData = {};

// Source page of talk-connect
var talkConnectSource = 'home';
// Connect with user
var talkConnectUid = 0;

/***********************************************************************************************************************
*
* INNITIALIZATION
*
**********************************************************************************************************************/

$.support.cors = true;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $(document).ready(function(){
        	
        });
    },
};

app.initialize();
	
/***********************************************************************************************************************
*
* UTILITIES
*
**********************************************************************************************************************/

/**
* Utility class, containing utility functions.
*/
var Util = new function() {
	/**
	* Detect if the app runs on a mobile device.
	* 
	* @return boolean
	* 	true if mobile, false if not.
	*/
	this.isMobile = function() {
		if ( navigator.userAgent.match(/Android/i)
			 || navigator.userAgent.match(/webOS/i)
			 || navigator.userAgent.match(/iPhone/i)
			 || navigator.userAgent.match(/iPad/i)
			 || navigator.userAgent.match(/iPod/i)
			 || navigator.userAgent.match(/BlackBerry/i)
			 || navigator.userAgent.match(/Windows Phone/i)
		  ) 
		{
			return true;
		}
		else {
			return false;
	 	}
	}
	
	/**
	 * Extract query parameters from a full URL and return an object.
	 * Every key is an object property.
	 * NOTE: Does not support arrays in query strings!
	 * 
	 * @param string uri
	 *   Full URI.
	 * @return Object
	 */
	this.getParams = function(uri) {
		if ( uri == undefined ) uri = location.href;
		var p = uri.substr(uri.indexOf('?') + 1),
			ret = {},
		    seg = p.split('&'),
		    len = seg.length, i = 0, s;
		for (;i<len;i++) {
		    if (!seg[i]) { continue; }
		    s = seg[i].split('=');
		    ret[s[0]] = s[1];
		}
		return ret;
	}
	
	/**
	 * Randomize an array.
	 * 
	 * @param Array array
	 *   Array to randomize.
	 * @return Array
	 *   Randomized array.
	 */
	this.shuffle = function (array) {
		  var currentIndex = array.length, temporaryValue, randomIndex;

		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {

		    // Pick a remaining element...
		    randomIndex = Math.floor(Math.random() * currentIndex);
		    currentIndex -= 1;

		    // And swap it with the current element.
		    temporaryValue = array[currentIndex];
		    array[currentIndex] = array[randomIndex];
		    array[randomIndex] = temporaryValue;
		  }

		  return array;
		}

}

/**
 * Load initial page details.
 * 
 * @param string pageid
 *   ID of the page.
 */
function loadPage(pageid) {
	/******************************************************************************************************************
	 * CHECK IF IN PRIVATE/ANONYMOUS MODE. IF SO, DIRECT TO PRIVATE PAGE
	 *****************************************************************************************************************/

	var isPrivate = 0;
	try {
		localStorage.setItem('tst', 'success');
		localStorage.removeItem('tst');
	}
	catch (e) {
		// Not OK. Go to PRIVATE page
		isPrivate = 1;
	}

	var lpd = loadPageData;
	loadPageData = {};
	lpd.isprivate = isPrivate;
	$.ajax({
		url: HOST + '/' + LANG + '/' + pageid.replace('-', '/'),
		crossDomain: true,
		method: 'get',
		data: lpd,
		dataType: 'json',
		headers: {Authorization: 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
		timeout: 20000,
		success: function(data, textStatus, jqXHR) {
			if ( data.message == 'OK' ) {
				if ( data !== undefined && data.data !== undefined ) {
					if ( data.data.html !== undefined ) {
						$.each(data.data.html, function(name, value) {
							$('#' + name).html(value);
						});
					}
					if ( data.data.placeholder !== undefined ) {
						$.each(data.data.placeholder, function(name, value) {
							$('#' + name).attr('placeholder', value);
						});
					}
					if ( data.data.value !== undefined ) {
						$.each(data.data.value, function(name, value) {
							$('#' + name).val(value);
						});
					}
					if ( data.data.header !== undefined ) {
						$.each(data.data.header, function(name, value) {
							$('#header #' + name).html(value);
						});
					}
					if ( data.data.user !== undefined ) {
						if ( data.data.user.avatar !== undefined ) {
							$('.avatar img').attr('src', data.data.user.avatar);
						}
						if ( data.data.user.progress !== undefined ) {
							var p = Math.floor(parseInt(data.data.user.progress) / 100 * 9);
							$('.progress').css('background-image', 'url(../img/tree-' + p + '.png)');
						}
						if ( data.data.user.fertilize !== undefined && data.data.user.fertilize == '1' ) {
							fertilizeTree();
						}
						if ( data.data.user.education !== undefined ) {
							carouselRestart(data.data.user.education, data.data.user.seqnr);
						}
						if ( data.data.user.login !== undefined ) {
							showError(data.data.user.login.msg, data.data.user.login.title, 'login');
							localStorage.removeItem('appToken');
						}
						if ( data.data.user.isemployee !== undefined ) {
							if ( data.data.user.isemployee ) {
								$('.employee').show();
							}
						}
						if ( data.data.user.isspeaker !== undefined ) {
							if ( data.data.user.isspeaker ) {
								$('.speaker').show();
							}
						}
						if ( data.data.user.isdelegate !== undefined ) {
							if ( data.data.user.isdelegate ) {
								$('.delegate').show();
							}
						}
					}
					if ( data.data.attributes !== undefined ) {
						$.each(data.data.attributes, function(name, value) {
							$.each(value, function(a, c) {
								if ( a == 'data-theme' ) {
									$('#' + name).buttonMarkup({theme: c});
								}
								else {
									$('#' + name).attr(a, c);
								}
							});
						});
					}
				}
				
			}
			else {
				showError(data.data.message);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showError(errorThrown);
		}
	});
}

/***********************************************************************************************************************
*
* CAROUSEL
*
**********************************************************************************************************************/

// Current education
var currentEducation = 0;
// Highest slide seen
var maxSlide = 1;
// Total slides in education
var totalSlides = 0;

// Move to previous slide
function carouselPrev(o) {
	var seqnr = parseInt(o.parent().attr('data-seqnr'));
	totalSlides = parseInt(o.parent().attr('data-max-seqnr'));
	if ( seqnr <= 1 ) {
		seqnr = totalSlides;
	}
	else {
		seqnr--;
	}
	o.parent().attr('data-seqnr', seqnr)
	o.parent().find('.content ul').animate({marginLeft: (seqnr * -100 + 100) + 'vw'},{duration:500});
	$('.progress-bullet').css('color', '#a96f97');
	$('.progress-bullet.progress-' + seqnr).css('color', '#fff');
}
// Move to next slide
function carouselNext(o) {
	var seqnr = parseInt(o.parent().attr('data-seqnr'));
	totalSlides = parseInt(o.parent().attr('data-max-seqnr'));
	if ( seqnr >= totalSlides ) {
		seqnr = 1;
	}
	else {
		seqnr++;
	}
	if ( seqnr > maxSlide ) maxSlide = seqnr;
	o.parent().attr('data-seqnr', seqnr)
	o.parent().find('.content ul').animate({marginLeft: (seqnr * -100 + 100) + 'vw'},{duration:500});
	$('.progress-bullet').css('color', '#a96f97');
	$('.progress-bullet.progress-' + seqnr).css('color', '#fff');
}
// Set the active sequence number
function carouselSetActive(seqnr) {
	$('.carousel .content ul').animate({marginLeft: (seqnr * -100 + 100) + 'vw'},{duration:500});
	$('.progress-bullet').css('color', '#a96f97');
	$('.progress-bullet.progress-' + seqnr).css('color', '#fff');
}
// Restart training
function carouselRestart(eid, seqnr) {
	var page = $('body').pagecontainer('getActivePage');
	$.mobile.loading('show');
	currentEducation = eid;
	maxSlide = seqnr;
	$.ajax({
		url: HOST + '/' + LANG + '/home/educate/' + eid + '/' + seqnr,
		crossDomain: true,
		headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'text/html', 'Accept-Language': LANG},
		method: 'get',
		dataType: 'html',
		timeout: 20000,
		success: function(data, textStatus, jqxXHR) {
			page.append(data);
			// Find the active sequence number
			var seqnr = parseInt(page.find('.carousel').attr('data-seqnr'));
			totalSlides = parseInt(page.find('.carousel').attr('data-max-seqnr'));
			carouselSetActive(seqnr);
			$.mobile.loading('hide');
		},
		error: function(jqXHR, statusText, errorThrown) {
			$.mobile.loading('hide');
			showError(errorThrown);
		}
	});
}
$(document).ready(function(){
	// Swipe left: previous slide
	$(document).on('swipeleft', '.carousel .content', function(event){
		carouselNext($(this));
	});
	// Swipe right: next slide
	$(document).on('swiperight', '.carousel .content', function(event){
		carouselPrev($(this));
	});
	// Click on previous
	$(document).on('click', '.carousel .navigate.left a', function(event){
		carouselPrev($(this).parent().next());
	});
	// Click on next
	$(document).on('click', '.carousel .navigate.right a', function(event){
		carouselNext($(this).parent().prev());
	});
	// Click on close
	$(document).on('click', '.carousel .close a', function(event) {
		$('.education').remove();
		// Send highest slide number to back end, so the education does not come back on
		$.ajax({
			url: HOST + '/' + LANG + '/home/educateclose/' + currentEducation + '/' + totalSlides,
			crossDomain: true,
			headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
			method: 'post',
			dataType: 'json',
			timeout: 20000
		});
	});
});

/***********************************************************************************************************************
*
* DIALOGS
*
**********************************************************************************************************************/

/******************************************************************************************************************
 * ERROR DIALOG
 *****************************************************************************************************************/

/**
 * @param string msg
 *   Error message.
 * @param string title
 *   Header title.
 * @param string nextPage  Next page after this dialog or empty if there is no next page.
 */
function showError(msg, title, nextPage) {
	$('#dialog-error-header').html(title);
	$('#dialog-error-message').html(msg);
	$('#dialog-error-next-page').val(nextPage != undefined ? nextPage : '');
	$('#dialog-error').show();
}
$(document).ready(function() {
	$('#dialog-error-submit').click(function(){
		$(this).parent().parent().hide();
		var nextPage = $('#dialog-error-next-page').val();
		if ( nextPage != '' ) $('body').pagecontainer('change', '#' + nextPage);
	});
	$('#dialog-error').click(function() {
		$(this).hide();
		var nextPage = $('#dialog-error-next-page').val();
		if ( nextPage != '' ) $('body').pagecontainer('change', '#' + nextPage);
	});
});

/******************************************************************************************************************
 * MESSAGE DIALOG
 *****************************************************************************************************************/

/**
 * @param string msg
 *   Message message.
 * @param string title
 *   Header title.
 * @param string nextPage  Next page after this dialog or empty if there is no next page.
 */
function showMessage(msg, title, nextPage) {
	$('#dialog-message-header').html(title);
	$('#dialog-message-message').html(msg);
	$('#dialog-message-next-page').val(nextPage != undefined ? nextPage : '');
	$('#dialog-message').show();
}
$(document).ready(function() {
	$('#dialog-message-submit').click(function(){
		$(this).parent().parent().hide();
		var nextPage = $('#dialog-message-next-page').val();
		if ( nextPage != '' ) $('body').pagecontainer('change', '#' + nextPage);
	});
	$('#dialog-message').click(function() {
		$(this).hide();
		var nextPage = $('#dialog-message-next-page').val();
		if ( nextPage != '' ) $('body').pagecontainer('change', '#' + nextPage);
	});
});

$(document).ready(function() {
	/**********************************************************************************************************************
	*
	* STARTUP ENTRY POINT
	*
	**********************************************************************************************************************/

	/******************************************************************************************************************
	 * CHECK IF ON A DESKTOP. IF SO, RELOAD INTO IFRAME
	 *****************************************************************************************************************/
	if ( !Util.isMobile() ) {
		// Divert to desktop page, but only if we are the main window.
		if ( window.self === window.top ) {
			// Check for IE version
			var ie = (function(){
			    var undef,
			        v = 3,
			        div = document.createElement('div'),
			        all = div.getElementsByTagName('i');
			    while (
			        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
			        all[0]
			    );
			    return v > 4 ? v : undef;
			}());
			// If IE below 10, show unsupported oage.
			if ( ie <= 9 ) {
				document.location.href = '/desktop-unsupported.html';
				return;
			}
			else {
				document.location.href = '/desktop.html';
				return;
			}
		}
	}

	/******************************************************************************************************************
	 * MOVE ADDRESS BAR OUT OF SIGHT
	 *****************************************************************************************************************/
	
	setTimeout(function(){window.scrollTo(0,1);},200);
	
	/******************************************************************************************************************
	 * DETECT THE INTERFACE LANGUAGE
	 *****************************************************************************************************************/

	LANG = localStorage.getItem('lang');
	if ( LANG == null ) {
		if ( navigator.globalization ) {
			// If Cordova is available.
			navigator.globalization.getPreferredLanguage(
				function (language) {LANG = language.value;},
				function () {LANG = navigator.language || navigator.userLanguage;}
			);
		}
		else {
			LANG = navigator.language || navigator.userLanguage;
		}
		LANG = LANG.substr(0,2).toLowerCase();
		localStorage.setItem('lang', LANG);
	}

	/******************************************************************************************************************
	 * RESIZE CONTENT WINDOW
	 *****************************************************************************************************************/
	
	$(window).bind('resize', function (event) {
		resizeContent(event);
	}).trigger('resize');
	$(window).bind('orientationchange', function (event) {
		resizeContent(event);
	}).trigger('resize');
	function resizeContent(event) {
        var content_height = $('body').pagecontainer('getActivePage').children('[data-role="content"]').height(),
            header_height  = $('body').pagecontainer('getActivePage').children('[data-role="header"]').height(),
            footer_height  = $('body').pagecontainer('getActivePage').children('[data-role="footer"]').height(),
            window_height  = $(this).height();

        if (content_height < (window_height - header_height - footer_height)) {
        	$('body').pagecontainer('getActivePage').css('min-height', (content_height + header_height + footer_height));
        }
        event.stopImmediatePropagation();
    }
	
	/******************************************************************************************************************
	 * HEADER INTERACTION
	 *****************************************************************************************************************/
	
	$("[data-role='navbar']").navbar();
	$('#header').toolbar();
	$(document).on('click', '#header button', function(){
		$.mobile.changePage($(this).attr('href'));
	});
	$(document).on('click', '#header li div', function() {
		$(this).parent().find('button').click();
	})
});

/***********************************************************************************************************************
*
* JUMP TO THE INITIALIZATION FUNCTION OF A PAGE
*
**********************************************************************************************************************/
$(document).on('pagecontainerbeforeshow', function(event, ui) {
	loadPage(ui.toPage[0].id);
	// Show header
	$('#header').show();
	switch( ui.toPage[0].id ) {
	case 'home':
		/**********************************************************************************************************************
		*
		* HOME PAGE
		*
		**********************************************************************************************************************/

		// Check if the user is logged in. If not, go to the login page.
		if ( localStorage.getItem('appToken') == null || localStorage.getItem('appToken') == '' ) {
			$('body').pagecontainer('change', '#login');
		}
		break;

	case 'private':
		/**********************************************************************************************************************
		*
		* PRIVATE PAGE
		*
		**********************************************************************************************************************/

		break;

	case 'login':
		/**********************************************************************************************************************
		*
		* LOGIN PAGE
		*
		**********************************************************************************************************************/

		// Hide header
		$('#header').hide();
		
		// Language switcher
		$('#login-form-lang').val(LANG);
		$(document).off('change', '#login-form-lang');
		$(document).on('change', '#login-form-lang', function() {
			if ( $(this).val() != '--' ) {
				LANG = $(this).val();
				loadPage('login');
			}
		});
		// Submit button handler
		$(document).off('click', '#login-form-submit');
		$(document).on('click', '#login-form-submit', function() {
			$.mobile.loading('show');
			$.ajax({
				url: HOST + '/' + LANG + '/login',
				crossDomain: true,
				method: 'post',
				data: {userid: $('#login-form-userid').val(), password: $('#login-form-password').val()},
				dataType: 'json',
				timeout: 20000,
				success: function(data, textStatus, jqxXHR) {
					if ( data.message == 'OK' ) {
						localStorage.setItem('appToken', data.data.appToken);
						$('body').pagecontainer('change', '#home');
					}
					else {
						var text = [];
						$.each(data.data, function(key, value) {
							text.push(value);
							$('#' + key).addClass('error');
						});
						showError(text.join('<br/>'), data.message);
					}
					$.mobile.loading('hide');
				},
				error: function(jqXHR, statusText, errorThrown) {
					$.mobile.loading('hide');
					showError(errorThrown);
				}
			});
		});
		break;

	case 'apps':
		/**********************************************************************************************************************
		*
		* APPS PAGE
		*
		**********************************************************************************************************************/

		// Get the list of apps
		$.ajax({
			url: HOST + '/' + LANG + '/apps/list',
			crossDomain: true,
			method: 'get',
			dataType: 'json',
			headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
			timeout: 20000,
			success: function(data, textStatus, jqxXHR) {
				if ( data.message == 'OK' ) {
					var html = '';
					$.each(data.data.apps, function(ndx, app) {
						html = html + '<div class="app" id="app-' + app.id + '">' +
										'<div class="name">' + app.name + '</div>' +
										'<div class="details">' +
											'<div class="status"><input type="checkbox"' + (app.checked ? ' checked="checked"' : '') + ' data-aid="' + app.id + '"/></div>' +
											'<div class="icon"><img src="' + app.icon + '"></div>' +
											'<div class="store"><a class="' + app.os + '" href="' + app.url + '" target="_blank"></a></div>' +
										'</div>' +
									  '</div>';
					});
					$('#apps-list').html(html);
					$('#apps-list').trigger('create');
				}
				else {
					var text = [];
					$.each(data.data, function(key, value) {
						text.push(value);
						$('#' + key).addClass('error');
					});
					showError(text.join('<br/>'), data.message);
				}
				$.mobile.loading('hide');
			},
			error: function(jqXHR, statusText, errorThrown) {
				$.mobile.loading('hide');
				showError(errorThrown);
			}
		});
	
		// Checkbox checked or unckecked
		$(document).off('click', '#apps-list .app input');
		$(document).on('click', '#apps-list .app input', function() {
			var checked = $(this).is(':checked');
			var aid = $(this).attr('data-aid');
			$.ajax({
				url: HOST + '/' + LANG + '/apps/list',
				crossDomain: true,
				method: 'post',
				dataType: 'json',
				data: {aid: aid, checked: checked ? 1 : 0},
				headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
				timeout: 20000
			});
		});
		
		break;

	case 'vr':
		/**********************************************************************************************************************
		*
		* VR PAGE
		*
		**********************************************************************************************************************/

		vrGetList('vr');
		vrGetList('ar');
		
		// Get the list of apps
		function vrGetList(type) {
			$.ajax({
				url: HOST + '/' + LANG + '/vr/list?type=' + type,
				crossDomain: true,
				method: 'get',
				dataType: 'json',
				headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
				timeout: 20000,
				success: function(data, textStatus, jqxXHR) {
					if ( data.message == 'OK' ) {
						var html = '';
						$.each(data.data.apps, function(ndx, app) {
							html = html + '<div class="app" id="app-' + app.id + '">' +
											'<div class="name">' + app.name + '</div>' +
											'<div class="details">' +
												'<div class="status"><input type="checkbox"' + (app.checked ? ' checked="checked"' : '') + ' data-aid="' + app.id + '" data-type="' + type + '"/></div>' +
												'<div class="icon"><img src="' + app.icon + '"></div>' +
												'<div class="store"><a class="' + app.os + '" href="' + app.url + '" target="_blank"></a></div>' +
											'</div>' +
										  '</div>';
						});
						$('#vr-list-' + type).html(html);
						$('#vr-list-' + type).trigger('create');
					}
					else {
						var text = [];
						$.each(data.data, function(key, value) {
							text.push(value);
							$('#' + key).addClass('error');
						});
						showError(text.join('<br/>'), data.message);
					}
					$.mobile.loading('hide');
				},
				error: function(jqXHR, statusText, errorThrown) {
					$.mobile.loading('hide');
					showError(errorThrown);
				}
			});
		}
	
		// Checkbox checked or unckecked
		$(document).off('click', '#vr .app input');
		$(document).on('click', '#vr .app input', function() {
			var checked = $(this).is(':checked');
			var aid = $(this).attr('data-aid');
			$.ajax({
				url: HOST + '/' + LANG + '/vr/list',
				crossDomain: true,
				method: 'post',
				dataType: 'json',
				data: {aid: aid, checked: checked ? 1 : 0},
				headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG}
			});
		});
		
		break;

	case 'program':
		/**********************************************************************************************************************
		*
		* PROGRAM PAGE
		*
		**********************************************************************************************************************/

		// Get the list of sessions
		$.ajax({
			url: HOST + '/' + LANG + '/program/list',
			crossDomain: true,
			method: 'get',
			dataType: 'json',
			headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
			success: function(data, textStatus, jqxXHR) {
				if ( data.message == 'OK' ) {
					var html = '<div class="program" style="overflow:scroll;">';
					var themes = [];
					var levels = [];
					var likes = data.data.selected.likes[0] == '1';
					var lastLid = 0;
					var lastTid = 0;
					var lastChecked = 0;
					$.each(data.data.program, function(timeslot, sessions){
						// Row DIV
						html = html + '<div class="row">';
							html = html + '<div class="timeslot">' + timeslot.substr(0,5) + '</div>';
							var cols = 0;
							$.each(sessions, function(pid, session){
								cols++;
								var checked = data.data.selected.sessions[pid] !== undefined && data.data.selected.sessions[pid] == '1';
								lastChecked = checked;
								// Session DIV
								html = html + '<div ' + (!likes || (likes && data.data.selected.sessions[pid] !== undefined && data.data.selected.sessions[pid] == '1') ? '' : 'style="display:none;"') + ' class="session">';
									// Session content DIV
									html = html + '<div class="' + (checked ? 'active ' : '');
									$.each(session.level, function(lid,name){
										html = html + 'level-' + lid + ' ';
										levels[lid] = name;
										lastLid = lid;
									});
									$.each(session.theme, function(tid,name){
										html = html + 'theme-' + tid + ' ';
										themes[tid] = name;
										lastTid = tid;
									});
									html = html + '">';
										// Controls DIV
										html = html + '<div class="controls">';
											html = html + '<div class="show-dialog" data-pid="' + pid + '"><span class="fa fa-info-circle"></span></div>';
											html = html + '<div class="like" data-pid="' + pid + '"><span class="fa fa-heart' + (checked ? '' : '-o') + '"></span></div>';
										html = html + '</div>';
										// Title DIV
										html = html + '<div class="title">' + session.title + '</div>';
										html = html + '<div class="speakers">';
											$.each(session.speaker, function(uid,speaker){
												html = html +
													'<div class="speaker">' +
															'<div class="name">' + speaker.name + '</div>' +
													'</div>';
											});
										html = html + '</div>';
										// Details DIV
										html = html + '<div class="details" style="display:none;">' +
											'' +
											'<div class="room">' + data.data.room + ': ' + session.room + '<span class="fa fa-times-circle"></span></div>' +
											'<div class="description">' + session.description + '</div>' +
											'<div class="speakers">';
												$.each(session.speaker, function(uid,speaker){
													html = html +
														'<div class="speaker">' +
															(speaker.photo ? '<div class="avatar"><img src="' + speaker.photo + '"></div>' : '') +
															'<div class="speaker-details">' +
																'<div class="name">' + speaker.name + '</div>' +
																'<div class="organisation">' + speaker.org + '</div>' +
																'<div class="position">' + speaker.title + '</div>' +
															'</div>' +
														'</div>';
												});
											html = html + '</div>';
											html = html + '<div class="levels">';
											$.each(session.level, function(lid,name){
												html = html + '<div class="level">' + (name == '' ? '' : data.data.level + ': ') + name + '</div>';
											});
											html = html + '</div>';
											html = html + '<div class="themes">';
											$.each(session.theme, function(tid,name){
												html = html + '<div class="theme">' + (name == '' ? '' : data.data.theme + ': ') + name + '</div>';
											});
											html = html + '</div>';
										// Details DIV end
										html = html + '</div>';
									// Session content DIV end
									html = html + '</div>';
								// Session DIV end
								html = html + '</div>';
							});
							for ( var i = cols; i < 9; i++ ) {
								html = html + '<div class="session filler"><div class="level-' + lastLid + ' theme-' + lastTid + (lastChecked ? ' active' : '') + '"></div></div>';
							}
						// Row end
						html = html + '</div>';
					});
					// Program end
					html = html + '</div>';
					
					var controls = '<table class="controls"><tbody><tr><td><fieldset data-role="controlgroup" id="program-table-themes">';
					$.each(themes,function(tid,name){
						if ( name != '' ) {
							var checked = data.data.selected.themes[tid] !== undefined && data.data.selected.themes[tid] == '1'; 
							controls = controls + '<input class="toggle' + (checked ? ' selected' : '') + '" type="checkbox" data-mini="true" id="theme-' + tid + '" data-tid="' + tid + '"' + (checked ? ' checked="checked"' : '') + '>' +
													'<label class="theme-' + tid + '" for="theme-' + tid + '">' + name + '</label>';
						}
					});
					controls = controls + '</fieldset></td><td><fieldset data-role="controlgroup" id="program-table-levels">';
					$.each(levels,function(lid,name){
						if ( name != '' ) {
							var checked = data.data.selected.levels[lid] !== undefined && data.data.selected.levels[lid] == '1';
							controls = controls + '<input class="toggle' + (checked ? ' selected' : '') + '" type="checkbox" data-mini="true" id="level-' + lid + '" data-lid="' + lid + '"' + (checked ? ' checked="checked"' : '') + '>' +
													'<label class="level-' + lid + '" for="level-' + lid + '">' + name + '</label>';
						}
					});
					controls = controls + '<fieldset data-role="controlgroup">' +
							'<input type="checkbox" data-mini="true" id="program-likes-only"' + (likes ? ' checked="checked"' : '') + ' class="' + (likes ? ' selected' : '') + '">' +
							'<label for="program-likes-only" id="program-likes-only-label">' + data.data.likebutton + '</label>' +
						'</fieldset>';
					controls = controls + '</td></tr></tbody></table>';
					controls = controls + '<a data-role="button" data-icon="grid" data-iconpos="right" data-theme="b" href="http://backend.learning-summit.nl/programma.pdf" download id="home-button-pdf" class="ui-link ui-btn ui-btn-b ui-icon-grid ui-btn-icon-right ui-shadow ui-corner-all" role="button">' + data.data.downloadpdf + '</a>';
					
					$('#program-table').html(controls + html);
					$('#program-table').trigger('create');
					toggleSessions();
				}
				else {
					var text = [];
					$.each(data.data, function(key, value) {
						text.push(value);
						$('#' + key).addClass('error');
					});
					showError(text.join('<br/>'), data.message);
				}
				$.mobile.loading('hide');
			},
			error: function(jqXHR, statusText, errorThrown) {
				$.mobile.loading('hide');
				showError(errorThrown);
			}
		});
		
		// Clicked a theme checkbox
		$(document).off('click touchstart', '#program-table #program-table-themes label');
		$(document).on('click touchstart', '#program-table #program-table-themes label', function(event) {
			var tid = $(this).next().attr('data-tid');
			if ( $(this).next().is(':checked') ) {
				updatePreference('themes', tid, 0);
				$(this).next().removeClass('selected');
				toggleSessions($(this).next().attr('id'), 0);
			}
			else {
				updatePreference('themes', tid, 1);
				$(this).next().addClass('selected');
				toggleSessions($(this).next().attr('id'), 1);
			}
		});

		// Clicked a level checkbox
		$(document).off('click touchstart', '#program-table #program-table-levels label');
		$(document).on('click touchstart', '#program-table #program-table-levels label', function() {
			var lid = $(this).next().attr('data-lid');
			if ( $(this).next().is(':checked') ) {
				updatePreference('levels', lid, 0);
				$(this).next().removeClass('selected');
				toggleSessions($(this).next().attr('id'), 0);
			}
			else {
				updatePreference('levels', lid, 1);
				$(this).next().addClass('selected');
				toggleSessions($(this).next().attr('id'), 1);
			}
		});

		// Clicked a show my likes checkbox
		$(document).off('click touchstart', '#program-table #program-likes-only-label');
		$(document).on('click touchstart', '#program-table #program-likes-only-label', function(){
			if ( $(this).next().is(':checked') ) {
				$('#program-table .session').show();
				$(this).next().removeClass('selected');
				updatePreference('likes', 0, 0);
			}
			else {
				$('#program-table .session').hide();
				$('#program-table .session > div.active').parent().show();
				$(this).next().addClass('selected');
				updatePreference('likes', 0, 1);
			}
		});

		// Clicked info button
		$(document).off('vclick', '#program-table .show-dialog');
		$(document).on('vclick', '#program-table .show-dialog', function(event){
			event.preventDefault();
			$(this).parent().parent().parent().find('.details').show();
		});
		// Clicked the info window or close link
		$(document).off('vclick', '.session .details');
		$(document).on('vclick', '.session .details', function(){
			$(this).hide();
		});
		
		// Clicked like button
		$(document).off('vclick', '#program-table .like');
		$(document).on('vclick', '#program-table .like', function(){
			if ( $(this).find('span').hasClass('fa-heart-o') ) {
				$(this).find('span').removeClass('fa-heart-o').addClass('fa-heart');
				$(this).parent().parent().addClass('active');
				// If the adjacent div's are fillers, add the class too
				$(this).parent().parent().parent().parent().find('.filler>div').addClass('active');
				addSession($(this).attr('data-pid'));
			}
			else {
				$(this).find('span').removeClass('fa-heart').addClass('fa-heart-o');
				$(this).parent().parent().removeClass('active');
				// If the adjacent div's are fillers, remove the class too
				$(this).parent().parent().parent().parent().find('.filler>div').removeClass('active');
				removeSession($(this).attr('data-pid'));
			}
		});
		// Double clicked session on Android and PC
		$(document).off('dblclick', '#program-table .session');
		$(document).on('dblclick', '#program-table .session', function(){
			if ( $(this).find('.like span').hasClass('fa-heart-o') ) {
				$(this).find('.like span').removeClass('fa-heart-o').addClass('fa-heart');
				$(this).find('div').addClass('active');
				addSession($(this).attr('data-pid'));
			}
			else {
				$(this).find('.like span').removeClass('fa-heart').addClass('fa-heart-o');
				$(this).find('div').removeClass('active');
				removeSession($(this).attr('data-pid'));
			}
		});
		
		/**
		 * Toggle visibility of sessions, based on checked controls.
		 * 
		 * @param string id
		 *   Clicked element ID.
		 * @param integer state
		 *   New state of the clicked element.
		 */
		function toggleSessions(id, state) {
			console.log('TOGGLE');
			var liked = $('#program-table #program-likes-only').hasClass('selected') ? true : false;
			$('#program-table .session').hide();
			var totalChecked = 0;
			$('#program-table .controls .toggle.selected').each(function(ndx, el){
				var cls = $(this).attr('id');
				console.log(cls);
				$.each($('#program-table .session .' + cls), function() {
					if ( $(this).hasClass(cls) ) {
						if ( !liked || (liked && $(this).hasClass('active')) ) {
							$(this).parent().show();
							totalChecked++;
						}
					}
				});
			});
			if ( totalChecked == 0 ) {
				// None checked, show everything.
				$('#program-table .session > div' + (liked ? '.active' : '')).parent().show();
			}
		}
		
		/**
		 * Add a selection in the back end.
		 * 
		 * @param integer pid
		 *   Program ID.
		 * @return void
		 */
		function addSession(pid) {
			updatePreference('sessions', pid, 1);
		}

		/**
		 * Remove a selection in the back end.
		 * 
		 * @param integer pid
		 *   Program ID.
		 * @return void
		 */
		function removeSession(pid) {
			updatePreference('sessions', pid, 0);
		}
		
		/**
		 * Update a preference in the back end.
		 * 
		 * @param string type
		 *   Type of preference to update.
		 * @param integer eid
		 *   Entity ID.
		 * @param integer state
		 *   New state.
		 * @return void
		 */
		function updatePreference(type, eid, state) {
			$.ajax({
				url: HOST + '/' + LANG + '/program/preference',
				crossDomain: true,
				method: 'post',
				dataType: 'json',
				data: {type: type, eid: eid, state: state},
				headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG}
			});
		}
		
		break;
		
	case 'notify':
		/**********************************************************************************************************************
		*
		* NOTIFY PAGE
		*
		**********************************************************************************************************************/

		// Start position of draggable notification element
		var notifyX = 0;
		
		// Get the list of notifications
		$.ajax({
			url: HOST + '/' + LANG + '/notify/list',
			crossDomain: true,
			method: 'get',
			dataType: 'json',
			headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
			success: function(data, textStatus, jqxXHR) {
				if ( data.message == 'OK' ) {
					var options = [];
					$.each(data.data, function(ndx, option) {
						options.push('<div class="notification">' +
										'<div data-entity="' + option.entity + '" data-nid="' + option.nid + '" data-eid="' + option.eid + '" data-cid="' + option.cid + '" data-theme="b" class="ui-btn ui-btn-b ui-shadow ui-corner-all ui-grid-c">' +
											'<div class="ui-block-a">' +
												'<a class="delete" data-theme="b" data-role="button" data-icon="delete" data-iconpos="notext">Delete</a>' +
											'</div>' +
											'<div class="ui-block-b">' +
												'<p class="datetime"><img src="' + (option.avatar != undefined ? option.avatar : 'img/avatar-none.png') + '" class="avatar avatar-small"/>' + option.created + '</p>' +
												'<p>' + option.label + '</p>' +
											'</div>' +
											(option.url.charAt(0) != '?' ?
												'<div class="ui-block-c">' +
													'<a class="go" data-theme="b" data-role="button" data-icon="arrow-r" data-iconpos="notext">Go</a>' +
												'</div>' :
												'<div class="ui-block-none">' +
												'</div>'
											) +
										'</div>' +
									'</div>');
					});
					$('#notification-content').html(options.join(''));
					// Make draggable and handle swiping
					$('#notification-content .notification').draggable({
						axis: 'x',
						start: function(event) {
							notifyX = event.screenX;
						},
						stop: function(event) {
							var x = event.screenX;
							// Dragged left or right?
							if ( x < notifyX - 50 ) {
								// Dragged left
								$(this).find('.ui-block-a').click();
							}
							else {
								if ( x > notifyX + 50 ) {
									// Dragged right or not at all
									$(this).find('.ui-block-c').click();
								}
								else {
									$(this).css('left', 0);
								}
							}
						}
					});
					$("#notification-content a").button().button('refresh');
				}
				else {
					var text = [];
					$.each(data.data, function(key, value) {
						text.push(value);
						$('#' + key).addClass('error');
					});
					showError(text.join('<br/>'), data.message);
				}
				$.mobile.loading('hide');
			},
			error: function(jqXHR, statusText, errorThrown) {
				$.mobile.loading('hide');
				showError(errorThrown);
			}
		});
		
		// Delete notification
		$(document).off('click', '#notify .notification .ui-block-a');
		$(document).on('click', '#notify .notification .ui-block-a', function() {
			notifyDelete($(this).parent(), $(this).parent().attr('data-nid'), 'left');
		});
		// Accept notification
		$(document).off('click', '#notify .notification .ui-block-c');
		$(document).on('click', '#notify .notification .ui-block-c', function() {
			var nid = $(this).parent().attr('data-nid');
			notifyDelete($(this).parent(), nid, 'right');
			$.ajax({
				url: HOST + '/' + LANG + '/notify/accept/' + nid,
				crossDomain: true,
				method: 'post',
				dataType: 'json',
				headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
				success: function(data, textStatus, jqxXHR) {
					if ( data.message == 'OK' ) {
						if ( data.data.message !== undefined ) {
							fertilizeTree();
							$('#header #header-points span').html(data.data.points);
							showMessage(data.data.message, data.data.title, 'notify');
						}
					}
					else {
						var text = [];
						$.each(data.data, function(key, value) {
							text.push(value);
							$('#' + key).addClass('error');
						});
						showError(text.join('<br/>'), data.message);
					}
					$.mobile.loading('hide');
				},
				error: function(jqXHR, statusText, errorThrown) {
					$.mobile.loading('hide');
					showError(errorThrown);
				}
			});
		});
		
		/**
		 * Delete a notification.
		 * 
		 * @param object o
		 *   Div holding the notification.
		 * @param integer nid
		 *   Notification ID.
		 * @param string dir
		 *   Direction to animate ('left' or 'right').
		 */
		function notifyDelete(o, nid, dir) {
			o.animate({
				left: dir == 'left' ? '-100vw' : '100vw'
			},
			500,
			function() {
				o.animate({
					height: 0
				},
				200,
				function() {
					o.remove();
					$.ajax({
						url: HOST + '/' + LANG + '/notify/list/' + nid,
						crossDomain: true,
						method: 'delete',
						dataType: 'json',
						headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG}
					});
					var n = parseInt($('#header .ui-block-b span.notify').html()) - 1;
					if ( n > 0 ) {
						$('#header .ui-block-b span.notify').html(n);
					}
					else {
						$('#header .ui-block-b span.notify').remove();
					}
				});
			});
		}
		break;
		
	case 'discovery':
		/**********************************************************************************************************************
		*
		* DISCOVERY PAGE
		*
		**********************************************************************************************************************/
		
		
		// Load the elements of the game
		$.ajax({
			url: HOST + '/' + LANG + '/discovery/partners',
			crossDomain: true,
			method: 'get',
			dataType: 'json',
			headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
			success: function(data, textStatus, jqxXHR) {
				if ( data.message == 'OK' ) {
					var partners = [];
					var texts = [];
					$.each(data.data.partners, function(ndx, partner) {
						partners[ndx] = {ndx: ndx, name: partner.partner};
						texts[ndx] = {ndx: ndx, text: partner.text};
					});
					html = '';
					// Show partners
					html = html + '<ul id="discovery-partners" class="discovery-column">';
					$.each(partners,function(ndx,name){
						if ( name !== undefined ) {
							html = html + '<li class="partner" data-ndx="' + name.ndx + '">' + name.name + '</li>';
						}
					});
					html = html + '</ul>';
					// Randomize texts and display them
					texts = Util.shuffle(texts);
					html = html + '<ul id="discovery-texts" class="discovery-column">';
					$.each(texts, function(ndx,text){
						if ( text !== undefined ) {
							html = html + '<li class="text" data-ndx="' + text.ndx + '">' + text.text + '</li>';
						}
					});
					html = html + '</ul>';
					$('#discovery-game').html(html);
					// Make sortable and handle swiping
					$('#discovery-texts').sortable({
						revert: true
					});
				}
				else {
					var text = [];
					$.each(data.data, function(key, value) {
						text.push(value);
						$('#' + key).addClass('error');
					});
					showError(text.join('<br/>'), data.message);
				}
				$.mobile.loading('hide');
			},
			error: function(jqXHR, statusText, errorThrown) {
				$.mobile.loading('hide');
				showError(errorThrown);
			}
		});
		
		// Submit button clicked
		$(document).off('click', '#discovery-submit');
		$(document).on('click', '#discovery-submit', function() {
			// Gather ID's
			var ids = [];
			$.each($('#discovery-texts li'), function(ndx, o) {
				ids.push($(this).attr('data-ndx'));
			});
			$.ajax({
				url: HOST + '/' + LANG + '/discovery/partners',
				crossDomain: true,
				method: 'post',
				dataType: 'json',
				data: {ids: ids.join(',')},
				headers: {'Authorization': 'bearer ' + localStorage.getItem('appToken'), 'Accept': 'application/json', 'Accept-Language': LANG},
				success: function(data, textStatus, jqxXHR) {
					if ( data.message == 'OK' ) {
						console.log(data.data);
						showMessage(data.data.message, data.data.title, 'home');
					}
					else {
						var text = [];
						$.each(data.data, function(key, value) {
							text.push(value);
							$('#' + key).addClass('error');
						});
						showError(text.join('<br/>'), data.message);
					}
					$.mobile.loading('hide');
				},
				error: function(jqXHR, statusText, errorThrown) {
					$.mobile.loading('hide');
					showError(errorThrown);
				}
			});
		});
		break;

	case 'profile':
		/**********************************************************************************************************************
		*
		* PROFILE PAGE
		*
		**********************************************************************************************************************/

		// Language switcher
		$('#profile-form-lang').val(LANG);
		$(document).off('change', '#profile-form-lang');
		$(document).on('change', '#profile-form-lang', function() {
			if ( $(this).val() != '--' ) {
				LANG = $(this).val();
				localStorage.setItem('lang', LANG);
				loadPage('profile');
			}
		});
		// Logout button handler
		$(document).off('click', '#profile-form-logout');
		$(document).on('click', '#profile-form-logout', function() {
			localStorage.removeItem('appToken');
			$('body').pagecontainer('change', '#login');
		});
		// View training again
		$(document).on('click', '#profile-button-education', function() {
			carouselRestart(1,1);
		});
		break;
	}
});

/***********************************************************************************************************************
*
* AFTER PAGE HAS TRANSITIONED
*
**********************************************************************************************************************/

$(document).on('pagecontainershow', function(event, ui) {
	switch( ui.toPage[0].id ) {
	case 'login':
		/**********************************************************************************************************************
		*
		* LOGIN PAGE
		*
		**********************************************************************************************************************/

		$('#login-form-userid').focus();
		
		break;
	case 'contacts':
		$('#contacts-list').trigger('create');
	}
});