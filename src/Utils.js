export default class Utils {
	static sortArray(array, property, numeric, ascending) {
		var newArray = [];
		for (var i = 0; i < array.length; i += 1) {
			newArray.push(Object.assign({}, array[i]));
		}

		if (!numeric) {
			newArray.sort(function(a, b) {
				if (a[property] < b[property]) {
					return ascending ? -1 : 1;
				} else if (a[property] > b[property]) {
					return ascending ? 1 : -1;
				} else {
					return 0;
				}
			});
		} else {
			newArray.sort(function(a, b) {
				return ascending ? a[property] - b[property] : b[property] - a[property];
			});
		}
		return newArray;
	}

	static findIndex(list, name) {
		for (var i = 0; i < list.length; i += 1) {
			if (list[i].name === name) {
				return i;
			}
 		}
 		// alert("error");
	}

	static listsEqual(a, b) {
		return (a.length === b.length) && (a.length === 0 || (a[0].name === b[0].name));
	}
}
