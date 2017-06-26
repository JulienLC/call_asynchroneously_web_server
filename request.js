var requestManager = {
	loading : false,

	updaters : new Array(),

	Updater : function(request, backFunction, param, isXml, isJson) {
		this.request = request;
		this.backFunction = backFunction;
		// this.released = false;
		this.param = param;
		this.isXml = isXml;
		this.cancelled = false;
		this.isJson = isJson;
	},

	createRequest : function() {
		var request = false;
		try {
			request = new XMLHttpRequest();
		} catch (trymicrosoft) {
			try {
				request = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (othermicrosoft) {
				try {
					request = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (failed) {
					request = false;
				}
			}
		}
		return request;
	},

	sendTextRequest : function(url, urlParam, backFunction, param) {
		this.sendRequest(url, urlParam, backFunction, param, false, false);
	},

	sendXmlRequest : function(url, urlParam, backFunction, param) {
		return this
				.sendRequest(url, urlParam, backFunction, param, true, false);
	},

	sendJsonRequest : function(url, urlParam, backFunction, param, timeout) {
		 if (typeof(timeout)==='undefined') {
			 timeout = 0;
		 } 
		this.sendRequest(url, urlParam, backFunction, param, false, true, timeout);
	},

	sendRequest : function(url, urlParam, backFunction, param, isXml, isJson, timeout) {
		 if (typeof(timeout)==='undefined') {
			 timeout = 0;
		 }
		var request = this.createRequest();

		if (!request) {
			alert("Request not supported");
			return -1;
		} else {
			var index = this.updaters.length;
			this.updaters[index] = new requestManager.Updater(request,
					backFunction, param, isXml, isJson);

			request.open("POST", url, true);
			request.onreadystatechange = requestManager.receiveRequest;
			if (timeout != null && timeout > 0) {
				request.timeout = timeout;
				request.ontimeout = requestManager.timeoutRequest;
			}
			request.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded; charset=UTF-8");
			request.send(urlParam);

			this.setLoading("true");
			return index;
		}
	},

	cancelRequest : function(index) {
		this.updaters[index].cancelled = true;
	},
	/**
	* En cas de timeout, on renvoie la fonction de callBack avec un "false" comme réponse
	*/
	timeoutRequest : function() {
		for ( var i = requestManager.updaters.length - 1; i >= 0; i--) {
			var updater = requestManager.updaters[i];
			if (updater != null) {
				if (updater.backFunction) {

					var func = new Function("response", "param",
							updater.backFunction + "(response, param)");

					func(false, updater.param);

				}
			}
		}

	},
	receiveRequest : function() {
		var stillLoading = false;
		for ( var i = requestManager.updaters.length - 1; i >= 0; i--) {
			var updater = requestManager.updaters[i];
			if (updater != null) {
				// 4 = terminated
				if (updater.request.readyState == 4) {
					requestManager.updaters[i] = null;
					if (updater.cancelled == false) {
						if (!updater.request.status == 200) {
							alert("No response from server");
						} else {
							if (updater.backFunction) {
								// try
								// {
								var func = new Function("response", "param",
										updater.backFunction
												+ "(response, param)");
								if (updater.isXml) {
									// alert(updater.request.responseText);
									var xml = updater.request.responseXML;
									if (requestManager.checkErrors(xml)) {
										func(false, updater.param);
									} else {
										func(xml, updater.param);
									}
								} else if (updater.isJson) {
									var txtJson = updater.request.responseText;
									/* en cas de parsing incorrect de la réponse json, on renvoie false au callBack */
									if (requestManager.checkErrorsJson(txtJson) ) {
										func(txtJson, updater.param);
									} else {
										func(false, updater.param);
									}
								} else {
									func(updater.request.responseText,
											updater.param);
								}
	
							}
						}
					}
				} else {
					stillLoading = true;
				}
			}
			requestManager.setLoading(stillLoading);
		}
	},

 	/** renvoie true dans le cas où le json est parsable. false sinon */
	checkErrorsJson : function(jsonText) {
		if (jsonText == null || jsonText == "") {
			return false;
		}

		var contextJson = null;
		try {
			contextJson	= JSON.parse(jsonText);
			// le json renvoye n'est pas parsable, on sort une erreur
		} catch (e) {
			return false;
		}
		if (contextJson == null) {
			
			return false;
		}

		return true;
	},

	checkErrors : function(xml) {
		if (xml == null) {
			if (confirm(getMessage("errors.noResponse"))) {
				window.location.reload();
			}
			return true;
		}

		if (xml.childNodes.length == 0) {
			if (confirm(getMessage("errors.noResponse"))) {
				window.location.reload();
			}
			return true;
		}

		var errors = xml.getElementsByTagName("error");
		if (errors.length > 0) {
			for ( var i = 0; i < errors.length; i++) {
				var error = errors[i];
				var from = errors[i].getAttribute("errorFrom");
				log(dom.getText(error), from);
				// log(dom.getText(error));
			}
			return true;
		}
		return false;
	},

	setLoading : function(loading) {
		this.loading = loading;
	}
}
