/*
 Page load - jQuery library
 URL: https://github.com/ucoder92/pageload-js
 Version: 1.0.0
 */

var pageLoadInit = function (page_load_config) {
    var selector = 'a';
    var excludeJS = [];
    var excludeElement = ['[page-load-exclude="1"]', '[page-load-exclude="true"]'];

    var html = $('html')[0].outerHTML;
    var current_url = window.location.href;
    var site_url = document.location.origin;

    if (page_load_config.selector != undefined && page_load_config.selector != '') {
        selector = page_load_config.selector;
    }

    if (page_load_config.excludeJS != undefined && page_load_config.excludeJS.length > 0) {
        excludeJS = page_load_config.excludeJS;
    }

    if (page_load_config.excludeElement != undefined && page_load_config.excludeElement.length > 0) {
        excludeElement = excludeElement.concat(page_load_config.excludeElement);
    }

    window.history.pushState({ "data": html, "href": current_url }, $('title').text(), current_url);

    $(selector).on('click', function () {
        var href = $(this).attr('href');
        var disable = $(this).attr('page-load-disable');
        var run = false;

        if (disable != undefined && (disable == 'true' || disable == '1' || disable === true)) {
            return true;
        }

        if (href != undefined && href != '#' && href != '') {
            var hash = href.charAt(0);
            var parsed_url = '';

            if (hash != '#') {
                var parser = document.createElement('a');

                parser.href = href;
                parsed_url = parser.href;
            }

            if (parsed_url != undefined && parsed_url != '') {
                var url = new URL(parsed_url);

                if (url != undefined && url.origin != undefined && url.origin == site_url) {
                    run = true;
                }
            }
        }

        if (run) {
            pageLoadFromURL(href);
            return false;
        }
    });

    $('form').on('submit', function (e) {
        e.preventDefault();
        var data = $(this).serialize();
        var action = $(this).attr('action');
        var method = $(this).attr('method');

        if (data != undefined && data != '') {
            var url = window.location.href;

            if (action != undefined && action != '') {
                url = action;
            }

            if (method != undefined && method != 'POST') {
                if (url.indexOf("?") > -1) {
                    url = url.substr(0, url.indexOf("?"));
                }

                url = url + '?' + data;
            }

            pageLoadFromURL(url, data);
        }
    });

    window.onpopstate = function (e) {
        if (e.state) {
            var data = e.state.data;
            pageLoad(data);
        }
    };

    function pageLoadFromURL(href, data) {
        window.stop();
        var page_data = {};

        if (data != undefined) {
            page_data = data;
        }

        $.ajax({
            url: href,
            type: 'GET',
            data: page_data,
            beforeSend: function () {
                if (page_load_config.beforeSend != undefined) {
                    page_load_config.beforeSend(href, page_data);
                }
            },
            success: function (html) {
                if (page_load_config.success != undefined) {
                    page_load_config.success(href, page_data, html);
                }

                if (html != undefined && html != '') {
                    pageLoad(html, href);
                }
            },
            error: function (e) {
                if (page_load_config.error != undefined) {
                    page_load_config.error(href, e, page_data);
                }

                pageLoad(e.responseText, href);
            }
        });
    }

    function pageLoad(data, href) {
        var $doc;

        if (data != undefined && data != '') {
            var parser = new DOMParser();
            var docs = parser.parseFromString(data, 'text/html');
            var $doc = $(docs);
        }

        if ($doc != undefined && $doc.length > 0) {
            var $html = $doc.children('html');
            var $head = $html.children('head');
            var $body = $html.children('body');

            var head_objects = [];
            var exclude_objects = [];

            var body_outerHTML = '';
            var head_html = $head.html();
            var head_before_outerHTML = '';

            $('head').children().each(function () {
                var rm = true;
                var $this = $(this);
                var outerHTML = $this.prop('outerHTML');

                if (outerHTML != undefined && outerHTML != '') {
                    var disable = $this.attr('page-load-disable');
                    var index = head_html.indexOf(outerHTML);

                    if (disable != undefined && (disable == 'true' || disable == '1' || disable === true) && index > -1) {
                        rm = false;
                    } else if ($this.is('script')) {
                        var src = $this.attr('src');

                        if (src != undefined && src != '' && index > -1) {
                            rm = false;
                        }
                    } else if ($this.is('link')) {
                        var href = $this.attr('href');

                        if (href != undefined && href != '' && index > -1) {
                            rm = false;
                        }
                    } else if (index > -1) {
                        rm = false;
                    }
                }

                if (rm) {
                    $this.remove();
                } else {
                    head_objects.push({
                        html: outerHTML,
                        element: $this,
                    });
                }
            });

            $head.children().each(function () {
                var $this = $(this);
                var outerHTML = $this.prop('outerHTML');
                var index = head_objects.findIndex(x => x.html === outerHTML);

                if (index < 0 && head_before_outerHTML != undefined && head_before_outerHTML != '') {
                    var beforeIndex = head_objects.findIndex(x => x.html === head_before_outerHTML);

                    if (beforeIndex > -1) {
                        var object = head_objects[beforeIndex];

                        if (object != undefined && object.element != undefined) {
                            $(outerHTML).insertAfter(object.element);

                            head_objects.push({
                                html: outerHTML,
                                element: object.element.next(),
                            });
                        }
                    }
                }

                head_before_outerHTML = outerHTML;
            });

            if (excludeElement != undefined && excludeElement.length > 0) {
                $.each(excludeElement, function (i, value) {
                    var elements = $('body').children(value);

                    if (elements != undefined && elements.length > 0) {
                        elements.each(function () {
                            var outerHTML = $(this).prop('outerHTML');

                            exclude_objects.push({
                                tag: value,
                                html: outerHTML,
                                element: $(this),
                            });
                        });
                    }
                });
            }

            $body.children().each(function () {
                var set = true;
                var $this = $(this);
                var outerHTML = $this.prop('outerHTML');

                if (outerHTML != undefined && outerHTML != '') {
                    var attrs = [];
                    var tagName = $this.prop('tagName').toLowerCase();

                    if ($this.is('script')) {
                        var src = $this.attr('src');
                        var disable = $this.attr('page-load-exclude-js');

                        if (disable != undefined && (disable === true || disable == 'true' || disable == '1') || excludeJS.indexOf(src) != -1) {
                            set = false;
                        }
                    }

                    if (exclude_objects != undefined && exclude_objects.length > 0) {
                        var index = exclude_objects.findIndex(x => x.tag === tagName);

                        if (index > -1) {
                            exclude_objects.splice(index, 1);
                        } else {
                            var attrs = [];

                            $.each(this.attributes, function () {
                                if (this.specified) {
                                    var name = this.name;
                                    var value = this.value;

                                    switch (name) {
                                        case 'id':
                                            if (value != '') {
                                                attrs.push('#' + value);
                                            }
                                            break;
                                        case 'class':
                                            if (value != '') {
                                                var list = value.split(" ");

                                                $.each(list, function (i, v) {
                                                    attrs.push('.' + v);
                                                });
                                            }
                                            break;
                                        default:
                                            attrs.push('[' + name + ']');

                                            if (value != '') {
                                                attrs.push('[' + name + '="' + value + '"]');
                                                attrs.push("[" + name + "='" + value + "']");
                                            }

                                            break;
                                    }
                                }
                            });

                            if (attrs.length > 0) {
                                $.each(attrs, function (i, value) {
                                    var index = exclude_objects.findIndex(x => x.tag === value);

                                    if (index > -1) {
                                        exclude_objects.splice(index, 1);
                                    }
                                });
                            }
                        }
                    }
                }

                if (set) {
                    body_outerHTML += outerHTML;
                }
            });

            if (exclude_objects != undefined && exclude_objects.length > 0) {
                $.each(exclude_objects, function (i, item) {
                    var html = item.html;

                    if (html != undefined && html != '') {
                        body_outerHTML += html;
                    }
                });
            }

            // Set to html
            $('body').html(body_outerHTML);

            // Remove attrs
            while ($('html')[0].attributes.length > 0) {
                $('html')[0].removeAttributeNode($('html')[0].attributes[0]);
            }

            if ($html[0].attributes.length > 0) {
                $.each($html[0].attributes, function (i, value) {
                    if (this.specified && this.name != undefined) {
                        var name = this.name;
                        var value = this.value;

                        if (value != undefined) {
                            $('html').attr(name, value);
                        } else {
                            $('html').attr(name, '');
                        }
                    }
                });
            }

            while ($('body')[0].attributes.length > 0) {
                $('body')[0].removeAttributeNode($('body')[0].attributes[0]);
            }

            if ($body[0].attributes.length > 0) {
                $.each($body[0].attributes, function (i, value) {
                    if (this.specified && this.name != undefined) {
                        var name = this.name;
                        var value = this.value;

                        if (value != undefined) {
                            $('body').attr(name, value);
                        } else {
                            $('body').attr(name, '');
                        }
                    }
                });
            }

            // Set document
            document = parser.parseFromString(data, 'text/html');
            window.history.replaceState({ "data": data, "href": href }, $('title').text(), href);
        } else {
            window.location.reload();
        }
    }
};