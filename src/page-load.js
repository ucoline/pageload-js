/*
 Page load - jQuery library
 URL: https://github.com/ucoder92/pageload-js
 Version: 1.1.7
 */

var _pageLoadConfigs = {
    selector: 'a',
    formSelector: 'form',
    excludeJS: [],
    excludeElement: ['[page-load-exclude="1"]', '[page-load-exclude="true"]'],
    beforeSend: null,
    onClick: null,
    onLoad: null,
    onSuccess: null,
    onError: null,
    onPopstate: null,
}

var pageLoadInit = function (page_load_config) {
    if (page_load_config.selector != undefined && page_load_config.selector != '') {
        _pageLoadConfigs.selector = page_load_config.selector;
    }

    if (page_load_config.formSelector != undefined && page_load_config.formSelector != '') {
        _pageLoadConfigs.formSelector = page_load_config.formSelector;
    }

    if (page_load_config.excludeJS != undefined && page_load_config.excludeJS.length > 0) {
        _pageLoadConfigs.excludeJS = page_load_config.excludeJS;
    }

    if (page_load_config.excludeElement != undefined && page_load_config.excludeElement.length > 0) {
        page_load_config.excludeElement.push('[page-load-exclude="1"]');
        page_load_config.excludeElement.push('[page-load-exclude="true"]');

        _pageLoadConfigs.excludeElement = page_load_config.excludeElement;
    }

    if (page_load_config.beforeSend != undefined && typeof page_load_config.beforeSend === 'function') {
        _pageLoadConfigs.beforeSend = page_load_config.beforeSend;
    }

    if (page_load_config.onClick != undefined && typeof page_load_config.onClick === 'function') {
        _pageLoadConfigs.onClick = page_load_config.onClick;
    }

    if (page_load_config.onLoad != undefined && typeof page_load_config.onLoad === 'function') {
        _pageLoadConfigs.onLoad = page_load_config.onLoad;
    }

    if (page_load_config.onSuccess != undefined && typeof page_load_config.onSuccess === 'function') {
        _pageLoadConfigs.onSuccess = page_load_config.onSuccess;
    }

    if (page_load_config.onError != undefined && typeof page_load_config.onError === 'function') {
        _pageLoadConfigs.onError = page_load_config.onError;
    }

    if (page_load_config.onPopstate != undefined && typeof page_load_config.onPopstate === 'function') {
        _pageLoadConfigs.onPopstate = page_load_config.onPopstate;
    }
};

(function ($) {
    $(document).ready(function () {
        var url = window.location.href;
        var html = '<!DOCTYPE html>' + "\r\n" + $('html')[0].outerHTML;
        window.history.pushState({ "data": html, "href": url }, "", url);

        pageLoadRefresh();
    });

    window.onpopstate = function (e) {
        if (e.state != undefined) {
            var data = e.state.data;
            var href = e.state.href;

            if (data != undefined && data != '' && href != undefined && href != '') {
                pageLoadDraw(data, href, false);
            }
        }

        if (_pageLoadConfigs.onPopstate != undefined && _pageLoadConfigs.onPopstate !== null) {
            _pageLoadConfigs.onPopstate(e);
        }
    };

    var pageLoadRefresh = function () {
        var location_host = window.location.host;

        if (_pageLoadConfigs.selector != undefined && _pageLoadConfigs.selector != '') {
            $(document).on('click', _pageLoadConfigs.selector, function () {
                var href = $(this).attr('href');
                var disable = $(this).attr('page-load-disable');
                var target = $(this).attr('target');

                $(this).attr('page-load-click', true);

                if (_pageLoadConfigs.onClick != undefined && _pageLoadConfigs.onClick !== null) {
                    _pageLoadConfigs.onClick($(this), href);
                }

                if (disable != undefined && (disable == 'true' || disable == '1' || disable === true)) {
                    return true;
                }

                if (target != undefined && target.toLowerCase() == '_blank') {
                    return true;
                }

                if (href != undefined && href != '#' && href != '') {
                    var parsed_url = '';
                    var hash = href.charAt(0);

                    if (hash != '#') {
                        var parser = document.createElement('a');

                        parser.href = href;
                        parsed_url = parser.href;
                    }

                    if (parsed_url != undefined && parsed_url != '') {
                        var run = false;
                        var url = new URL(parsed_url);

                        if (url != undefined) {
                            var ext = extFromURL(url.pathname);
                            var url_host = url.host.replace('www.', '');
                            var site_host = location_host.replace('www.', '');

                            if (ext != undefined && ext != '') {
                                run = false;
                            } else if (url_host == site_host) {
                                run = true;
                            }
                        }

                        if (run) {
                            var filtered_url = window.location.protocol + '//' + window.location.host + url.pathname + url.search;
                            pageLoadFromURL(filtered_url);
                            return false;
                        }
                    }
                }
            });
        }

        if (_pageLoadConfigs.formSelector != undefined && _pageLoadConfigs.formSelector != '') {
            $(document).on('submit', _pageLoadConfigs.formSelector, function (e) {
                e.preventDefault();

                var form = $(this);
                var data = form.serializeArray();
                var form_url = form.attr('action');
                var form_method = form.attr('method');

                var method = 'GET';
                var url = window.location.href;

                if (form_url != undefined && form_url != '') {
                    url = form_url;
                }

                if (form_method != undefined && form_method != '') {
                    method = form_method;
                }

                if (form_url != '') {
                    pageLoadFromURL(url, data, method);
                }
            });
        }
    }

    var pageLoadFromURL = function (href, data, method) {
        var page_data;
        var filtered_url;

        if (data != undefined) {
            page_data = data;
        }

        if (method != undefined && method != '') {
            type = method;
        } else {
            type = 'GET';
        }

        if (href != undefined && href != '') {
            window.stop();
            var url = new URL(href);
            var host = window.location.host;

            if (type == 'GET' && page_data != undefined && page_data !== null) {
                var url_host = url.host.replace('www.', '');
                var site_host = host.replace('www.', '');

                if (typeof page_data === 'string' && page_data != '') {
                    page_data = new URLSearchParams(page_data);
                }

                if ($.isArray(page_data)) {
                    $.each(page_data, function (i, item) {
                        if (item.value != undefined && item.value != '') {
                            url.searchParams.set(item.name, item.value);
                        } else {
                            url.searchParams.delete(item.name);
                        }
                    });
                } else if (typeof page_data === 'object') {
                    $.each(page_data, function (key, value) {
                        if (value != undefined && value != '') {
                            url.searchParams.set(key, value);
                        } else {
                            url.searchParams.delete(key);
                        }
                    });
                }
            }

            if (site_host == url_host) {
                filtered_url = url.href;
            }
        }

        if (filtered_url != undefined && filtered_url != '') {
            $.ajax({
                url: href,
                type: type,
                data: page_data,
                beforeSend: function () {
                    $("html, body").animate({ scrollTop: 0 }, 300);

                    if (_pageLoadConfigs.beforeSend != undefined && _pageLoadConfigs.beforeSend !== null) {
                        _pageLoadConfigs.beforeSend(filtered_url, page_data);
                    }
                },
                success: function (html) {
                    if (html != undefined && html != '') {
                        pageLoadDraw(html, filtered_url, true);
                    }

                    if (_pageLoadConfigs.onSuccess != undefined && _pageLoadConfigs.onSuccess !== null) {
                        _pageLoadConfigs.onSuccess(filtered_url, page_data, html);
                    }
                },
                error: function (e) {
                    pageLoadDraw(e.responseText, filtered_url, true);

                    if (_pageLoadConfigs.onError != undefined && _pageLoadConfigs.onError !== null) {
                        _pageLoadConfigs.onError(filtered_url, e, page_data);
                    }
                }
            });
        }
    }

    var pageLoadDraw = function (data, href, pushState) {
        var $doc;
        var parser = new DOMParser();

        if (data != undefined && data != '') {
            var docs = parser.parseFromString(data, 'text/html');
            var $doc = $(docs);
        }

        if (_pageLoadConfigs.onLoad != undefined && _pageLoadConfigs.onLoad !== null) {
            var onload = _pageLoadConfigs.onLoad($doc, href);

            if (onload != undefined && onload.length > 0) {
                $doc = onload;
            }
        }

        if (pushState != undefined && pushState) {
            window.history.pushState({ "data": data, "href": href }, "", href);
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

            // Remove events
            $(document).off();
            $(document.body).off();

            // Refresh page load
            pageLoadRefresh();

            // Set document
            document = parser.parseFromString(data, 'text/html');

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

            if (_pageLoadConfigs.excludeElement != undefined && _pageLoadConfigs.excludeElement.length > 0) {
                $.each(_pageLoadConfigs.excludeElement, function (i, value) {
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
                        } else if (src != undefined && src != '' && _pageLoadConfigs.excludeJS != undefined && _pageLoadConfigs.excludeJS.length > 0) {
                            $.each(_pageLoadConfigs.excludeJS, function (i, name) {
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

            // Empty body
            $('body').empty();

            // Insert body html
            insertHTML(body_outerHTML, document.body);

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

    var insertHTML = function (html, dest, clear = true) {
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

    var extFromURL = function (url) {
        var extStart = url.indexOf('.', url.lastIndexOf('/') + 1);
        if (extStart == -1) return false;
        var ext = url.substr(extStart + 1),
            extEnd = ext.search(/$|[?#]/);
        return ext.substring(0, extEnd);
    }
})(jQuery);