function std() {
    window.stdurl = function(url) {
        if (window.location.hostname === 'localhost') {
            url = new URL(url, 'https://api.segmentanythingservice.com');
        } else {
            try {
                url = new URL(url);
            } catch (err) {
                url = new URL(url, window.location.origin.replace('https://', 'https://api.'));
            }
        }

        return url;
    }

    /**
     * Standardize interactions with the backend API
     *
     * @param {URL|String} url      - Full URL or API fragment to request
     * @param {Object} [opts={}]    - Options
     */
    window.std = async function(url, opts = {}) {
        url = window.stdurl(url)

        try {
            if (!opts.headers) opts.headers = {};

            if (!(opts.body instanceof FormData) && typeof opts.body === 'object' && !opts.headers['Content-Type']) {
                opts.body = JSON.stringify(opts.body);
                opts.headers['Content-Type'] = 'application/json';
            }

            if (localStorage.token && !opts.headers.Authorization) {
                opts.headers['Authorization'] = 'Bearer ' + localStorage.token;
            }

            const res = await fetch(url, opts);

            let bdy = {};
            if ((res.status < 200 || res.status >= 400) && ![401].includes(res.status)) {
                try {
                    bdy = await res.json();
                } catch (err) {
                    throw new Error(`Status Code: ${res.status}`);
                }

                const err = new Error(bdy.message || `Status Code: ${res.status}`);
                err.body = bdy;
                throw err;
            } else if (res.status === 401) {
                delete localStorage.token;
                return window.location.reload();
            }

            return await res.json();
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

export default std;
