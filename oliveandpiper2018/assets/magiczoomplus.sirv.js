var SirvOptions = { autostart: false };

var $lockMZUpdate = false, $firstImageIsVideo = false;

mzOptions = mzOptions || {};
mzOptions.onUpdate = function() {
    if (!$lockMZUpdate) {
        mtHighlightActiveSelector();
    }
    $lockMZUpdate = false;
};
var mtZoomIsReady = false;
mzOptions.onZoomReady = function(id) {
    mtZoomIsReady = true;
    if (!$firstImageIsVideo) {
        mtHighlightActiveSelector();
    }
}

function mtIfZoomReady(fnc) {
    if (!mtZoomIsReady) {
        setTimeout(function() {
            mtIfZoomReady(fnc);
        }, 250);
        return;
    }
    fnc();
}

function mtInitSelectors(selector) {
    jQuery(selector).on('click',function(e) {
        var el = jQuery(this);
        if (el.attr('data-slide-id') == 'spin') {
            var spinObj = document.getElementById('sirv-spin');
            if (typeof Sirv != 'undefined' && !Sirv.exists(spinObj)) {
                Sirv.start(spinObj);
            }
        }
        if ( jQuery('.MagicToolboxContainer .MagicToolboxSlide.active-magic-slide iframe').length ==1 ) {
          jQuery('.MagicToolboxContainer .MagicToolboxSlide.active-magic-slide iframe')[0].src = jQuery('.MagicToolboxContainer .MagicToolboxSlide.active-magic-slide iframe')[0].src;
        }
        jQuery('.MagicToolboxContainer .MagicToolboxSlide').removeClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSlide[data-slide-id="' + el.attr('data-slide-id') + '"]').addClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a').removeClass('active-magic-selector mz-thumb-selected');
        el.addClass('active-magic-selector mz-thumb-selected');
        e.preventDefault();
    });
}

function mtInitVideoSelectors() {
    jQuery('.MagicToolboxSlides div[data-video-url]').each(function(){
        var regex_youtube_short = /https?:\/\/youtu\.be\/([^\/]{1,})\/?/gm,
            regex_youtube_full = /https?:\/\/www\.youtube\.com\/watch\?v=(.{1,})/gm,
            regex_youtube_embed = /https?:\/\/www\.youtube\.com\/embed\/(.{1,})/gm,
            regex_vimeo = /https?:\/\/vimeo\.com\/(.{1,})/gm,
            video_id, video_type;
        var m = regex_youtube_short.exec(jQuery(this).attr('data-video-url'));
        if (m) {
            video_id = m[1];
            video_type = 'youtube';
        } else {
            var m = regex_youtube_full.exec(jQuery(this).attr('data-video-url'));
            if (m) {
                video_id = m[1];
                video_type = 'youtube';
            } else {
                var m = regex_youtube_embed.exec(jQuery(this).attr('data-video-url'));
                if (m) {
                    video_id = m[1];
                    video_type = 'youtube';
                } else {
                    var m = regex_vimeo.exec(jQuery(this).attr('data-video-url'));
                    if (m) {
                        video_id = m[1];
                        video_type = 'vimeo';
                    }
                }  
            }
        }
        if (video_type=='youtube') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="https://www.youtube.com/embed/'+video_id+'" frameborder="0" allowfullscreen></iframe></div>');
        } else if (video_type=='vimeo') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="https://player.vimeo.com/video/'+video_id+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>');
        } else {
            jQuery('div[data-slide-id="'+jQuery(this).attr('data-slide-id')+'"],a[data-slide-id="'+jQuery(this).attr('data-slide-id')+'"]').remove();
        }       
    })
}

function mtHighlightActiveSelector() {
    if (typeof jQuery == 'undefined') {
      return;
    }
    jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a').removeClass('active-magic-selector');
    jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a.mz-thumb-selected').addClass('active-magic-selector');
}

function mtGetMaxSizes() {
    var $maxWidth = $maxHeight = 1;
    jQuery('.MagicToolboxSelectorsContainer a > img').each(function(){
        var img = jQuery(this);
        if (img.is(':visible')) {
            $maxHeight = Math.max($maxHeight, img.height());
            $maxWidth = Math.max($maxWidth, img.width());
        }
    });
    return {'width': $maxWidth, 'height': $maxHeight};
}

function mtInitSirv() {

    if(typeof(SirvID) == 'undefined' || SirvID == '') {
        initMagicScroll();
        return;
    }
  
    if (SirvSpinPosition == 'first') {
        SirvOptions = { autostart: true };
    }
  

    var sirv = document.createElement('script');
    sirv.type = 'text/javascript';
    sirv.async = true;
    sirv.src = document.location.protocol.replace('file:', 'http:') + '//scripts.sirv.com/sirv.js';
    document.getElementsByTagName('script')[0].parentNode.appendChild(sirv);

    var spinURL = document.location.protocol.replace('file:', 'https:') + '//' + SirvID + '.sirv.com/' + SirvSpinsPath.replace(/{product\-id}/g, SirvProductID).replace(/{product\-sku}/g, SirvProductSKU);

    jQuery.ajax({
        url: spinURL,
        dataType: 'jsonp',
        cache: true,
        timeout : 4000,
        error : function(jqXHR, textStatus, errorThrown) {
            initMagicScroll();
        },
        success: function(data, textStatus, jqXHR) {
            mtInitSirvIcon(spinURL);
        },
    });
  
    for (var i in SirvVariants) {
        var v_spinURL = document.location.protocol.replace('file:', 'http:')+'//'+SirvID+'.sirv.com/'+SirvSpinsPath.replace(/{product\-id}/g, SirvProductID+'-'+i);
        jQuery.ajax({
            url: v_spinURL,
            dataType: "jsonp",
            'cache': 'false',
            timeout : 4000,
            spinID: i,
            error : function() { SirvVariants[this.spinID] = false; },
            success: function( data ) {
                SirvVariants[this.spinID] = this.url.replace(/\?callback.*/gm,'');
            }  
        });
    }
    
}

function initMagicScroll() {
    if (jQuery('#msc-selectors-container').length) {
        MagicScroll.start();
    }
}

function mtInitArrows() {
    jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').on('click touchstart', function(e){
        var $selectorsContainer = jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer'),
            $currentSelector = $selectorsContainer.find('a.active-magic-selector'),
            $newSelector = false,
            $useScroll = jQuery('#msc-selectors-container').length,
            $forward = jQuery(this).hasClass('magic-next'),
            $mscItem, $mscCurItemId, $mscNewItemId;

            if ($useScroll) {
                $mscItem = $currentSelector.parent();
                $mscCurItemId = $mscItem.attr('data-item');
                $mscItem = $forward ? $mscItem.next() : $mscItem.prev();
                if (!$mscItem.length) {
                    $mscItem = $selectorsContainer.find('div[data-item='+$mscCurItemId+']');
                    $mscItem = $forward ? $mscItem.first().next() : $mscItem.last().prev();
                    if (!$mscItem.length) {
                        //NOTE: carousel, cover-flow
                        $mscItem = $forward ? $selectorsContainer.find('.mcs-item:first') : $selectorsContainer.find('.mcs-item:last');
                        if (!$mscItem.length) {
                            e.preventDefault();
                            return;
                        }
                    }
                }
                $newSelector = $mscItem.find('a');
                $mscNewItemId = $mscItem.attr('data-item');
                $mscNewItemId = parseInt($mscNewItemId, 10);
                MagicScroll.jump('msc-selectors-container', $mscNewItemId);
            } else {
                $newSelector = $forward ? $currentSelector.next('a') : $currentSelector.prev('a');
                if (!$newSelector.length) {
                    $newSelector = $forward ? $selectorsContainer.find('a:first') : $selectorsContainer.find('a:last');
                }
            }
      
        if ($newSelector.length) {
            $newSelector.trigger('click');
            if ($newSelector.hasClass('mz-thumb')) {
                $lockMZUpdate = true;
                MagicZoom.switchTo(jQuery('a.MagicZoomPlus').attr('id'), $newSelector[0]);
            }
        }
        e.preventDefault();
    });
}

function mtInitVariants() {
    if (window.slate && slate.Variants && slate.Variants.prototype._updateImages) {
        slate.Variants.prototype._updateImagesOriginal = slate.Variants.prototype._updateImages;
        slate.Variants.prototype._updateImages = function(variant) {
            var variantImage = variant.featured_image || {};
            var currentVariantImage = this.currentVariant.featured_image || {};
          
            if (typeof SirvVariants != 'undefined') {
                if (typeof SirvVariants[variant.id] != 'undefined' && typeof SirvVariants[variant.id] == 'string') {
                    mtShowSirvVariant(variant.id);
                } else {
                    if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
                        return;
                    }
                    var largeImage = variantImage.src;
                    var iSize = theme.Images.imageSize(jQuery('a.MagicZoomPlus img').first().attr('src'));
                    var smallImage = theme.Images.getSizedImageUrl(largeImage, iSize);
                    if (variantImage.product_id == SirvProductID) {
                        mtIfZoomReady(function(){
                            mtSwitchImage(largeImage, smallImage);
                        });
                    }
                }
            }
            return this._updateImagesOriginal.apply(this, arguments);
        };
    }

    if (Shopify.OptionSelectors && Shopify.OptionSelectors.prototype.updateSelectors) {
        Shopify.OptionSelectors.prototype.updateSelectorsOriginal = Shopify.OptionSelectors.prototype.updateSelectors;
        Shopify.OptionSelectors.prototype.updateSelectors = function(index, option) {
            var values = this.selectedValues(),
                variant = this.product.getVariant(values);
            if (variant && typeof SirvVariants != 'undefined') {
              
                if (typeof SirvVariants != 'undefined' && typeof SirvVariants[variant.id] != 'undefined' && typeof SirvVariants[variant.id] == 'string') {
                    mtShowSirvVariant(variant.id);
                } else {
                    var featuredImage = variant.featured_image;
                    if (featuredImage) {
                        var largeImage = featuredImage.src;
                        var iSize = Shopify.Image.imageSize(jQuery('a.MagicZoomPlus img').first().attr('src'));
                        var smallImage = Shopify.Image.getSizedImageUrl(largeImage, iSize);
                        if (featuredImage.product_id == SirvProductID) {
                            mtIfZoomReady(function(){
                                mtSwitchImage(largeImage, smallImage);
                            });
                        }
                    }
                }
            }
            return this.updateSelectorsOriginal.apply(this, arguments);
        }
    }
}

function mtInitSirvIcon(spinURL) {
    jQuery('.MagicToolboxSlides').append(
        '<div data-slide-id="spin" class="MagicToolboxSlide"><div class="Sirv" id="sirv-spin" data-src="' + spinURL + '"></div></div>'
    );

    jQuery('.MagicToolboxContainer').removeClass('no-thumbnails');
    jQuery('.MagicToolboxSelectorsContainer').show();

    jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').show();

    var sizes = mtGetMaxSizes();

    if (SirvSpinPosition == 'last') {
        jQuery('.MagicToolboxSelectorsContainer a:last').after(
            ' <a data-slide-id="spin" href="#"><img id="SirvIcon" style="display:none;" src="' + SirvIconURL + '"/></a>'
        );
    } else {
        jQuery('.MagicToolboxSelectorsContainer a:first').before(
            ' <a data-slide-id="spin" href="#"><img id="SirvIcon" style="display:none;" src="' + SirvIconURL + '"/></a>'
        );
    }
  
    if (jQuery('.MagicToolboxContainer').hasClass('layout-bottom')) {
        jQuery('#SirvIcon').css('height', sizes.height + 'px').show();
    } else {
        jQuery('#SirvIcon').css('width', sizes.width + 'px').show();
    }

    mtInitSelectors('.MagicToolboxSelectorsContainer a[data-slide-id="spin"]');

    if (SirvSpinPosition == 'first') {
      jQuery('.MagicToolboxSelectorsContainer a[data-slide-id="spin"]').trigger('click');
    }
  
    initMagicScroll();
}

function mtShowSirvVariant(variant_id) {
    if (jQuery('#SirvIcon').length==0) {
        var $useScroll = jQuery('#msc-selectors-container').length;
        if ($useScroll) {
            MagicScroll.stop();
        }
        mtInitSirvIcon(SirvVariants[variant_id]);
    }  
    if (typeof Sirv != 'undefined') {
        Sirv.stop();
    }      
    jQuery('div[data-slide-id="spin"]').html('<div class="Sirv" id="sirv-spin" data-src="' + SirvVariants[variant_id] + '"></div>');
    jQuery('a[data-slide-id="spin"]').trigger('click');    
}

function mtSwitchImage(largeImage, smallImage) {
    var activeSlide = jQuery('.MagicToolboxContainer .active-magic-slide');
    if (activeSlide.attr('data-slide-id') == 'spin') {
        activeSlide.removeClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSlide[data-slide-id="zoom"]').addClass('active-magic-slide');
    }
    if (jQuery('.mz-lens').length == 0) {
        mtHighlightActiveSelector();
        jQuery('a.MagicZoomPlus').attr('href', largeImage)
        jQuery('a.MagicZoomPlus img').first().attr('src', smallImage);
    } else {
        MagicZoom.update(jQuery('a.MagicZoomPlus').attr('id'), largeImage, smallImage);
    }
}

function mtOnDomReady(fnc) {
    if (typeof(jQuery) == 'undefined') {
        setTimeout(function() {
            mtOnDomReady(fnc);
        }, 250);
        return;
    }
    jQuery(document).ready(fnc);
}

mtOnDomReady(function() {

    if (jQuery('#admin_bar_iframe').length) {
        jQuery(document.body).append(
            '<style type="text/css">.mz-zoom-window { margin-top: -' + jQuery('#admin_bar_iframe').height() + 'px; </style>'
        );
    }
  
    mtInitVideoSelectors('.MagicToolboxSelectorsContainer a');

    mtInitSelectors('.MagicToolboxSelectorsContainer a');

    var $firstVideoSelector = jQuery('[data-slide-num="0"][data-video-url]');
    if ($firstVideoSelector.length) {
      jQuery('a[data-slide-id="'+$firstVideoSelector.attr('data-slide-id')+'"]').trigger('click');
      $firstImageIsVideo = true;      
    }

    mtInitSirv();

    mtInitArrows();

    mtInitVariants();

});
