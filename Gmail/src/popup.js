// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let filterMail = document.getElementById('filterMail');

document.querySelectorAll('.filterMail').forEach(item => {
	item.addEventListener('click', event => {
		var labelValue = event.target.getAttribute("data-value");
		
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(
				tabs[0].id,
				{code: 'document.querySelectorAll(\'[name="q"]\')[0].value = \'label: '+labelValue+'\';document.getElementsByClassName("gb_mf")[0].click();'}
			);
		});
	})
})
