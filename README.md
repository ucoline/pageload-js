# Page load

Load pages by URL without refreshing the page. Works only for the current domain and subdomains.

This library requires [jQuery](https://jquery.com/download/). Make sure you have it before starting.

### Requirements

- [jQuery](https://jquery.com/download/)

### Before start

After including the `page-load.min.js` file in the project, you need to call `pageLoadInit()`, and everything seems to be ready, but this is not enough. I need a **preloader** to show that the page is loading while **pageLoad** is getting and loading the page. In my case, I used the favorite library [NProgress](https://ricostacruz.com/nprogress/). 

### Init script

After including **NProgress** loader to the project, create a **scripts.js** file and call the `pageLoadInit()` function:

```js
pageLoadInit({
    selector: 'a',
    excludeJS: [
        'https://code.jquery.com/jquery-3.6.0.min.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js',
        'owl.carousel.min.js',
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
    }
});
```

### Configurations

You can use some useful configurations to customize the library.

```js
pageLoadInit({
    // Write configurations here
});
```

Below is a complete list of configurations

#### Selector

Select an item to call the function on click:

`selector: 'a'`

*You can give tag name, #myid, .my-class and etc.*

*By default: `'a'`*

--

#### Exclude JS

Every time the page is loaded we don't want to reload any js libraries. This is why we use **excludeJS** to exclude some of them.

`excludeJS: []`

*You can give in array the src of the js library*

*By default: `[]`*

--

#### Exclude element

If you have a div or any tag that you want to keep on page load then use **excludeElement**.

`excludeElement: []`

*You can give in array the tag name, #myid, .my-class and etc.*

*By default: `[]`*

--

#### Event: before send

If you want to do some magic things *before submitting* the request.

```js
beforeSend: function (href, data) {
    // your code...
}
```

--

#### Event: on load

If you want to do some magical things on a *on load* request.

```js
onLoad: function (html, href) {
    var doc = href;
    return doc;
}
```

--

#### Event: success

If you want to do some magical things on a *success* request.

```js
onSuccess: function (href, html, data) {
    // your code...
}
```

--

#### Event: error

If you want to do some magical things on a *error* request.

```js
onError: function (href, e, data) {
    // your code...
}
```