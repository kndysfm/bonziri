/// <reference path="bonziri.if.ts" />
//'use strict'

namespace Bonziri {
	namespace Is {
		
		function _type (name:string) :(x:any) => boolean {
			return (x:any) => typeof x === name;
		}
		
		export var obj = _type('object');

		export var num = _type('number');

		export var str = _type('string');
		
		export var bool = _type('boolean');

		export var arr = Array.isArray;

	}
	
	namespace Has {
		function _val<T> (): (obj:any, name:string, defaultVal:T) => T {
			return (obj:any, name:string, defaultVal:T) => name in obj? obj[name]: defaultVal;
		}
		
		export var num = _val<number>();

		export var str = _val<string>();

		export var bool = _val<boolean>();

		export var obj = _val<any>();
	}
	
	export namespace Impl {
 
 		class Image implements ImageFile {
			label: string;
			url: string;
			width: number;
			height: number;
			frames: number;
	
			constructor(label: string, obj: any) {
				this.label = label;
				this.url = Has.str(obj, 'url', '');            
				this.width = Has.num(obj, 'width', 1);            
				this.height = Has.num(obj, 'height', 1);            
				this.frames = Has.num(obj, 'frames', 1);           
			}
		}
		
		class Audio implements AudioFile {
			label: string;
			url: string;
			
			constructor(label: string, obj: any) {
				this.label = label;
				this.url = Has.str(obj, 'url', '');
			}            
		}
		
		class Animation implements Animation {
			label: string;
			fps: number;
			loop: boolean;
			delay: number;
			randomDelay: boolean;
			
			constructor(label: string, obj: any) {
				this.label = label;
				this.fps = Has.num(obj, 'fps', 60);
				this.loop = Has.bool(obj, 'loop', true);
				this.delay = Has.num(obj, 'delay', 0);
				this.randomDelay = Has.bool(obj, 'randomDelay', false);
			}        
		}
		
		class Tween implements Tween {
			label: string;
			from: any;
			to: any;
			duration: number;
			constructor(label: string, obj: any) {
				this.label = label;
				this.from = Has.obj(obj, 'from', null);
				this.to = Has.obj(obj, 'to', null);
				this.duration = Has.num(obj, 'duration', 1000);
			}
		}
	
		class Sprite implements Sprite {
			label: string;
			image: ImageFile;
			animation: Animation;
			
			constructor(label: string, obj: any, rc: Resources, ef: Effects) {
				this.label = label;
				if ('image' in obj && obj['image'] in rc.imageFiles) {
					this.image = rc.imageFiles[obj['image']];
				} else {
					this.image = null;
				}
				if ('animation' in obj && obj['animation'] in ef.animations) {
					this.animation = ef.animations[obj['animation']];
				} else {
					this.animation = null;
				}
			}        
		}
		
		class Sound implements Sound {
			label: string;
			audio: AudioFile;
			volume: number;
			loop: boolean;
			fadeIn: boolean;
			fadeOut: boolean;
			duration: number;
			
			constructor(label: string, obj: any, rc: Resources, ef: Effects) {
				this.label = label;
				if ('audio' in obj && obj['audio'] in rc.audioFiles) {
					this.audio = rc.audioFiles[obj['audio']];
				} else {
					this.audio = null;
				}
				this.volume = Has.num(obj, 'volume', 1);
				this.loop = Has.bool(obj, 'loop', false);
				this.fadeIn = Has.bool(obj, 'fadeIn', false);
				this.fadeOut = Has.bool(obj, 'fadeOut', false);
				this.duration = Has.num(obj, 'duration', 0);
			}
		}
		
		class Action implements Action {
			label: string;
			set: any;
			tween: Tween;
			sound: SoundAction;
			
			constructor(label: string, obj: any, ef: Effects) {
				this.label = label;
				this.set = Has.obj(obj, 'set', null);
				if ('tween' in obj && obj['tween'] in ef.tweens) {
					this.tween = ef.tweens[obj['tween']];
				} else {
					this.tween = null;
				}
				
				let sa: SoundAction|string;
				if ('sound' in obj && obj['sound'] in SoundAction) {
					sa = SoundAction[obj['sound']];
					this.sound = <SoundAction>sa;
				} else {
					this.sound = SoundAction._NONE_;
				}
			}        
		}
		
		class Cast implements Cast{
			label: string;
			name: string; // default displayed name
			sprites: Sprite[];
			sounds: Sound[];
	
			constructor(label: string, obj: any, stuff:Stuff) {
				this.label = label;
				this.name = Has.str(obj, 'name', '');
				
				this.sprites = [];
				if ('sprites' in obj && Is.arr(obj['sprites'])) {
					let labels = <string[]> obj['sprites'];
					for (let i = 0; i < labels.length; i+=1) {
						let l = labels[i];
						this.sprites.push(l in stuff.sprites? stuff.sprites[l]: null);
					}
				}
	
				this.sounds = [];
				if ('sounds' in obj && Is.arr(obj['sounds'])) {
					let labels = <string[]> obj['sounds'];
					for (let i = 0; i < labels.length; i+=1) {
						let l = labels[i];
						this.sounds.push(l in stuff.sounds? stuff.sounds[l]: null);
					}
				}
			}
		}
		
		class LinkText implements LinkText {
			constructor(
				idx: number, 
				public text: string,
				public line_label: string
			) { 
				if (!Is.str(this.text)) {
					throw `[lines:${idx}] link text is ${typeof this.text}`
				}
				if (!Is.str(this.line_label)) {
					throw `[lines:${idx}] label of linker destination is ${typeof this.line_label}`
				}
			}
		}
		
		class Caption implements Caption {
			constructor(
				idx: number, 
				public name: string, 
				public speed: number, 
				public text: string|LinkText|Array<string|LinkText>) {
				if (speed <= 0) {
					throw `[lines:${idx}] speed should be value > 0`;
				}
			}
		}
		
		class Line implements Line {
			label: string;
			index: number;
			cast: Cast;
			action: Action;
			target: LineTarget;
			sprites: Sprite[];
			sounds: Sound[];
			caption: Caption;
			
			private _setCast(idx: number, casts:CastList, label: string) {
				if (label in casts) {
					this.cast = casts[label];
				} else {
					throw `[lines:${idx}] there is such a cast ${label}`;
				}
			}
			
			private _setAction(idx: number, actions:ActionList, label: string) {
				if (label in actions) {
					this.action = actions[label];
				} else {
					throw `[lines:${idx}] there is such a action ${label}`;
				}
			}
			
			private _setTarget(idx: number, key: string) {
				if (key in LineTarget) {
					let val: any = LineTarget[<any>key];
					this.target = val;
				} else {
					throw `[lines:${idx}] LineTarget.${key} is undefined`;
				}
			}
			
			private _setSprites(idx: number, cast:Cast, arg:any) {
				if (Is.arr(arg)) {
					let ids = <(number|string)[]>arg;
					for (let i = 0; i < ids.length; i+=1) {
						if (Is.str(ids[i])) {
							let found = false;
							for (let j = 0; j < cast.sprites.length; j++) {
								if (cast.sprites[j].label == ids[i]) {
									this.sprites.push(cast.sprites[j]);
									found = true;
								}
							}
							if (!found) {
								throw `[lines:${idx}] cast ${cast.label} does not have sprite ${ids[i]}`;
							}
						} else if (Is.num(ids[i])) {
							let n = <number>ids[i];
							if (n < cast.sprites.length) {
								this.sprites.push(cast.sprites[n]);
							} else {
								throw `[lines:${idx}] ${cast.label}.sprites.length <= ${n}`;
							}
						} else {
							throw `[lines:${idx}] there is such a sprite ${ids[i]}`;
						}
					}
				} else if (Is.num(arg)) {
					let n = <number>arg;
					if (n < cast.sprites.length) {
						this.sprites.push(cast.sprites[n]);
					} else {
						throw `[lines:${idx}] ${cast.label}.sprites.length <= ${n}`;
					}
				} else if (Is.str(arg)) {
					let found = false;
					for (let j = 0; j < cast.sprites.length; j++) {
						if (cast.sprites[j].label == arg) {
							this.sprites.push(cast.sprites[j]);
							found = true;
						}
					}
					if (!found) {
						throw `[lines:${idx}] cast ${cast.label} does not have sprite ${arg}`;
					}
				} else {
					throw `[lines:${idx}] wrong type of 'sprites': ${arg}`;
				}
			}
			
			private _setSounds(idx: number, cast:Cast, arg:any) {
				if (Is.arr(arg)) {
					let ids = <(number|string)[]>arg;
					for (let i = 0; i < ids.length; i+=1) {
						if (Is.str(ids[i])) {
							let found = false;
							for (let j = 0; j < cast.sounds.length; j++) {
								if (cast.sounds[j].label == ids[i]) {
									this.sounds.push(cast.sounds[j]);
									found = true;
								}
							}
							if (!found) {
								throw `[lines:${idx}] cast ${cast.label} does not have sound ${ids[i]}`;
							}
						} else if (Is.num(ids[i])) {
							let n = <number>ids[i];
							if (n < cast.sounds.length) {
								this.sounds.push(cast.sounds[n]);
							} else {
								throw `[lines:${idx}] ${cast.label}.sounds.length <= ${n}`;
							}
						} else {
							throw `[lines:${idx}] there is such a sound ${ids[i]}`;
						}
					}
				} else if (Is.num(arg)) {
					let n = <number>arg;
					if (n < cast.sounds.length) {
						this.sounds.push(cast.sounds[n]);
					} else {
						throw `[lines:${idx}] ${cast.label}.sounds.length <= ${n}`;
					}
				} else if (Is.str(arg)) {
					let found = false;
					for (let j = 0; j < cast.sounds.length; j++) {
						if (cast.sounds[j].label == arg) {
							this.sounds.push(cast.sounds[j]);
							found = true;
						}
					}
					if (!found) {
						throw `[lines:${idx}] cast ${cast.label} does not have sound ${arg}`;
					}
				} else {
					throw `[lines:${idx}] wrong type of 'sounds': ${arg}`;
				}
			}
			
			private _setCaptionText(idx: number, arg:any) {
				if (Is.arr(arg)) {
					let src = <(string|string[])[]>arg;
					if (src.length == 1) {
						if (Is.str(src[0])) {
							this.caption.text = src[0];
						} else if (Is.arr(src[0])) {
							let lt = new LinkText(idx, src[0][0], src[0][1]);
							this.caption.text = lt;
						}
					} else if (src.length > 1) {
						let dst: (string|LinkText)[] = [];
						for (let i = 0; i < src.length; i++) {
							if (Is.str(src[i])) {
								dst.push(<string>src[i]);
							} else if (Is.arr(src[i])) {
								let lt = new LinkText(idx, src[i][0], src[i][1]);
								dst.push(lt);
							} else {
								throw `[lines:${idx}] there is something wrong in array[${i}]`;
							}
						}
						this.caption.text = dst;
					} else {
						throw `[lines:${idx}] there is no text`;
					}
				} else if (Is.str(arg)) {
					this.caption.text = arg;
				}
			}
			
			constructor(idx: number, obj: any, scene: Scenario) {
				let ef = scene.effects,
					stuff = scene.stuff,
					casts = scene.casts,
					lastLine = scene.lines[idx-1];
	
				this.index = idx | 0;
				this.label = '';
				this.cast = null;
				this.action = null;
				this.target = LineTarget._GROUP_;
				this.sprites = [];
				this.sounds = [];
				this.caption = null;
	
				if (Is.arr(obj)) {
					/**
					* example:
					* [ "A", "FADE_OUT"],
					* [ "B", {"set": {"x": 200}}],
					* [ "A", ["Loop?", ["Yes!", "loop2"], ["No!", "break2"] ] ],
					* [["loop2"]],
					*/
					let cast_label: string;
					let action_label: string;
	
					if (lastLine && lastLine.caption) {
						this.caption = new Caption(idx,
							lastLine.caption.name,
							lastLine.caption.speed,
							null);
					} else {
						this.caption = new Caption(idx, "", 5, null);
					}
					
					if (Is.str(obj[0])) {
						/// [ "A", "FADE_OUT"],
						this._setCast(idx, casts, obj[0]);
					} else if (Is.arr(obj[0])) {
						/// [["loop2"]],
						if (Is.str(obj[0][0])) {
							this.label = obj[0][0];
						} else {
							throw `[line:${idx}]2D array means label of Line`;
						}
						this._setCast(idx, casts, '_SCENE_');
						return; // EOL
					}
					
					if (Is.str(obj[1])) {
						/// [ "A", "FADE_OUT"],
						this._setAction(idx, stuff.actions, obj[1]);
						return; // EOL
					} else if (Is.arr(obj[1])) {
						///[ "A", ["Loop?", ["Yes!", "loop2"], ["No!", "break2"] ] ],
						// update caption
						this._setCaptionText(idx, obj[1]);
						return; // EOL
					} else if (typeof obj[1] === 'object') {
						/// [ "B", {"set": {"x": 200}}],
						this.action = new Action('', obj[1], ef);
						return; // EOL
					}
					/// end of Is.arr(obj)
				} else if (Is.str(obj)) {
					if (lastLine && lastLine.cast && lastLine.caption) {
						this.cast = lastLine.cast;
						this.caption = new Caption( idx,
							lastLine.caption.name,
							lastLine.caption.speed,
							obj);
					} else {
						throw `[Line:${idx}]please pass a filled last Line object`;
					}
				}
				else if (typeof obj == 'object') {
					if (!('label' in obj)) {
						this.label = '';
					} else if (Is.str(obj['label'])) {
						this.label = <string>obj['label'];
					}
					
					if (!('cast' in obj)) {
						this._setCast(idx, casts, '_SCENE_');
					} else if (Is.str(obj['cast'])) {
						this._setCast(idx, casts, obj['cast']);
					} else {
						throw `[Line:${idx}]"cast" should be string`;
					}
					
					if ('action' in obj) {
						if (Is.str(obj['action'])) {
							this._setAction(idx, stuff.actions, obj['action']);
						} else {
							this.action = new Action('', obj['action'], ef); //literal in JSON
						}
					} else {
						// this line has no action
					}
					
					if (!('target' in obj)) {
						this._setTarget(idx, '_GROUP_');
					} else if (Is.str(obj['target'])) {
						this._setTarget(idx, obj['target']);
					}
					if ('sprites' in  obj) {
						this._setSprites(idx, this.cast, obj['sprites']);
					}
					if ('sounds' in obj) {
						this._setSounds(idx, this.cast, obj['sounds']);
					}
					if ('caption' in obj) {
						if (Is.str(obj['caption']) ||
							Is.arr(obj['caption'])) {
							if ('cast' in obj) {
								this.caption = new Caption( idx,
									this.cast.name,
									5,
									null);
							} else if (lastLine && lastLine.cast && lastLine.caption){
								this.cast = lastLine.cast;
								this.caption = new Caption( idx,
									lastLine.caption.name,
									lastLine.caption.speed,
									null);
							}
							this._setCaptionText(idx, obj['caption']);
						} else {
							let c:Caption = obj['caption'];
							if ('cast' in obj) {
								this.caption = new Caption( idx,
									c.name? c.name : this.cast.name,
									c.speed? c.speed: 5,
									null);
							} else if (lastLine && lastLine.cast && lastLine.caption){
								this.cast = lastLine.cast;
								this.caption = new Caption( idx,
									c.name? c.name: lastLine.caption.name,
									c.speed? c.speed: lastLine.caption.speed,
									null);
							}
							if (c.text) {
								this._setCaptionText(idx, c.text);
							}
						} 
						
						if (!this.caption) {
							throw `[Line:${idx}] bad "caption"`;
						}
					} else if (lastLine && lastLine.caption) {
						this.caption = new Caption(idx,
							lastLine.caption.name,
							lastLine.caption.speed,
							null);
					}
				}
				else {
					throw `[Line:${idx}] failed to map object`;
				}
			}
	
		}
	
		class Scenario implements Scenario {
	
			resources: Resources;
			effects: Effects;
			stuff: Stuff;
			casts: CastList;
			lines: Line[];
			
			private _obj: any;
			private _lineIndex: {[label:string]: number}
			
			private _genLinkLabelCheck(that:Scenario, idx:number) {
				return (lt:LinkText) => {
					if (lt.line_label) {
						if (!(lt.line_label in that._lineIndex)) {
							throw `[Line:${idx}] label "${lt.line_label}" cannot be found`;
						}
					}
				}; 
			}
	
			constructor(jsonText: string) {
				this._obj = JSON.parse(jsonText);
				this.resources = {imageFiles:{}, audioFiles:{}};
				this.effects = {animations:{}, tweens:{}};
				this.stuff = {sprites:{}, sounds:{}, actions:{}};
				this.casts = {};
				this.lines = [];
				this._lineIndex = {}
				
				if ('resources' in this._obj) {
					let rc = this._obj['resources'];
					if ('imageFiles' in rc) {
						let imgs = rc['imageFiles'];
						for (let k in imgs) {
							this.resources.imageFiles[k] = new Image(k, imgs[k]);
						}
					} else throw `define 'imageFiles'`;
					if ('audioFiles' in rc) {
						let audios = rc['audioFiles'];
						for (let k in audios) {
							this.resources.audioFiles[k] = new Audio(k, audios[k]);
						}
					} else throw `define 'audioFiles'`;
				} else throw `define 'resources'`;
				
				if ('effects' in this._obj) {
					let ef = this._obj['effects'];
					if ('animations' in ef) {
						let anims = ef['animations'];
						for (let k in anims) {
							this.effects.animations[k] = new Animation(k, anims[k]);
						}
					} else throw `define 'animations'`;
					if ('tweens' in ef) {
						let tws = ef['tweens'];
						for (let k in tws) {
							this.effects.tweens[k] = new Tween(k, tws[k]);
						}
					} else throw `define 'tweens'`;
				} else throw `define 'effects'`;
				
				if ('stuff' in this._obj) {
					let st = this._obj['stuff'];
					if ('sprites' in st) {
						let sprts = st['sprites'];
						for (let k in sprts) {
							this.stuff.sprites[k] = new Sprite(k, sprts[k], this.resources, this.effects);
						}
					} else throw `define 'sprites'`;
					if ('sounds' in st) {
						let snds = st['sounds'];
						for (let k in snds) {
							this.stuff.sounds[k] = new Sound(k, snds[k], this.resources, this.effects);
						}
					} else throw `define 'sounds'`;
					if ('actions' in st) {
						let acts = st['actions'];
						for (let k in acts) {
							this.stuff.actions[k] = new Action(k, acts[k], this.effects);
						}
					} else throw `define 'actions'`;
				} else throw `define 'stuff'`;
				
				if ('casts' in this._obj) {
					let casts = this._obj['casts'];
					for (let k in casts) {
						this.casts[k] = new Cast(k, casts[k], this.stuff);
					}
				} else throw `define 'casts'`;
	
				if ('lines' in this._obj && Is.arr(this._obj['lines'])) {
					let ls = <any[]>this._obj['lines'];
					for (let idx = 0; idx < ls.length; idx += 1) {
						let l = new Line(idx, ls[idx], this);
						this.lines.push(l);
						this._lineIndex[l.label] = idx;
					}
					// validate link label
					for (let idx = 0; idx < this.lines.length; idx += 1) {
						let l = this.lines[idx];
						if (l.caption && l.caption.text) {
							let lt = <LinkText> l.caption.text;
							let checker = this._genLinkLabelCheck(this, idx);
							if (Is.arr(l.caption.text)) {
								let lts = <LinkText[]> l.caption.text;
								for (let idx = 0; idx < lts.length; idx += 1) {
									checker(lts[idx]);
								}
							} else {
								checker(lt);
							}
						}
					}
				} else throw `define 'lines'`;
			}
			
			/// get index of line by label of line to jump
			/// if error then it returns value < 0 
			getLineIndex(label:string): number {
				return label in this._lineIndex? this._lineIndex[label]: -1;
			}
		}

		export function generateScenario(jsonText: string): Scenario {
			return new Scenario(jsonText);
		}
		
	} // namespace
	
} // namespace