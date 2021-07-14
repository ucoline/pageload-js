/*
 Page load - jQuery library
 URL: https://github.com/ucoder92/pageload-js
 Version: 1.0.4
 */

var pageLoadConfig = {
    selector: 'a',
    excludeJS: [],
    excludeElement: ['[page-load-exclude="1"]', '[page-load-exclude="true"]'],
    beforeSend: null,
    onLoad: null,
    onSuccess: null,
    onError: null,
}

var pageLoadInit = function (page_load_config) {
    if (page_load_config.selector != undefined && page_load_config.selector != '') {
        pageLoadConfig.selector = page_load_config.selector;
    }

    if (page_load_config.excludeJS != undefined && page_load_config.excludeJS.length > 0) {
        pageLoadConfig.excludeJS = page_load_config.excludeJS;
    }

    if (page_load_config.excludeElement != undefined && page_load_config.excludeElement.length > 0) {
        page_load_config.excludeElement.push('[page-load-exclude="1"]');
        page_load_config.excludeElement.push('[page-load-exclude="true"]');

        pageLoadConfig.excludeElement = page_load_config.excludeElement;
    }

    if (page_load_config.beforeSend != undefined && typeof page_load_config.beforeSend === 'function') {
        pageLoadConfig.beforeSend = page_load_config.beforeSend;
    }

    if (page_load_config.onLoad != undefined && typeof page_load_config.onLoad === 'function') {
        pageLoadConfig.onLoad = page_load_config.onLoad;
    }

    if (page_load_config.onSuccess != undefined && typeof page_load_config.onSuccess === 'function') {
        pageLoadConfig.onSuccess = page_load_config.onSuccess;
    }

    if (page_load_config.onError != undefined && typeof page_load_config.onError === 'function') {
        pageLoadConfig.onError = page_load_config.onError;
    }

    pageLoadRefresh();
};

var pageLoadRefresh = function () {
    var site_url = document.location.origin;

    if (pageLoadConfig.selector != undefined && pageLoadConfig.selector != '') {
        $(pageLoadConfig.selector).on('click', function () {
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
    }
}

var pageLoadFromURL = function (href, data) {
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
            $("html, body").animate({ scrollTop: 0 }, 300);

            if (pageLoadConfig.beforeSend != undefined && pageLoadConfig.beforeSend !== null) {
                pageLoadConfig.beforeSend(href, page_data);
            }
        },
        success: function (html) {
            if (html != undefined && html != '') {
                pageLoadDraw(html, href);
            }

            if (pageLoadConfig.onSuccess != undefined && pageLoadConfig.onSuccess !== null) {
                pageLoadConfig.onSuccess(href, page_data);
            }
        },
        error: function (e) {
            if (pageLoadConfig.onError != undefined && pageLoadConfig.onError !== null) {
                pageLoadConfig.onError(href, page_data);
            }

            pageLoadDraw(e.responseText, href);
        }
    });
}

var pageLoadDraw = function (data, href) {
    var $doc;
    var parser = new DOMParser();

    if (data != undefined && data != '') {
        var docs = parser.parseFromString(data, 'text/html');
        var $doc = $(docs);
    }

    if (pageLoadConfig.onLoad != undefined && pageLoadConfig.onLoad !== null) {
        var onload = pageLoadConfig.onLoad($doc, href);

        if (onload != undefined && onload.length > 0) {
            $doc = onload;
        }
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

        // Set document
        document = parser.parseFromString(data, 'text/html');
        window.history.pushState({ "data": data, "href": href }, $('title').text(), href);

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

        if (pageLoadConfig.excludeElement != undefined && pageLoadConfig.excludeElement.length > 0) {
            $.each(pageLoadConfig.excludeElement, function (i, value) {
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

                    if (disable != undefined && (disable === true || disable == 'true' || disable == '1')) {
                        set = false;
                    } else if (src != undefined && src != '' && pageLoadConfig.excludeJS != undefined && pageLoadConfig.excludeJS.length > 0) {
                        $.each(pageLoadConfig.excludeJS, function (i, name) {
                            if (src.indexOf(name) !== -1) {
                                set = false;
                            }
                        });
                    }
                }

                if (exclude_objects != undefined && exclude_objects.length > 0) {
                    var index = exclude_objects.findIndex(x => x.tag === tagName);

                    if (index > -1) {
                        outerHTML = exclude_objects[index].html;
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
                                    outerHTML = exclude_objects[index].html;
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
        $('body').empty();
        pageLoadInsertHTML(body_outerHTML, document.body);

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
    } else {
        window.location.reload();
    }
}

var pageLoadInsertHTML = function (html, dest, clear = true) {
    if (clear) dest.innerHTML = '';
    let container = document.createElement('div');

    container.innerHTML = html;

    let scripts = container.querySelectorAll('script');
    let nodes = container.childNodes;

    for (let i = 0; i < nodes.length; i++) dest.appendChild(nodes[i].cloneNode(true));

    for (let i = 0; i < scripts.length; i++) {
        let script = document.createElement('script');
        script.type = scripts[i].type || 'text/javascript';

        if (scripts[i].hasAttribute('src')) script.src = scripts[i].src;
        script.innerHTML = scripts[i].innerHTML;

        document.head.appendChild(script);
        document.head.removeChild(script);
    }

    return true;
}

$(document).ready(function () {
    var html = '<!DOCTYPE html>' + $('html')[0].outerHTML;
    window.history.pushState({ "data": html, "href": window.location.href }, $('title').text(), window.location.href);
});

window.onpopstate = function (e) {
    if (e.state) {
        var data = e.state.data;
        pageLoadDraw(data);
    }
};