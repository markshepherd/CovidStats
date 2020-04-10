class Analytics {
	reportEvent(event, category, label) {
		// console.log("Analytics", event, category, label);
		// eslint-disable-next-line no-undef
		gtag("event", event, {
			event_category: category || "engagement",
			event_label: label,
			transport_type: "beacon"			
		});
		// BTW, setting the transport method to "beacon" lets the hit be sent
		// using "navigator.sendBeacon" in browsers that support it.
	}

	reportOutboundLink(url) {
		this.reportEvent("click", "outbound", url);
	}

	selectCount = {};

	itemSelected(name) {
		var count = this.selectCount[name] || 0;
		count += 1;
		this.selectCount[name] = count;
		if (count === 1) {
			this.reportEvent("table_select_1", null, name)
		} else if (count === 5) {
			this.reportEvent("table_select_5", null, name)
		}
	}

	linlogCount = 0;

	linearLogToggleClicked() {
		this.linlogCount += 1;
		if (this.linlogCount === 1) {
			this.reportEvent("linlog_click_1")
		} else if (this.linlogCount === 5) {
			this.reportEvent("linlog_click_5")
		}
	}

	arrowCount = 0;

	arrowClicked() {
		this.arrowCount += 1;
		if (this.arrowCount === 1) {
			this.reportEvent("arrow_click_1")
		} else if (this.arrowCount === 5) {
			this.reportEvent("arrow_click_5")
		}
	}

	static instance;
}

if (!Analytics.instance) {
	Analytics.instance = new Analytics();
};

export default Analytics.instance;
