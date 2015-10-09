//'use strict'
var Bonziri;
(function (Bonziri) {
    (function (SoundAction) {
        SoundAction[SoundAction["_NONE_"] = 0] = "_NONE_";
        SoundAction[SoundAction["_PLAY_"] = 1] = "_PLAY_";
        SoundAction[SoundAction["_STOP_"] = 2] = "_STOP_";
    })(Bonziri.SoundAction || (Bonziri.SoundAction = {}));
    var SoundAction = Bonziri.SoundAction;
    (function (LineTarget) {
        LineTarget[LineTarget["_GROUP_"] = 0] = "_GROUP_";
        LineTarget[LineTarget["_SPRITE_"] = 1] = "_SPRITE_";
        LineTarget[LineTarget["_SOUND_"] = 2] = "_SOUND_";
    })(Bonziri.LineTarget || (Bonziri.LineTarget = {}));
    var LineTarget = Bonziri.LineTarget;
})(Bonziri || (Bonziri = {}));
/// <reference path="bonziri.if.ts" />
//'use strict'
var Bonziri;
(function (Bonziri) {
    var Impl;
    (function (Impl) {
        var Image = (function () {
            function Image(label, obj) {
                this.label = label;
                this.url = ('url' in obj) ? obj['url'] : '';
                this.width = ('width' in obj) ? obj['width'] : 1;
                this.height = ('height' in obj) ? obj['height'] : 1;
                this.frames = ('frames' in obj) ? obj['frames'] : 1;
            }
            return Image;
        })();
        var Audio = (function () {
            function Audio(label, obj) {
                this.label = label;
                this.url = ('url' in obj) ? obj['url'] : '';
            }
            return Audio;
        })();
        var Animation = (function () {
            function Animation(label, obj) {
                this.label = label;
                this.fps = ('fps' in obj) ? obj['fps'] : 60;
                this.loop = ('loop' in obj) ? obj['loop'] : true;
                this.delay = ('delay' in obj) ? obj['delay'] : 0;
                this.randomDelay = ('randomDelay' in obj) ? obj['randomDelay'] : false;
            }
            return Animation;
        })();
        var Tween = (function () {
            function Tween(label, obj) {
                this.label = label;
                this.from = ('from' in obj) ? obj['from'] : {};
                this.to = ('to' in obj) ? obj['to'] : {};
                this.duration = ('duration' in obj) ? obj['duration'] : 1000;
            }
            return Tween;
        })();
        var Sprite = (function () {
            function Sprite(label, obj, rc, ef) {
                this.label = label;
                if ('image' in obj && obj['image'] in rc.imageFiles) {
                    this.image = rc.imageFiles[obj['image']];
                }
                else {
                    this.image = null;
                }
                if ('animation' in obj && obj['animation'] in ef.animations) {
                    this.animation = ef.animations[obj['animation']];
                }
                else {
                    this.animation = null;
                }
            }
            return Sprite;
        })();
        var Sound = (function () {
            function Sound(label, obj, rc, ef) {
                this.label = label;
                if ('audio' in obj && obj['audio'] in rc.audioFiles) {
                    this.audio = rc.audioFiles[obj['audio']];
                }
                else {
                    this.audio = null;
                }
                this.volume = ('volume' in obj) ? obj['volume'] : 1;
                this.loop = ('loop' in obj) ? obj['loop'] : false;
                this.fadeIn = ('fadeIn' in obj) ? obj['fadeIn'] : false;
                this.fadeOut = ('fadeOut' in obj) ? obj['fadeOut'] : false;
                this.duration = ('duration' in obj) ? obj['duration'] : 0;
            }
            return Sound;
        })();
        var Action = (function () {
            function Action(label, obj, ef) {
                this.label = label;
                this.set = ('set' in obj) ? obj['set'] : {};
                if ('tween' in obj && obj['tween'] in ef.tweens) {
                    this.tween = ef.tweens[obj['tween']];
                }
                else {
                    this.tween = null;
                }
                var sa;
                if ('sound' in obj && obj['sound'] in Bonziri.SoundAction) {
                    sa = Bonziri.SoundAction[obj['sound']];
                    this.sound = sa;
                }
                else {
                    this.sound = Bonziri.SoundAction._NONE_;
                }
            }
            return Action;
        })();
        var Cast = (function () {
            function Cast(label, obj, stuff) {
                this.label = label;
                this.name = ('name' in obj) ? obj['name'] : '';
                this.sprites = [];
                if ('sprites' in obj && Array.isArray(obj['sprites'])) {
                    var labels = obj['sprites'];
                    for (var i = 0; i < labels.length; i += 1) {
                        var l = labels[i];
                        this.sprites.push(l in stuff.sprites ? stuff.sprites[l] : null);
                    }
                }
                this.sounds = [];
                if ('sounds' in obj && Array.isArray(obj['sounds'])) {
                    var labels = obj['sounds'];
                    for (var i = 0; i < labels.length; i += 1) {
                        var l = labels[i];
                        this.sounds.push(l in stuff.sounds ? stuff.sounds[l] : null);
                    }
                }
            }
            return Cast;
        })();
        var LinkText = (function () {
            function LinkText(idx, text, line_label) {
                this.text = text;
                this.line_label = line_label;
                if (typeof this.text !== 'string') {
                    throw "[lines:" + idx + "] link text is " + typeof this.text;
                }
                if (typeof this.line_label !== 'string') {
                    throw "[lines:" + idx + "] label of linker destination is " + typeof this.line_label;
                }
            }
            return LinkText;
        })();
        var Caption = (function () {
            function Caption(idx, name, speed, text) {
                this.name = name;
                this.speed = speed;
                this.text = text;
                if (speed <= 0) {
                    throw "[lines:" + idx + "] speed should be value > 0";
                }
            }
            return Caption;
        })();
        var Line = (function () {
            function Line(idx, obj, scene) {
                var ef = scene.effects, stuff = scene.stuff, casts = scene.casts, lastLine = scene.lines[idx - 1];
                this.index = idx | 0;
                this.label = '';
                this.cast = null;
                this.action = null;
                this.target = Bonziri.LineTarget._GROUP_;
                this.sprites = [];
                this.sounds = [];
                this.caption = null;
                if (Array.isArray(obj)) {
                    var cast_label;
                    var action_label;
                    if (lastLine && lastLine.caption) {
                        this.caption = new Caption(idx, lastLine.caption.name, lastLine.caption.speed, null);
                    }
                    else {
                        this.caption = new Caption(idx, "", 5, null);
                    }
                    if (typeof obj[0] === 'string') {
                        this._setCast(idx, casts, obj[0]);
                    }
                    else if (Array.isArray(obj[0])) {
                        if (typeof obj[0][0] === 'string') {
                            this.label = obj[0][0];
                        }
                        else {
                            throw "[line:" + idx + "]2D array means label of Line";
                        }
                        this._setCast(idx, casts, '_SCENE_');
                        return;
                    }
                    if (typeof obj[1] === 'string') {
                        this._setAction(idx, stuff.actions, obj[1]);
                        return;
                    }
                    else if (Array.isArray(obj[1])) {
                        this._setCaptionText(idx, obj[1]);
                        return;
                    }
                    else if (typeof obj[1] === 'object') {
                        this.action = new Action('', obj[1], ef);
                        return;
                    }
                }
                else if (typeof obj === 'string') {
                    if (lastLine && lastLine.cast && lastLine.caption) {
                        this.cast = lastLine.cast;
                        this.caption = new Caption(idx, lastLine.caption.name, lastLine.caption.speed, obj);
                    }
                    else {
                        throw "[Line:" + idx + "]please pass a filled last Line object";
                    }
                }
                else if (typeof obj == 'object') {
                    if (!('label' in obj)) {
                        this.label = '';
                    }
                    else if (typeof obj['label'] === 'string') {
                        this.label = obj['label'];
                    }
                    if (!('cast' in obj)) {
                        this._setCast(idx, casts, '_SCENE_');
                    }
                    else if (typeof obj['cast'] === 'string') {
                        this._setCast(idx, casts, obj['cast']);
                    }
                    else {
                        throw "[Line:" + idx + "]\"cast\" should be string";
                    }
                    if ('action' in obj) {
                        if (typeof obj['action'] === 'string') {
                            this._setAction(idx, stuff.actions, obj['action']);
                        }
                        else {
                            this.action = new Action('', obj['action'], ef);
                        }
                    }
                    else {
                    }
                    if (!('target' in obj)) {
                        this._setTarget(idx, '_GROUP_');
                    }
                    else if (typeof obj['target'] === 'string') {
                        this._setTarget(idx, obj['target']);
                    }
                    if ('sprites' in obj) {
                        this._setSprites(idx, this.cast, obj['sprites']);
                    }
                    if ('sounds' in obj) {
                        this._setSounds(idx, this.cast, obj['sounds']);
                    }
                    if ('caption' in obj) {
                        if (typeof obj['caption'] === 'string' ||
                            Array.isArray(obj['caption'])) {
                            if ('cast' in obj) {
                                this.caption = new Caption(idx, this.cast.name, 5, null);
                            }
                            else if (lastLine && lastLine.cast && lastLine.caption) {
                                this.cast = lastLine.cast;
                                this.caption = new Caption(idx, lastLine.caption.name, lastLine.caption.speed, null);
                            }
                            this._setCaptionText(idx, obj['caption']);
                        }
                        else {
                            var c = obj['caption'];
                            if ('cast' in obj) {
                                this.caption = new Caption(idx, c.name ? c.name : this.cast.name, c.speed ? c.speed : 5, null);
                            }
                            else if (lastLine && lastLine.cast && lastLine.caption) {
                                this.cast = lastLine.cast;
                                this.caption = new Caption(idx, c.name ? c.name : lastLine.caption.name, c.speed ? c.speed : lastLine.caption.speed, null);
                            }
                            if (c.text) {
                                this._setCaptionText(idx, c.text);
                            }
                        }
                        if (!this.caption) {
                            throw "[Line:" + idx + "] bad \"caption\"";
                        }
                    }
                    else if (lastLine && lastLine.caption) {
                        this.caption = new Caption(idx, lastLine.caption.name, lastLine.caption.speed, null);
                    }
                }
                else {
                    throw "[Line:" + idx + "] failed to map object";
                }
            }
            Line.prototype._setCast = function (idx, casts, label) {
                if (label in casts) {
                    this.cast = casts[label];
                }
                else {
                    throw "[lines:" + idx + "] there is such a cast " + label;
                }
            };
            Line.prototype._setAction = function (idx, actions, label) {
                if (label in actions) {
                    this.action = actions[label];
                }
                else {
                    throw "[lines:" + idx + "] there is such a action " + label;
                }
            };
            Line.prototype._setTarget = function (idx, key) {
                if (key in Bonziri.LineTarget) {
                    var val = Bonziri.LineTarget[key];
                    this.target = val;
                }
                else {
                    throw "[lines:" + idx + "] LineTarget." + key + " is undefined";
                }
            };
            Line.prototype._setSprites = function (idx, cast, arg) {
                if (Array.isArray(arg)) {
                    var ids = arg;
                    for (var i = 0; i < ids.length; i += 1) {
                        if (typeof ids[i] === 'string') {
                            var found = false;
                            for (var j = 0; j < cast.sprites.length; j++) {
                                if (cast.sprites[j].label == ids[i]) {
                                    this.sprites.push(cast.sprites[j]);
                                    found = true;
                                }
                            }
                            if (!found) {
                                throw "[lines:" + idx + "] cast " + cast.label + " does not have sprite " + ids[i];
                            }
                        }
                        else if (typeof ids[i] === 'number') {
                            var n = ids[i];
                            if (n < cast.sprites.length) {
                                this.sprites.push(cast.sprites[n]);
                            }
                            else {
                                throw "[lines:" + idx + "] " + cast.label + ".sprites.length <= " + n;
                            }
                        }
                        else {
                            throw "[lines:" + idx + "] there is such a sprite " + ids[i];
                        }
                    }
                }
                else if (typeof arg === 'number') {
                    var n = arg;
                    if (n < cast.sprites.length) {
                        this.sprites.push(cast.sprites[n]);
                    }
                    else {
                        throw "[lines:" + idx + "] " + cast.label + ".sprites.length <= " + n;
                    }
                }
                else if (typeof arg === 'string') {
                    var found = false;
                    for (var j = 0; j < cast.sprites.length; j++) {
                        if (cast.sprites[j].label == arg) {
                            this.sprites.push(cast.sprites[j]);
                            found = true;
                        }
                    }
                    if (!found) {
                        throw "[lines:" + idx + "] cast " + cast.label + " does not have sprite " + arg;
                    }
                }
                else {
                    throw "[lines:" + idx + "] wrong type of 'sprites': " + arg;
                }
            };
            Line.prototype._setSounds = function (idx, cast, arg) {
                if (Array.isArray(arg)) {
                    var ids = arg;
                    for (var i = 0; i < ids.length; i += 1) {
                        if (typeof ids[i] === 'string') {
                            var found = false;
                            for (var j = 0; j < cast.sounds.length; j++) {
                                if (cast.sounds[j].label == ids[i]) {
                                    this.sounds.push(cast.sounds[j]);
                                    found = true;
                                }
                            }
                            if (!found) {
                                throw "[lines:" + idx + "] cast " + cast.label + " does not have sound " + ids[i];
                            }
                        }
                        else if (typeof ids[i] === 'number') {
                            var n = ids[i];
                            if (n < cast.sounds.length) {
                                this.sounds.push(cast.sounds[n]);
                            }
                            else {
                                throw "[lines:" + idx + "] " + cast.label + ".sounds.length <= " + n;
                            }
                        }
                        else {
                            throw "[lines:" + idx + "] there is such a sound " + ids[i];
                        }
                    }
                }
                else if (typeof arg === 'number') {
                    var n = arg;
                    if (n < cast.sounds.length) {
                        this.sounds.push(cast.sounds[n]);
                    }
                    else {
                        throw "[lines:" + idx + "] " + cast.label + ".sounds.length <= " + n;
                    }
                }
                else if (typeof arg === 'string') {
                    var found = false;
                    for (var j = 0; j < cast.sounds.length; j++) {
                        if (cast.sounds[j].label == arg) {
                            this.sounds.push(cast.sounds[j]);
                            found = true;
                        }
                    }
                    if (!found) {
                        throw "[lines:" + idx + "] cast " + cast.label + " does not have sound " + arg;
                    }
                }
                else {
                    throw "[lines:" + idx + "] wrong type of 'sounds': " + arg;
                }
            };
            Line.prototype._setCaptionText = function (idx, arg) {
                if (Array.isArray(arg)) {
                    var src = arg;
                    if (src.length == 1) {
                        if (typeof src[0] == 'string') {
                            this.caption.text = src[0];
                        }
                        else if (Array.isArray(src[0])) {
                            var lt = new LinkText(idx, src[0][0], src[0][1]);
                            this.caption.text = lt;
                        }
                    }
                    else if (src.length > 1) {
                        var dst = [];
                        for (var i = 0; i < src.length; i++) {
                            if (typeof src[i] === 'string') {
                                dst.push(src[i]);
                            }
                            else if (Array.isArray(src[i])) {
                                var lt = new LinkText(idx, src[i][0], src[i][1]);
                                dst.push(lt);
                            }
                            else {
                                throw "[lines:" + idx + "] there is something wrong in array[" + i + "]";
                            }
                        }
                        this.caption.text = dst;
                    }
                    else {
                        throw "[lines:" + idx + "] there is no text";
                    }
                }
                else if (typeof arg === 'string') {
                    this.caption.text = arg;
                }
            };
            return Line;
        })();
        var Scenario = (function () {
            function Scenario(jsonText) {
                this._obj = JSON.parse(jsonText);
                this.resources = { imageFiles: {}, audioFiles: {} };
                this.effects = { animations: {}, tweens: {} };
                this.stuff = { sprites: {}, sounds: {}, actions: {} };
                this.casts = {};
                this.lines = [];
                this._lineIndex = {};
                if ('resources' in this._obj) {
                    var rc = this._obj['resources'];
                    if ('imageFiles' in rc) {
                        var imgs = rc['imageFiles'];
                        for (var k in imgs) {
                            this.resources.imageFiles[k] = new Image(k, imgs[k]);
                        }
                    }
                    else
                        throw "define 'imageFiles'";
                    if ('audioFiles' in rc) {
                        var audios = rc['audioFiles'];
                        for (var k in audios) {
                            this.resources.audioFiles[k] = new Audio(k, audios[k]);
                        }
                    }
                    else
                        throw "define 'audioFiles'";
                }
                else
                    throw "define 'resources'";
                if ('effects' in this._obj) {
                    var ef = this._obj['effects'];
                    if ('animations' in ef) {
                        var anims = ef['animations'];
                        for (var k in anims) {
                            this.effects.animations[k] = new Animation(k, anims[k]);
                        }
                    }
                    else
                        throw "define 'animations'";
                    if ('tweens' in ef) {
                        var tws = ef['tweens'];
                        for (var k in tws) {
                            this.effects.tweens[k] = new Tween(k, tws[k]);
                        }
                    }
                    else
                        throw "define 'tweens'";
                }
                else
                    throw "define 'effects'";
                if ('stuff' in this._obj) {
                    var st = this._obj['stuff'];
                    if ('sprites' in st) {
                        var sprts = st['sprites'];
                        for (var k in sprts) {
                            this.stuff.sprites[k] = new Sprite(k, sprts[k], this.resources, this.effects);
                        }
                    }
                    else
                        throw "define 'sprites'";
                    if ('sounds' in st) {
                        var snds = st['sounds'];
                        for (var k in snds) {
                            this.stuff.sounds[k] = new Sound(k, snds[k], this.resources, this.effects);
                        }
                    }
                    else
                        throw "define 'sounds'";
                    if ('actions' in st) {
                        var acts = st['actions'];
                        for (var k in acts) {
                            this.stuff.actions[k] = new Action(k, acts[k], this.effects);
                        }
                    }
                    else
                        throw "define 'actions'";
                }
                else
                    throw "define 'stuff'";
                if ('casts' in this._obj) {
                    var casts = this._obj['casts'];
                    for (var k in casts) {
                        this.casts[k] = new Cast(k, casts[k], this.stuff);
                    }
                }
                else
                    throw "define 'casts'";
                if ('lines' in this._obj && Array.isArray(this._obj['lines'])) {
                    var ls = this._obj['lines'];
                    for (var idx = 0; idx < ls.length; idx += 1) {
                        var l = new Line(idx, ls[idx], this);
                        this.lines.push(l);
                        this._lineIndex[l.label] = idx;
                    }
                }
                else
                    throw "define 'lines'";
            }
            Scenario.prototype.getLineIndex = function (label) {
                return label in this._lineIndex ? this._lineIndex[label] : -1;
            };
            return Scenario;
        })();
        function generateScenario(jsonText) {
            return new Scenario(jsonText);
        }
        Impl.generateScenario = generateScenario;
    })(Impl = Bonziri.Impl || (Bonziri.Impl = {}));
})(Bonziri || (Bonziri = {}));
/// <reference path="bonziri.impl.ts" />
//'use strict'
var Bonziri;
(function (Bonziri) {
    function generateScenario(jsonText) {
        return Bonziri.Impl.generateScenario(jsonText);
    }
    Bonziri.generateScenario = generateScenario;
})(Bonziri || (Bonziri = {}));
/// <reference path="lib/phaser.comments.d.ts" />
/// <reference path="bonziri.ts" />
//'use strict'
var Game;
(function (Game) {
    var _B = Bonziri;
    var _P = Phaser;
    var Config = (function () {
        function Config() {
        }
        Config.worldWidth = 800;
        Config.worldHeight = 600;
        Config.castOriginX = 400;
        Config.castOriginY = 450;
        return Config;
    })();
    var SpeakPacer = (function () {
        function SpeakPacer(msg, speed, fps) {
            if (speed === void 0) { speed = 5; }
            if (fps === void 0) { fps = 60.0; }
            this._position = 0;
            this._message = msg;
            this._charPerFrame = speed / fps;
        }
        SpeakPacer.prototype.update = function () {
            if (this._position < this._message.length)
                this._position += this._charPerFrame;
        };
        SpeakPacer.prototype.getText = function () {
            return this._message.slice(0, this._position);
        };
        SpeakPacer.prototype.isSpeaking = function () {
            return this._position < this._message.length;
        };
        SpeakPacer.prototype.reset = function () {
            this._position = 0;
        };
        return SpeakPacer;
    })();
    var CastManager = (function () {
        function CastManager(g, s, c) {
            this._game = g;
            this._scenario = s;
            this._cast = c;
            var group = g.add.group(g.world, c.label, true);
            group.visible = false;
            this._group = group;
            this._sprites = {};
            for (var i = 0; i < c.sprites.length; i++) {
                var cfg = c.sprites[i];
                var img = cfg.image;
                var spr = null;
                var anim = null;
                if (cfg.image) {
                    spr = g.add.sprite(Config.castOriginX, Config.castOriginY, img.label, undefined, group);
                    spr.anchor.set(0.5, 1.0);
                    spr.visible = false;
                    if (cfg.animation) {
                        anim = spr.animations.add(cfg.animation.label, undefined, cfg.animation.fps, false, true);
                        anim.onComplete.add(this._genAnimationCallback(cfg.animation));
                        anim.play(cfg.animation.fps, false, false);
                    }
                }
                this._sprites[cfg.label] = { config: cfg, sprite: spr, animation: anim };
            }
            this._sounds = {};
            for (var i = 0; i < c.sounds.length; i++) {
                var cfg = c.sounds[i];
                var aud = cfg.audio;
                var snd = new _P.Sound(g, aud.label);
                snd.loop = cfg.loop;
                snd.volume = cfg.volume;
                snd.duration = cfg.duration;
                snd.paused = true;
                this._sounds[cfg.label] = { config: cfg, sound: snd };
            }
            this._tweening = this._speaking = false;
            this.textBox = null;
        }
        CastManager.prototype._genAnimationCallback = function (img) {
            var that = this;
            if (img.loop) {
                if (!img.delay || img.delay == 0) {
                    return function (s, a) { a.play(); };
                }
                else {
                    var delay = img.delay * (img.randomDelay ? 1 : 2 * Math.random());
                    return function (s, a) {
                        var t = that._game.time.events.add(delay, function () {
                            a.play();
                            that._game.time.events.remove(t);
                        });
                    };
                }
            }
            else {
                return function (s, a) { };
            }
        };
        CastManager.prototype.destroy = function () {
            for (var l in this._sprites) {
                this._sprites[l].sprite.destroy();
            }
            for (var l in this._sounds) {
                this._sounds[l].sound.destroy();
            }
            this._group.destroy();
        };
        CastManager.prototype._speak = function (cap) {
            if (cap && cap.text) {
                var text;
                if (Array.isArray(cap.text)) {
                    text = '';
                    var arr = cap.text;
                    for (var i = 0; i < arr.length; i++) {
                        if (typeof arr[i] === 'string') {
                            text += arr[i] + '\n';
                        }
                        else {
                            text += arr[i].text + '\n';
                        }
                    }
                }
                else if (typeof cap.text === 'string') {
                    text = cap.text;
                }
                else {
                    text = cap.text.text;
                }
                this._pacer = new SpeakPacer(text, cap.speed, this._game.time.desiredFps);
            }
            else {
                this._speaking = false;
            }
        };
        CastManager.prototype._updateSpeak = function () {
            if (this._pacer && this._pacer.isSpeaking()) {
                this._pacer.update();
                if (this._game.input.activePointer.isDown) {
                    this._pacer.update();
                }
                if (this.textBox) {
                    this.textBox.text = this._pacer.getText();
                }
                return true;
            }
            else {
                return !this._game.input.activePointer.isDown;
            }
        };
        CastManager.prototype._updateTween = function () {
            return this._tween && this._tween.isRunning;
        };
        CastManager.prototype.isPlaying = function () {
            return this._tweening || this._speaking;
        };
        CastManager.prototype._copyActionObject = function (dst, src, forceCopy) {
            if (dst && src) {
                if (forceCopy) {
                    for (var field in src) {
                        dst[field] = src[field];
                    }
                }
                else {
                    for (var field in src) {
                        if (field in dst) {
                            dst[field] = src[field];
                        }
                    }
                }
            }
        };
        CastManager.prototype._executeAction = function (a, obj) {
            this._copyActionObject(obj, a.set, false);
            if (a.tween) {
                var tween = this._game.add.tween(obj);
                var from = {};
                var to = {};
                if (a.tween.from) {
                    this._copyActionObject(from, a.tween.from, true);
                    tween.from(from, (a.tween.duration ? a.tween.duration : 1000), _P.Easing.Cubic.Out);
                }
                if (a.tween.to) {
                    this._copyActionObject(to, a.tween.to, true);
                    tween.to(to, (a.tween.duration ? a.tween.duration : 1000), _P.Easing.Cubic.In);
                }
                tween.start();
                this._tween = tween;
            }
        };
        CastManager.prototype._playGroup = function (a) {
            this._executeAction(a, this._group);
            if (a.sound) {
                throw 'group sounds ???';
            }
        };
        CastManager.prototype._playSprite = function (a, config) {
            if (!(config.label in this._sprites)) {
                throw "cast " + this._cast.label + " doesn't have sprite " + config.label;
            }
            this._executeAction(a, this._sprites[config.label].sprite);
            if (a.sound) {
                throw 'sprite sounds ???';
            }
        };
        CastManager.prototype._playSound = function (a, target) {
            if (!(target.label in this._sounds)) {
                throw "cast " + this._cast.label + " doesn't have sprite " + target.label;
            }
            var config = this._sounds[target.label].config;
            var sound = this._sounds[target.label].sound;
            this._executeAction(a, sound);
            if (a.sound) {
                switch (a.sound) {
                    case _B.SoundAction._PLAY_:
                        if (config.fadeIn) {
                            sound.volume = config.volume;
                            sound.fadeIn(config.duration, config.loop);
                        }
                        else {
                            sound.play(undefined, undefined, config.volume, config.loop);
                        }
                        break;
                    case _B.SoundAction._STOP_:
                        if (config.fadeOut) {
                            sound.fadeOut(config.duration);
                        }
                        else {
                            sound.stop();
                        }
                        break;
                }
            }
        };
        CastManager.prototype.play = function (l) {
            this._tweening = this._speaking = true;
            if (l.action) {
                switch (l.target) {
                    case _B.LineTarget._GROUP_:
                        this._playGroup(l.action);
                        break;
                    case _B.LineTarget._SPRITE_:
                        for (var i = 0; i < l.sprites.length; i++) {
                            this._playSprite(l.action, l.sprites[i]);
                        }
                        break;
                    case _B.LineTarget._SOUND_:
                        for (var i = 0; i < l.sounds.length; i++) {
                            this._cast;
                            this._playSound(l.action, l.sounds[i]);
                        }
                        break;
                }
            }
            this._speak(l.caption);
        };
        CastManager.prototype.update = function () {
            if (this._tweening) {
                this._tweening = this._updateTween();
            }
            if (this._speaking) {
                this._speaking = this._updateSpeak();
            }
        };
        return CastManager;
    })();
    var Director = (function () {
        function Director(id, scenario) {
            this._game = new _P.Game(Config.worldWidth, Config.worldHeight, _P.AUTO, id, {
                preload: this._genCallback(this.preload),
                create: this._genCallback(this.create),
                update: this._genCallback(this.update),
                render: this._genCallback(this.render) });
            ;
            this._scenario = scenario;
        }
        Director.prototype._genCallback = function (method) {
            var that = this;
            return function () {
                method.apply(that);
            };
        };
        Director.prototype.preload = function () {
            var imgs = this._scenario.resources.imageFiles;
            for (var l in imgs) {
                var img = imgs[l];
                if (img.frames < 2) {
                    this._game.load.image(img.label, img.url, true);
                }
                else {
                    this._game.load.spritesheet(img.label, img.url, img.width, img.height, img.frames, 0, 0);
                }
            }
            var auds = this._scenario.resources.audioFiles;
            for (var l in auds) {
                var aud = auds[l];
                this._game.load.audio(aud.label, aud.url, true);
            }
        };
        Director.prototype.create = function () {
            this._castMans = {};
            var casts = this._scenario.casts;
            for (var l_1 in casts) {
                var c = casts[l_1];
                var man = new CastManager(this._game, this._scenario, c);
                this._castMans[c.label] = man;
            }
            var t = this._game.add.text(16, Config.castOriginY, '', { fontSize: '32px', fill: '#EEE' });
            for (name in this._castMans) {
                this._castMans[name].textBox = t;
            }
            this._currentIndexOfLine = 0;
            var l = this._scenario.lines[this._currentIndexOfLine];
            this._evaluateCommand(l);
        };
        Director.prototype.update = function () {
            if (this._isWaiting) {
                this._updateEvaluation();
            }
            else {
                this._currentIndexOfLine += 1;
                if (this._currentIndexOfLine < this._scenario.lines.length) {
                    var l = this._scenario.lines[this._currentIndexOfLine];
                    this._evaluateCommand(l);
                }
                else {
                }
            }
        };
        Director.prototype.render = function () {
            if (this._currentIndexOfLine < this._scenario.lines.length) {
                var idx_l = this._scenario.lines[this._currentIndexOfLine].index;
                this._game.debug.text("playing line " + idx_l.toFixed(0) + " ...", 16, Config.worldHeight - 16, '#EEE');
            }
            else {
                this._game.debug.text('game is over', 16, Config.worldHeight - 16, '#EEE');
            }
        };
        Director.prototype._evaluateCommand = function (ln) {
            this._currentCastName = ln.cast.label;
            if (this._currentCastName in this._castMans) {
                var man = this._castMans[ln.cast.label];
                man.play(ln);
            }
            else {
            }
            this._isWaiting = true;
        };
        Director.prototype._updateEvaluation = function () {
            if (this._currentCastName in this._castMans) {
                var man = this._castMans[this._currentCastName];
                if (man.isPlaying()) {
                    man.update();
                }
                else {
                    this._isWaiting = false;
                }
            }
            else {
                this._isWaiting = false;
            }
        };
        return Director;
    })();
    Game.Director = Director;
})(Game || (Game = {}));
/// <reference path="game.ts" />
/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/vue.d.ts" />
//'use strict'
var jsonText = "";
function JsonRequestListener() {
    var txt = this.responseText;
    var d = new Game.Director('gameContent', Bonziri.generateScenario(txt));
    var el = $('#inputText');
    el.val(txt);
    el.width($('#gameContent').width());
    el.height(window.innerHeight);
}
window.onload = function () {
    var x = '';
    var request = new XMLHttpRequest();
    request.onload = JsonRequestListener;
    request.open("get", "./scene.json", true);
    request.send();
};
//# sourceMappingURL=app.js.map