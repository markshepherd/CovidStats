class URLUpdater {
	settings = {};

	rewriteWindowLocation() {
		var s = this.settings;
		var newUrl = window.location.toString().split(/\?/)[0];
		var sep = "?";

		if (s.state) {
			sep = "&";
			newUrl += `?state=${encodeURIComponent(s.state)}`;		
			if (s.county) {
				newUrl += `&county=${encodeURIComponent(s.county)}`;
			}
		}

		for (var i in this.settings) {
			if (i !== "state" && i !== "county" && this.settings[i] !== undefined) {
				newUrl += `${sep}${i}=${this.settings[i]}`;
				sep = "&";
			}
		}
		window.history.replaceState('xxx', 'yyy', newUrl);
	}

	update(name, value, defaultValue) {
		this.settings[name] = (value === defaultValue) ? undefined : value;
		if (this.timerId) {
			clearTimeout(this.timerId);
		}
		this.timerId = setTimeout(() => {
			this.rewriteWindowLocation();
		}, 1000);
	}

	static instance;
}

if (!URLUpdater.instance) {
	URLUpdater.instance = new URLUpdater();
};

export default URLUpdater.instance;
