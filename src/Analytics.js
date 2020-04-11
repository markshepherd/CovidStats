class Analytics {
	enabled = true;

	enable(enabled) {
		this.enabled = enabled;
	}

	reportEvent(event, category, label) {
		console.log("Analytics", event, category, label);
		if (this.enabled) {
			// eslint-disable-next-line no-undef
			gtag("event", event, {
				event_category: category || "engagement",
				event_label: label,
				transport_type: "beacon"			
			});
			// BTW, setting the transport method to "beacon" lets the hit be sent
			// using "navigator.sendBeacon" in browsers that support it.
		}
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

	counts = {
		hideshow_dataset_click: 0,
		date_slider_click: 0,
		linlog_click: 0,
		arrow_click: 0
	};

	countableEvent(eventName) {
		this.counts[eventName] += 1;
		if (this.counts[eventName] === 1) {
			this.reportEvent(`${eventName}_1`)
		} else if (this.counts[eventName] === 5) {
			this.reportEvent(`${eventName}_5`)
		}
	}

	hideShowDatasetClicked() {
		this.countableEvent("hideshow_dataset_click");
	}

	dateSliderUsed() {
		this.countableEvent("date_slider_click");
	}

	linearLogToggleClicked() {
		this.countableEvent("linlog_click");
	}

	arrowClicked() {
		this.countableEvent("arrow_click");
	}

	static instance;
}

if (!Analytics.instance) {
	Analytics.instance = new Analytics();
};

export default Analytics.instance;
