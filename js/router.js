var Router = new (function() {
    var routes = new Map();
    var currentRoute = null;
    var params = {};
    var listeners = new Set();
    var beforeHooks = [];
    var afterHooks = [];

    window.addEventListener('popstate', function(e) { _handlePopState(e); });

    function _cleanPath(path) {
        var p = path || '/';
        if (p.charAt(0) !== '/') p = '/' + p;
        if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
        return p;
    }

    function _notify(path, route) {
        listeners.forEach(function(cb) { cb(path, route); });
    }

    async function _render(path, route) {
        currentRoute = path;
        params = route.params || {};

        var content = document.getElementById('main-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(10px)';
            await new Promise(function(r) { setTimeout(r, 150); });
        }

        await route.handler(route.params || {});

        if (content) {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }

        for (var i = 0; i < afterHooks.length; i++) {
            await afterHooks[i](path, route);
        }

        _notify(path, route);
    }

    async function _handlePopState(event) {
        var path = _cleanPath(window.location.pathname);
        var route = match(path);
        if (route) {
            await _render(path, route);
        }
    }

    function match(path) {
        for (var item of routes) {
            var matchResult = path.match(item[1].regex);
            if (matchResult) {
                var routeParams = {};
                item[1].keys.forEach(function(key, i) {
                    routeParams[key] = decodeURIComponent(matchResult[i + 1]);
                });
                return { pattern: item[0], regex: item[1].regex, keys: item[1].keys, handler: item[1].handler, options: item[1].options, params: routeParams };
            }
        }
        return null;
    }

    return {
        addRoute: function(pattern, handler, options) {
            if (options === undefined) options = {};
            var keys = [];
            var regexStr = pattern.replace(/:([^/]+)/g, function(_, key) {
                keys.push(key);
                return '([^/]+)';
            });
            var regex = new RegExp('^' + regexStr + '$');
            routes.set(pattern, { pattern: pattern, regex: regex, keys: keys, handler: handler, options: options });
        },

        use: function(hook) { beforeHooks.push(hook); },

        after: function(hook) { afterHooks.push(hook); },

        match: match,

        navigate: async function(path, replace) {
            if (replace === undefined) replace = false;
            var cleanPath = _cleanPath(path);
            var route = match(cleanPath);
            if (!route) return this.navigate('/');

            for (var i = 0; i < beforeHooks.length; i++) {
                await beforeHooks[i](cleanPath, route);
            }

            if (replace) {
                history.replaceState({ path: cleanPath, time: Date.now() }, '', cleanPath);
            } else {
                history.pushState({ path: cleanPath, time: Date.now() }, '', cleanPath);
            }

            await _render(cleanPath, route);
            return route;
        },

        getCurrentPath: function() {
            return _cleanPath(window.location.pathname);
        },

        onRouteChange: function(callback) {
            listeners.add(callback);
            return function() { listeners.delete(callback); };
        },

        init: function(defaultRoute) {
            if (defaultRoute === undefined) defaultRoute = '/';
            var path = _cleanPath(window.location.pathname);
            var route = match(path);
            if (route) {
                _render(path, route);
            } else {
                this.navigate(defaultRoute, true);
            }
        },

        link: function(path) {
            return "javascript:Router.navigate('" + path + "')";
        },

        getParams: function() {
            return Object.assign({}, params);
        },

        back: function() { history.back(); },

        forward: function() { history.forward(); }
    };
})();

window.Router = Router;
