#Bonziri JSON Specification
----
##Resources
###Image
###Audio
##Effects
###Animation
###Tween
##Object
###Sprite
###Sound
##Example
```javascript
{
	"resources": {
		"imageFiles": {
			"cast-1": {
				"url": "./assets/img/cast-1_300x400x4.png",
				"width": 300, "height": 400, "frames": 4 },
			"diff-1": {
				"url": "./assets/img/diff-1_300x400x2.png", 
				"width": 300, "height": 400, "frames": 2 },
			"cast-2": {
				"url": "./assets/img/cast-2_300x400x4.png",
				"width": 300, "height": 400, "frames": 4 },
			"diff-2": {
				"url": "./assets/img/diff-2_300x400x2.png", 
				"width": 300, "height": 400, "frames": 2 },
			"background-1": {
				"url": "./assets/img/background-1_800x600x1.jpg",
				"width": 800, "height": 600, "frames": 1 },
			"background-2": {
				"url": "./assets/img/background-2_800x600x1.jpg",
				"width": 800, "height": 600 }
		},
		"audioFiles": {
			"hoge": { "url": "./hoge.mp3" }
		}
	},
	
	"effects": {
		"animations": {
			"NONE": {},
			"CONSTANT": {
				"fps": 8, "loop": true, "delay": 0, "randomDelay": false},
			"RANDOM": {
				"fps": 4, "loop": true, "delay": 5000, "randomDelay": true}
		},
		"tweens": {
			"NONE": {},
			"FADE_IN":{
				"from": {"alpha": 0},
				"to": {"alpha": 1},
				"duration": 500},
			"FADE_OUT":{
				"from": {"alpha": 1},
				"to": {"alpha": 0},
				"duration": 500}	
		}	
	},
	
	"objects": {
		"sprites": {
			"c1": {
				"image": "cast-1", "animation": "RANDOM" },
			"c1_1": {
				"image": "diff-1", "animation": "CONSTANT" },
			"c2": {
				"image": "cast-2", "animation": "RANDOM" },
			"c2_1": {
				"image": "diff-2", "animation": "CONSTANT" },
			"bg1": {
				"image": "background-1", "animation": "NONE" },
			"bg2": {
				"image": "background-2"}
		},
		"textBoxes": {
			
		},
		"sounds": {
			"hoge": {
				"audio": "hoge",
				"volume": 0.5,
				"loop": true,
				"fade": true,
				"duration": 250
			}
		}
	},
	
	"scene": {
		"actions": {
			"HIDE": {"set": {"visible": false, "alpha": 0} },
			"SHOW": {"set": {"visible": true, "alpha": 1} },
			"FADE_IN": {"set": {"visible": true}, "tween": "FADE_IN"},
			"FADE_OUT": {"tween": "FADE_OUT"},
			"PLAY": {"sound": "play"}
		},
			
		"casts": {
			"_PLAYER_": {
				"name": "@[playerName]"},
			"_SCENE_": {
				"sprites": ["bg1", "bg2"], "sounds": []},
			"A": {
				"name": "NameA", "sprites": ["c1", "c1_1"], "sounds": []},
			"B": {
				"name": "NameB", "sprites": ["c2", "c2_1"], "sounds": []}
		},
		
		"lines": [
			{ "label": "start",
				"cast": "_SCENE_", "action": "SHOW", "target": "Group"},
			{ "cast": "_SCENE_", "action": "SHOW", "target": "Sprite",
				"indices":[0]},
			{ "action": "FADE_IN", "target": "Sprite",
				"labels":["bg2"]},
			{ "cast": "_SCENE_", "action": "FADE_OUT", "target": "Sprite",
				"indices":[1]},
			
			{ "cast": "A", "action": "SHOW", "target": "Sprite", "indices":[0, 1]},
			[ "A", {"set": {"x": -200}}],
			{ "label": "A fade in", "cast": "A", "action": "FADE_IN"},
			[ "A", "FADE_OUT"],
			[ "A", "HIDE"],
			
			{ "cast": "B", "action": "SHOW", "target": "Sprite", "indices":[0, 1]},
			[ "B", {"set": {"x": 200}}],
			{ "cast": "B", "action": {"set": {"visible": true}, "tween": {"to": {"alpha": 1}}}},
			[ "B", "FADE_OUT"],
			
			[ "A", "SHOW"],
			{ "cast": "A", "speak": {
				"name": "Unknown", "speed": 10, 
				"text": "Hello, Hello. (1)"}},
			{ "cast": "A", "speak": "Hello, Hello. (2)" },
			[ "A", ["Hello, Hello. (3)", "Hello, Hello. (4)", "Hello, Hello. (5)"]],
			"Hello, Hello. (6)",
			
			{"label": "loop1"},
			{ "cast": "A", "speak": {
				"text": [
					"Loop? (7)", 
					["Yes!", "loop1"],
					["No!", "break1"] ] } },
			{"label": "break1"},
			
			[["loop2"]],
			[ "A", [
					"Loop? (8)", 
					["Yes!", "loop2"],
					["No!", "break2"] ] ],
			[["break2"]],
			
			"Hello, Hello. (9)",
			[ "A", {"tween": {"to": {"alpha": 0}, "duration": 2000}}],
			
			{ "label": "start",
				"cast": "_SCENE_", "action": "HIDE", "target": "Group"}
		]
	}
}
```