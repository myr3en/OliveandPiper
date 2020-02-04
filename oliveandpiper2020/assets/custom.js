/*

Envy by WeTheme (http://www.wetheme.com)
Custom JS

*/

(function ($) {

// Responsive tables init

$(document).ready(function() {
	$('.product-description-wrapper table').wrap('<div class="rte__table-wrapper"></div>');
});

// Wow Animation init
$(document).ready(function() {
  new WOW().init();
});

// Mobile Browser Menu

$("select#mobile-menu").on('change', function() {
  window.location = $(this).find("option:selected").val();
});

// FancyBox

$(document).ready(function() {
	$(".fancybox").fancybox();
});

$(document).ready(function() {
	$(".fancybox-instagram").fancybox({
		padding : 0
	});
});

// Login Boxes

$("#forgot-password-box").on('click', function(){
    $("#customer-login").hide();
    $("#recover-password").show();
});

$("#login-box-link").on('click', function(){
	$("#customer-login").show();
	$("#recover-password").hide();
});

$(document).ready(function() {
    if (document.querySelector(".resetSuccessful")) {
        $('#resetSuccess').show();
    }
});

// Drawers

var MOBILE_DRAWER_SIZE = 300,
    DESKTOP_DRAWER_SIZE = 390,
    MOBILE_WIDTH_MAX = 768;

window.slideouts = {};


// Simulate responsiveness of the Drawer component
$(window).on('resize', function () {
    var is_mobile = document.body.clientWidth < MOBILE_WIDTH_MAX;

    // Disable mobile drawer on desktop
    window.slideouts.left._touch = is_mobile;

    if (!window.slideouts.right) {
        // cart slider is disabled
        return;
    }

    // Resize right drawer based on window width
    var slideout = window.slideouts.right,
        padding = (is_mobile) ? MOBILE_DRAWER_SIZE : DESKTOP_DRAWER_SIZE;
    slideout._translateTo = slideout._padding = padding * slideout._orientation;
    if (slideout._opened) {
        var transform = "translateX(" + (padding * slideout._orientation) + "px)";
        slideout.panel.style.webkitTransform = transform;
        slideout.panel.style.transform = transform;
    }
});


function create_drawer(side, panel, menu, hidden_menu, overlay) {
    var padding = MOBILE_DRAWER_SIZE;
    if (side === 'right' && document.body.clientWidth >= MOBILE_WIDTH_MAX) {
        padding = DESKTOP_DRAWER_SIZE;
    }

    var slideout = new Slideout({
        'panel': panel,
        'menu': menu,
        'padding': padding,
        'tolerance': 70,
        'side': side,
        'touch': false
    });
    var dir = (side === 'right') ? -1 : 1;
    window.slideouts[side] = slideout;
    menu.classList.add('slideout-panel-hidden');

    var $overlay = $(overlay);
    overlay.addEventListener('click', slideout.close.bind(slideout));

    // Handle slide to close
    var touch_start = null;
    overlay.addEventListener('touchstart', function (event) {
        if (!slideout.isOpen()) {
            return;
        }
        event.preventDefault();
        touch_start = event.touches[0].pageX;
    });
    overlay.addEventListener('touchmove', function (event) {
        if (!slideout.isOpen()) {
            return;
        }
        var offset = touch_start - event.touches[0].pageX;
        var translate = (dir * padding) - offset;
        if (Math.abs(translate) > padding) {
            translate = (dir * padding);
        }
        panel.style.webkitTransform ='translateX(' + translate + 'px)';
        panel.style.transform ='translateX(' + translate + 'px)';
    });
    overlay.addEventListener('touchend', function (event) {
        if (!slideout.isOpen()) {
            return;
        }
        var offset = touch_start - event.changedTouches[0].pageX;
        if (offset === 0 || Math.abs(offset) > 70) {
            slideout.close(slideout);
        } else {
            panel.style.webkitTransform = 'translateX(' + (dir * padding) + 'px)';
            panel.style.transform = 'translateX(' + (dir * padding) + 'px)';
        }
    });

    slideout.on('beforeopen', function() {
        menu.classList.remove('slideout-panel-hidden');
        if (hidden_menu) {
            hidden_menu.classList.add('slideout-panel-hidden');
        }
        $overlay.fadeIn();
        // document.body.style.overflowY = 'hidden';
        var marginTop = $(window).scrollTop() + 'px';
        panel.style.position = 'fixed';
        panel.style.marginTop = '-' + marginTop;
        // Apply oposite effect to the sticky header
        $('.sticky-header-wrapper.sticky').css({
            'margin-top': marginTop,
            'transform': 'translateY(0)'
        });
    });

    slideout.on('beforeclose', function () {
        $overlay.fadeOut();
        var scrollTop = -parseInt(panel.style.marginTop);
        panel.style.position = '';
        panel.style.marginTop = '';
        $(window).scrollTop(scrollTop);
    });

    slideout.on('close', function() {
        $('.sticky-header-wrapper').css({
            'margin-top': 0,
            'transform': ''
        });
        menu.classList.add('slideout-panel-hidden');
    });
    slideout.on('translate', function(translated) {
        var hidden = false;
        if (translated === 0) {
            hidden = true;
        } else if (side === 'left') {
            hidden = translated <= 0;
        } else if (side === 'right') {
            hidden = translated >= 0;
        }
        menu.classList.toggle('slideout-panel-hidden', hidden);
        if (hidden_menu) {
            hidden_menu.classList.toggle('slideout-panel-hidden', !hidden);
        }
    });

    return slideout;
}

function load_menu_drawer() {

    // Close sliders if they're open
    if (window.slideouts && window.slideouts.left) {
        window.slideouts.left.close();
    }
    if (window.slideouts && window.slideouts.right) {
        window.slideouts.right.close();
    }

    /* Move mobile menu out of section to document body because the slideout
       needs to put it to the sidebar, but it can't be in the body from the beginning
       because it needs section config */
    var body_menu = $('body > #theme-menu');
    var main_body_menu = $('#main-body #theme-menu');
    if (main_body_menu.length > 0) {
        body_menu.remove();
        $('body').append(main_body_menu);
    }

    var main_body = document.querySelector('#main-body');
    var left_menu = document.querySelector('#theme-menu');
    var right_menu = document.querySelector('#cartSlideoutWrapper');
    var overlay = document.querySelector('#slideout-overlay');

    /* Mobile Menu */

    var slideoutLeft = create_drawer('left', main_body, left_menu, right_menu, overlay);

    $('.slide-menu-mobile').off('click').on('click', function() {
        slideoutLeft.toggle();
    });

    $('.mobile-menu-close').on('click', function () {
        slideoutLeft.close();
    });

    // Disable mobile drawer on desktop
    if (document.body.clientWidth >= MOBILE_WIDTH_MAX) {
        slideoutLeft._touch = false;
    }

    // Add events for sidebar manipulation from outside
    $(left_menu)
        .on('mobile:toggle', slideoutLeft.toggle.bind(slideoutLeft))
        .on('mobile:open', slideoutLeft.open.bind(slideoutLeft))
        .on('mobile:close', slideoutLeft.close.bind(slideoutLeft));

    /* Cart */
    if (!right_menu) {
        // Cart drawer is disabled in the settings
        return;
    }
    var slideoutRight = create_drawer('right', main_body, right_menu, left_menu, overlay);

    // Toggle button
    $('.slide-menu-cart').off('click').on('click', function (e) {
        slideoutRight.toggle();
        // prevent non-ajax basket
        e.preventDefault();
        return false;
    });

    $('.cart-menu-close').on('click', function (e) {
        slideoutRight.close();
    });

    // Add events for sidebar manipulation from outside
    $(right_menu)
        .on('cart:toggle', slideoutRight.toggle.bind(slideoutRight))
        .on('cart:open', slideoutRight.open.bind(slideoutRight))
        .on('cart:close', slideoutRight.close.bind(slideoutRight));
}

$(document).ready(load_menu_drawer);
document.addEventListener('shopify:section:load', function (event) {
    if (event.detail.sectionId === 'header') {
        load_menu_drawer();
    } else if (event.detail.sectionId === 'footer') {
        // Shopify doesn't correctly handle scrolling to footer on section change because the section
        // has zero height when it's scrolled to but when it loads it gets out of visible area
        setTimeout(function () {
            // Scroll to the footer element after loading
            document.documentElement.scrollTop = document.body.scrollTop = document.body.clientHeight;
        }, 0);
    }
});

// Google Maps JS

// Set map Variables
var MAP_SELECTOR = '.map-wrapper';
var MAP_API_FAILED = false;
var map_objects = [];

function set_map_error(message, container) {
    if (!container) {
        container = $('.map-section__container');
    }
    container.addClass('hide');
    if (Shopify.designMode) {
        $('<div class="map-container-error"></div>').text(message).appendTo(container.parent().find('.map-section__overlay'));
    }
    container.parent().find('.homepage-map--fallback').removeClass('hide');
}

function maps_resize() {
    // Center map when screensize is changed
    map_objects.forEach(function (map) {
        var currCenter = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(currCenter);
    });
}

function map_init(map_element) {
    var config = {
      zoom: 14
    };

    var section = map_element.dataset.id;
    var colors = map_element.dataset.colors;
    var style = [];
    try {
        style = JSON.parse(document.getElementById('homepage-map--theme--' + section).textContent);
    } catch (e) {
        console.error('Unable to parse theme style:', e);
    }
    var container = document.querySelector('#map-container-' + section);
    if (!container) {
        return;
    }
    var $container = $(container);
    if (MAP_API_FAILED) {
        set_map_error('Google Maps authentication error, API key might be invalid', $container);
    }

    var map = new google.maps.Map(container, {
        zoom: config.zoom,
        styles: style,
        disableDefaultUI: true,
        draggable: false,
        clickableIcons: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        draggableCursor: 'default'
    });
    map_objects.push(map);

    var geocoder = new google.maps.Geocoder();

    geocodeAddress(geocoder, map);

    function geocodeAddress(geocoder, resultsMap) {
        var address = $('#map-container-' + section).data('address-setting');
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });
            } else {
                set_map_error('Error looking up that address', $container);
            }
        });
    }
}

// Google Map JS
function load_googlemaps() {
  var mapElements = document.querySelectorAll(MAP_SELECTOR);
  if (mapElements.length === 0) {
      // No map element on the page, don't load the map API
      return;
  }

  var apiKey = null;
  Array.prototype.forEach.call(mapElements, function (map_element) {
    var section = map_element.dataset.id;
    var elementApiKey = document.querySelector('#apikey-' + section).value;
    if (!elementApiKey) {
        return;
    }
    if (apiKey && elementApiKey && elementApiKey !== apiKey) {
        console.warn('Multiple different Google Maps API keys are not allowed, using only the first one');
        return;
    }
    apiKey = elementApiKey;
  });
  if (!apiKey) {
    console.error('Google Maps API key not provided!');
    set_map_error('Google Maps API key not provided!', null);
    return;
  }

  if (MAP_API_FAILED || !window.google || !window.google.maps || !window.google.maps.Geocoder || !window.google.maps.Map) {
    MAP_API_FAILED = false;
    $.getScript(
        'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&callback=google_maps_loaded'
    );
  } else {
    window.google_maps_loaded();
  }
}

window.google_maps_loaded = function () {
    Array.prototype.forEach.call(document.querySelectorAll(MAP_SELECTOR), map_init);
    $(window).off('resize', maps_resize).on('resize', maps_resize);
}

// Global function called by Google on auth errors.
// Show an auto error message on all map instances.
// eslint-disable-next-line camelcase, no-unused-vars

window.gm_authFailure = function () {
  MAP_API_FAILED = true;
  console.error('Authentication Failure');

  var $container = $('.map-section__container');

  set_map_error('Google Maps authentication error, API key might be invalid', null);
}

document.addEventListener('shopify:section:load', load_googlemaps);

$(document).ready(load_googlemaps);

})(window.wetheme.$);
