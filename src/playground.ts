"use strict";

let json_scene = `{
	"resources": {
		"images": {
			"castA": ["path/imageA_300x450x3.png", 300, 450, 3, 60, true, true, 5000],
			"castA_diff": ["path/imageA_300x450x1.png", 300, 450, 1, 60, false],
			"castB": ["path/imageB_200x450x2.png", 200, 450, 2, 60],
			"castB_diff": ["path/imageA_200x450x1.png", 200, 450, 1],
			"bacgroundC": ["path/imageC_800x600x1.jpg", 800, 600],
			"bacgroundD": ["path/imageC_800x600x1.jpg", 800, 600]
		},
		"sounds": []
	},
	
	"casts": {
		"PLAYER": ["@[playerName]", [], []],
		"STAGE": ["", ["bacgroundC", "bacgroundD"], []],
		"castA": ["displayNameA", ["castA", "castA_diff"], []],
		"castB": ["displayNameB", ["castB", "castB_diff"], []]
	},
	
	"lines": [
		{"label": "head"},
		{"cast": "STAGE", "command": "FadeIn", "parameters": {"image": 0}},
		["castA", "FadeIn", {"image": 0, "position": [200,0], "delay": 500}],
		{"label": "A comming", "cast": "castA", "command": "In", "parameters": {"image": 1, "position": [200,0], "delay": 0}},
		["castA", "Speak", {"text": "harou waarudo", "name": "A man", "speed": 200}],
		"harou waarudo",
		["castA", "Speak", "hello world"],
		"hello world",
		["castA", "Konichiwa"],
		"Konichiwa",
		"Konichiwa",
		"Konichiwa",
		["castA", "FadeOut", {"image": -1, "delay": 500}]
	]
}`;

let obj = JSON.parse(json_scene);

let fn:Function;

fn = (obj:any) => {
	for (let k in obj) {
		if (Array.isArray(obj[k]))
		{
			console.log(k + ':array')
			fn(obj[k]);
		}
		else
		if (typeof obj[k] === 'object')
		{
			console.log(k + ':object');
			fn(obj[k]);
		}
		else
		{
			console.log(k + ':' + typeof obj[k]);
		}
	}
};

fn(obj);

let a = <Array<string>>obj['casts']['STAGE'][2];
fn(a);