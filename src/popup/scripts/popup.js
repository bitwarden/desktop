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
                select.focus();
            }
        });

        $('.list-section-item input, .list-section-item select, .list-section-item textarea').focus(function (e) {
            $(this).parent().addClass('active');
        }).blur(function (e) {
            $(this).parent().removeClass('active');
        });
    }

    return self;
}();
