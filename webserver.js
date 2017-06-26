function callWeb() {
	 var input = document.getElementById('myinput'),
        myinput = input.value;
    if (myinput) {
        loadWebServers(input);
    } else {
        alert('Please enter an input!');
        input.focus();
    }	
}


// load client parameters and/or liveboxes
function loadWebServers(input)
{	
	var value1 = input
	var value2 = ''
	var value3 = ''
    #loadWebABC(value1, value2, value3);
    loadWebX(value1);
}

function loadWebX(value1) {
  var urlParams = "reqJson=myvar" + value1;
  requestManager.sendJsonRequest("servletRemote", urlParams, "webXCallBack", null);
}

function webXCallBack(json) {
	
	if (! (json == false) ) {
		alert('json= ' + json);
	}
	updateLoading("EXAMPLE", false);
	return showOrHideServicesQuick(VALUE_KNOWN);
}