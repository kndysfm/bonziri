//'use strict'
 
module Bonziri {
    
    export interface Labeled {
        label: string
    }
    
    export interface ImageFile extends Labeled {
        url: string;
        width: number;
        height: number;
        frames: number;
    }
    
    export interface AudioFile extends Labeled {
        url: string;
    }
    
    export interface Resources {
        imageFiles: {[name: string]: ImageFile};
        audioFiles: {[name: string]: AudioFile};
    }
    
    export interface Animation extends Labeled {
        fps: number;
        loop: boolean;
        delay: number;
        randomDelay: boolean;
    }
    
    export interface Tween extends Labeled {
        from: any;
        to: any;
        duration: number;
    }
    
    export interface Effects {
        animations: {[name: string]: Animation};
        tweens: {[name: string]: Tween};
    }
    
    export interface Sprite extends Labeled {
        image: ImageFile;
        animation: Animation;
    }
    
    export interface Sound extends Labeled {
        audio: AudioFile;
        volume: number;
        loop: boolean;
        fadeIn: boolean;
        fadeOut: boolean;
        duration: number;
    }
    
    export enum SoundAction {
        _NONE_ = 0, _PLAY_, _STOP_
    }
    
    export interface Action extends Labeled {
        set: any;
        tween: Tween;
        sound: SoundAction;
    }
    
    export interface Cast extends Labeled {
        name: string; // default displayed name
        sprites: Sprite[];
        sounds: Sound[];
    }
    
    export type SpriteList = {[name: string]: Sprite};
    export type SoundList = {[name: string]: Sound};
    export type ActionList = {[name: string]: Action};
    
    export interface Stuff {
        sprites: SpriteList;
        sounds: SoundList;
        actions: ActionList;
    }
    
    export enum LineTarget {
        _GROUP_, _SPRITE_, _SOUND_
    }
    
    export interface LinkText {
        text: string;
        line_label: string;
    }
    
    export interface Caption {
        name: string; // displayed name
        speed: number; // charactor per seconds
        text: string|LinkText|Array<string|LinkText>;
    }
    
    export interface Line extends Labeled {
        index: number;
        cast: Cast;
        action: Action;
        target: LineTarget;
        sprites: Sprite[];
        sounds: Sound[];
        caption: Caption;
    }
    
    export type CastList = {[name: string]: Cast};
    
    export interface Scenario {
        resources: Resources;
        effects: Effects;
        stuff: Stuff;
        casts: CastList;
        lines: Line[];
    }

    class _Image implements ImageFile {
        label: string;
        url: string;
        width: number;
        height: number;
        frames: number;

        constructor(label: string, obj: any) {
            this.label = label;
            this.url = ('url' in obj)? obj['url']: '';            
            this.width = ('width' in obj)? obj['width']: 1;            
            this.height = ('height' in obj)? obj['height']: 1;            
            this.frames = ('frames' in obj)? obj['frames']: 1;           
        }
    }
    
    class _Audio implements AudioFile {
        label: string;
        url: string;
        
        constructor(label: string, obj: any) {
            this.label = label;
            this.url = ('url' in obj)? obj['url']: '';
        }            
    }
    
    class _Animation implements Animation {
        label: string;
        fps: number;
        loop: boolean;
        delay: number;
        randomDelay: boolean;
        
        constructor(label: string, obj: any) {
            this.label = label;
            this.fps = ('fps' in obj)? obj['fps']: 60;
            this.loop = ('loop' in obj)? obj['loop']: true;
            this.delay = ('delay' in obj)? obj['delay']: 0;
            this.randomDelay = ('randomDelay' in obj)? obj['randomDelay']: false;
        }        
    }
    
    class _Tween implements Tween {
        label: string;
        from: any;
        to: any;
        duration: number;
        constructor(label: string, obj: any) {
            this.label = label;
            this.from = ('from' in obj)? obj['from']: {};
            this.to = ('to' in obj)? obj['to']: {};
            this.duration = ('duration' in obj)? obj['duration']: 1000;
        }
    }

    class _Sprite implements Sprite {
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
    
    class _Sound implements Sound {
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
            this.volume = ('volume' in obj)? obj['volume']: 1;
            this.loop = ('loop' in obj)? obj['loop']: false;
            this.fadeIn = ('fadeIn' in obj)? obj['fadeIn']: false;
            this.fadeOut = ('fadeOut' in obj)? obj['fadeOut']: false;
            this.duration = ('duration' in obj)? obj['duration']: 0;
        }
    }
    
    class _Action implements Action {
        label: string;
        set: any;
        tween: Tween;
        sound: SoundAction;
        
        constructor(label: string, obj: any, ef: Effects) {
            this.label = label;
            this.set = ('set' in obj)? obj['set']: {};
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
    
    class _Cast implements Cast{
        label: string;
        name: string; // default displayed name
        sprites: Sprite[];
        sounds: Sound[];

        constructor(label: string, obj: any, stuff:Stuff) {
            this.label = label;
            this.name = ('name' in obj)? obj['name']: '';
            
            this.sprites = [];
            if ('sprites' in obj && Array.isArray(obj['sprites'])) {
                let labels = <string[]> obj['sprites'];
                for (let i = 0; i < labels.length; i+=1) {
                    let l = labels[i];
                    this.sprites.push(l in stuff.sprites? stuff.sprites[l]: null);
                }
            }

            this.sounds = [];
            if ('sounds' in obj && Array.isArray(obj['sounds'])) {
                let labels = <string[]> obj['sounds'];
                for (let i = 0; i < labels.length; i+=1) {
                    let l = labels[i];
                    this.sounds.push(l in stuff.sounds? stuff.sounds[l]: null);
                }
            }
        }
    }
    
    class _LinkText implements LinkText {
        constructor(
            idx: number, 
            public text: string,
            public line_label: string
        ) { 
            if (typeof this.text !== 'string') {
                throw `[lines:${idx}] link text is ${typeof this.text}`
            }
            if (typeof this.line_label !== 'string') {
                throw `[lines:${idx}] label of linker destination is ${typeof this.line_label}`
            }
        }
    }
    
    class _Caption implements Caption {
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
    
    class _Line implements Line {
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
            if (Array.isArray(arg)) {
                let ids = <(number|string)[]>arg;
                for (let i = 0; i < ids.length; i+=1) {
                    if (typeof ids[i] === 'string') {
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
                    } else if (typeof ids[i] === 'number') {
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
            } else if (typeof arg === 'number') {
                let n = <number>arg;
                if (n < cast.sprites.length) {
                    this.sprites.push(cast.sprites[n]);
                } else {
                    throw `[lines:${idx}] ${cast.label}.sprites.length <= ${n}`;
                }
            } else if (typeof arg === 'string') {
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
            if (Array.isArray(arg)) {
                let ids = <(number|string)[]>arg;
                for (let i = 0; i < ids.length; i+=1) {
                    if (typeof ids[i] === 'string') {
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
                    } else if (typeof ids[i] === 'number') {
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
            } else if (typeof arg === 'number') {
                let n = <number>arg;
                if (n < cast.sounds.length) {
                    this.sounds.push(cast.sounds[n]);
                } else {
                    throw `[lines:${idx}] ${cast.label}.sounds.length <= ${n}`;
                }
            } else if (typeof arg === 'string') {
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
            if (Array.isArray(arg)) {
                let src = <(string|string[])[]>arg;
                if (src.length == 1) {
                    if (typeof src[0] == 'string') {
                        this.caption.text = src[0];
                    } else if (Array.isArray(src[0])) {
                        let lt = new _LinkText(idx, src[0][0], src[0][1]);
                        this.caption.text = lt;
                    }
                } else if (src.length > 1) {
                    let dst: (string|LinkText)[] = [];
                    for (let i = 0; i < src.length; i++) {
                        if (typeof src[i] === 'string') {
                            dst.push(<string>src[i]);
                        } else if (Array.isArray(src[i])) {
                            let lt = new _LinkText(idx, src[i][0], src[i][1]);
                            dst.push(lt);
                        } else {
                            throw `[lines:${idx}] there is something wrong in array[${i}]`;
                        }
                    }
                    this.caption.text = dst;
                } else {
                    throw `[lines:${idx}] there is no text`;
                }
            } else if (typeof arg === 'string') {
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

            if (Array.isArray(obj)) {
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
                    this.caption = new _Caption(idx,
                        lastLine.caption.name,
                        lastLine.caption.speed,
                        null);
                } else {
                    this.caption = new _Caption(idx, "", 5, null);
                }
                
                if (typeof obj[0] === 'string') {
                    /// [ "A", "FADE_OUT"],
                    this._setCast(idx, casts, obj[0]);
                } else if (Array.isArray(obj[0])) {
                    /// [["loop2"]],
                    if (typeof obj[0][0] === 'string') {
                        this.label = obj[0][0];
                    } else {
                        throw `[line:${idx}]2D array means label of Line`;
                    }
                    this._setCast(idx, casts, '_SCENE_');
                    return; // EOL
                }
                
                if (typeof obj[1] === 'string') {
                    /// [ "A", "FADE_OUT"],
                    this._setAction(idx, stuff.actions, obj[1]);
                    return; // EOL
                } else if (Array.isArray(obj[1])) {
                    ///[ "A", ["Loop?", ["Yes!", "loop2"], ["No!", "break2"] ] ],
                    // update caption
                    this._setCaptionText(idx, obj[1]);
                    return; // EOL
                } else if (typeof obj[1] === 'object') {
                    /// [ "B", {"set": {"x": 200}}],
                    this.action = new _Action('', obj[1], ef);
                    return; // EOL
                }
                /// end of Array.isArray(obj)
            } else if (typeof obj === 'string') {
                if (lastLine && lastLine.cast && lastLine.caption) {
                    this.cast = lastLine.cast;
                    this.caption = new _Caption( idx,
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
                } else if (typeof obj['label'] === 'string') {
                    this.label = <string>obj['label'];
                }
                
                if (!('cast' in obj)) {
                    this._setCast(idx, casts, '_SCENE_');
                } else if (typeof obj['cast'] === 'string') {
                    this._setCast(idx, casts, obj['cast']);
                } else {
                    throw `[Line:${idx}]"cast" should be string`;
                }
                
                if ('action' in obj) {
                    if (typeof obj['action'] === 'string') {
                        this._setAction(idx, stuff.actions, obj['action']);
                    } else {
                        this.action = new _Action('', obj['action'], ef); //literal in JSON
                    }
                } else {
                    // this line has no action
                }
                
                if (!('target' in obj)) {
                    this._setTarget(idx, '_GROUP_');
                } else if (typeof obj['target'] === 'string') {
                    this._setTarget(idx, obj['target']);
                }
                if ('sprites' in  obj) {
                    this._setSprites(idx, this.cast, obj['sprites']);
                }
                if ('sounds' in obj) {
                    this._setSounds(idx, this.cast, obj['sounds']);
                }
                if ('caption' in obj) {
                    if (typeof obj['caption'] === 'string' ||
                        Array.isArray(obj['caption'])) {
                        if ('cast' in obj) {
                            this.caption = new _Caption( idx,
                                this.cast.name,
                                5,
                                null);
                        } else if (lastLine && lastLine.cast && lastLine.caption){
                            this.cast = lastLine.cast;
                            this.caption = new _Caption( idx,
                                lastLine.caption.name,
                                lastLine.caption.speed,
                                null);
                        }
                        this._setCaptionText(idx, obj['caption']);
                    } else {
                        let c:Caption = obj['caption'];
                        if ('cast' in obj) {
                            this.caption = new _Caption( idx,
                                c.name? c.name : this.cast.name,
                                c.speed? c.speed: 5,
                                null);
                        } else if (lastLine && lastLine.cast && lastLine.caption){
                            this.cast = lastLine.cast;
                            this.caption = new _Caption( idx,
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
                    this.caption = new _Caption(idx,
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

    class _Scenario implements Scenario {

        resources: Resources;
        effects: Effects;
        stuff: Stuff;
        casts: CastList;
        lines: Line[];
        
        private _obj: any;
        private _lineIndex: {[label:string]: number}

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
                        this.resources.imageFiles[k] = new _Image(k, imgs[k]);
                    }
                } else throw `define 'imageFiles'`;
                if ('audioFiles' in rc) {
                    let audios = rc['audioFiles'];
                    for (let k in audios) {
                        this.resources.audioFiles[k] = new _Audio(k, audios[k]);
                    }
                } else throw `define 'audioFiles'`;
            } else throw `define 'resources'`;
            
            if ('effects' in this._obj) {
                let ef = this._obj['effects'];
                if ('animations' in ef) {
                    let anims = ef['animations'];
                    for (let k in anims) {
                        this.effects.animations[k] = new _Animation(k, anims[k]);
                    }
                } else throw `define 'animations'`;
                if ('tweens' in ef) {
                    let tws = ef['tweens'];
                    for (let k in tws) {
                        this.effects.tweens[k] = new _Tween(k, tws[k]);
                    }
                } else throw `define 'tweens'`;
            } else throw `define 'effects'`;
            
            if ('stuff' in this._obj) {
                let st = this._obj['stuff'];
                if ('sprites' in st) {
                    let sprts = st['sprites'];
                    for (let k in sprts) {
                        this.stuff.sprites[k] = new _Sprite(k, sprts[k], this.resources, this.effects);
                    }
                } else throw `define 'sprites'`;
                if ('sounds' in st) {
                    let snds = st['sounds'];
                    for (let k in snds) {
                        this.stuff.sounds[k] = new _Sound(k, snds[k], this.resources, this.effects);
                    }
                } else throw `define 'sounds'`;
                if ('actions' in st) {
                    let acts = st['actions'];
                    for (let k in acts) {
                        this.stuff.actions[k] = new _Action(k, acts[k], this.effects);
                    }
                } else throw `define 'actions'`;
            } else throw `define 'stuff'`;
            
            if ('casts' in this._obj) {
                let casts = this._obj['casts'];
                for (let k in casts) {
                    this.casts[k] = new _Cast(k, casts[k], this.stuff);
                }
            } else throw `define 'casts'`;

            if ('lines' in this._obj && Array.isArray(this._obj['lines'])) {
                let ls = <any[]>this._obj['lines'];
                for (let idx = 0; idx < ls.length; idx += 1) {
                    let l = new _Line(idx, ls[idx], this);
                    this.lines.push(l);
                    this._lineIndex[l.label] = idx;
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
        return new _Scenario(jsonText);
    }

    export class Serif {
        private _message: string;
        private _position: number;
        private _charPerFrame: number;

        constructor(msg: string, speed: number = 5, fps: number = 60.0) {
            this._position = 0;
            this._message = msg;
            this._charPerFrame = speed / fps;
        }

        update() {
            if (this._position < this._message.length)
                this._position += this._charPerFrame;
        }

        getText(): string {
            return this._message.slice(0, this._position);
        }

        isSpeaking(): boolean {
            return this._position < this._message.length;
        }

        reset() {
            this._position = 0;
        }
    }

}

