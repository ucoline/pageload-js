pageLoadInit({
    selector: 'a',
    excludeJS: [
        'https://code.jquery.com/jquery-3.6.0.min.js',
        'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
        'https://unpkg.com/nprogress@0.2.0/nprogress.js',
        'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js',
        'page-load.js'
    ],
    excludeElement: [
        '#nprogress',
    ],
    beforeSend: function (href, data) {
        NProgress.start();
    },
    onSuccess: function (href, data, html) {
        NProgress.done();
    },
    onError: function (href, e, data) {
        NProgress.done();
    },
});

$(document).ready(function () {
    $(document).on('click', '.header-custom-link', function () {
        alert('Page 3');
    });

    $('[data-toggle="tooltip"]').tooltip();

    $('[data-owl="basic"]').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 3
            },
            1000: {
                items: 5
            }
        }
    });
});