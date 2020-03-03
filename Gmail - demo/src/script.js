// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

function setPopup(data){
	var str = '<div class="m-2 p-2 popupClass"><span class="close">X</span><p>'+data.str+'</p></div>';
	
	//Using document.body.contains.
    if(document.body.contains(document.querySelector("div.popupClass"))){
       document.querySelector("div.popupClass").remove();
    } 
	document.body.insertAdjacentHTML("afterbegin", str);
}

function setActions(){
	var elements = document.getElementsByClassName("close");

	var myFunction = function() {
		var attribute = this.getAttribute("class");
		//alert(attribute);
		this.closest('div.popupClass').remove();
	};

	for (var i = 0; i < elements.length; i++) {
		elements[i].addEventListener('click', myFunction, false);
	}
}