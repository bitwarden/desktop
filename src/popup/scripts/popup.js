var popupUtils = function () {
    var self = this;

    self.initListSectionItemListeners = function () {
        $('.list-section-item').click(function (e) {
            var text = $(this).find('input, textarea').not('input[type="checkbox"], input[type="radio"], input[type="hidden"]');
            var checkbox = $(this).find('input[type="checkbox"]');
            var select = $(this).find('select');

            if (text.length > 0 && e.target === text[0]) {
                return;
            }
            if (checkbox.length > 0 && e.target === checkbox[0]) {
                return;
            }
            if (select.length > 0 && e.target === select[0]) {
                return;
            }

            e.preventDefault();

            if (text.length > 0) {
                text.focus();
            }
            else if (checkbox.length > 0) {
                checkbox.prop('checked', !checkbox.is(':checked'));
                if (angular) {
                    angular.element(checkbox[0]).triggerHandler('click');
                }
            }
            else if (select.length > 0) {
                select.openSelect();
            }
        });
    }

    return self;
}();


// ref: http://stackoverflow.com/questions/19432610/jquery-open-select-by-button
(function ($) {
    "use strict";
    $.fn.openSelect = function () {
        return this.each(function (index, el) {
            $(el).focus();
            if (document.createEvent) {
                var event = document.createEvent("MouseEvents");
                event.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(event);
            }
            else if (element.fireEvent) {
                el.fireEvent("onmousedown");
            }
        });
    }
}(jQuery));
