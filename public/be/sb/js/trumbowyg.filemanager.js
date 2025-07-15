(function ($) {
    'use strict';

    function buildButtonIcon() {
        if ($("#trumbowyg-filemanager").length > 0) {
            return;
        }
        const iconWrap = $(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        iconWrap.addClass("trumbowyg-icons");
        iconWrap.html(`
            <symbol id="trumbowyg-filemanager" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 21C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5H20C20.5523 5 21 5.44772 21 6V9H4V18.996L6 11H22.5L20.1894 20.2425C20.0781 20.6877 19.6781 21 19.2192 21H3Z"/>
            </symbol>
        `).appendTo(document.body);
    }

    $.extend(true, $.trumbowyg, {
        langs: {
            en: {
                filemanager: 'File Manager'
            },
            id: {
                filemanager: 'Manajer File'
            }
        },
        plugins: {
            filemanager: {
                init: function (trumbowyg) {
                    buildButtonIcon();
                    trumbowyg.addBtnDef('filemanager', {
                        fn: function () {
                            window.trumbowygTarget = trumbowyg;
                            const subjectId  = trumbowyg.$c?.attr('data-subject-id');
                            loadFileManager(subjectId);
                            const modal = new bootstrap.Modal(document.getElementById('fileManagerModal'));
                            window.modalFileManager = modal;
                            modal.show();
                        },
                        title: trumbowyg.lang.fileManager,
                    });
                },
            }
        }
    })
})(jQuery);