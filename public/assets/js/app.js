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
    var Is;
    (function (Is) {
        function _type(name) {
            return function (x) { return typeof x === name; };
        }
        Is.obj = _type('object');
        Is.num = _type('number');
        Is.str = _type('string');
        Is.bool = _type('boolean');
        Is.arr = Array.isArray;
    })(Is || (Is = {}));
    var Has;
    (function (Has) {
        function _val() {
            return function (obj, name, defaultVal) { return name in obj ? obj[name] : defaultVal; };
        }
        Has.num = _val();
        Has.str = _val();
        Has.bool = _val();
        Has.obj = _val();
    })(Has || (Has = {}));
    var Impl;
    (function (Impl) {
        var Image = (function () {
            function Image(label, obj) {
                this.label = label;
                this.url = Has.str(obj, 'url', '');
                this.width = Has.num(obj, 'width', 1);
                this.height = Has.num(obj, 'height', 1);
                this.frames = Has.num(obj, 'frames', 1);
            }
            return Image;
        })();
        var Audio = (function () {
            function Audio(label, obj) {
                this.label = label;
                this.url = Has.str(obj, 'url', '');
            }
            return Audio;
        })();
        var Animation = (function () {
            function Animation(label, obj) {
                this.label = label;
                this.fps = Has.num(obj, 'fps', 60);
                this.loop = Has.bool(obj, 'loop', true);
                this.delay = Has.num(obj, 'delay', 0);
                this.randomDelay = Has.bool(obj, 'randomDelay', false);
            }
            return Animation;
        })();
        var Tween = (function () {
            function Tween(label, obj) {
                this.label = label;
                this.from = Has.obj(obj, 'from', null);
                this.to = Has.obj(obj, 'to', null);
                this.duration = Has.num(obj, 'duration', 1000);
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
                this.volume = Has.num(obj, 'volume', 1);
                this.loop = Has.bool(obj, 'loop', false);
                this.fadeIn = Has.bool(obj, 'fadeIn', false);
                this.fadeOut = Has.bool(obj, 'fadeOut', false);
                this.duration = Has.num(obj, 'duration', 0);
            }
            return Sound;
        })();
        var Action = (function () {
            function Action(label, obj, ef) {
                this.label = label;
                this.set = Has.obj(obj, 'set', null);
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
                this.name = Has.str(obj, 'name', '');
                this.sprites = [];
                if ('sprites' in obj && Is.arr(obj['sprites'])) {
                    var labels = obj['sprites'];
                    for (var i = 0; i < labels.length; i += 1) {
                        var l = labels[i];
                        this.sprites.push(l in stuff.sprites ? stuff.sprites[l] : null);
                    }
                }
                this.sounds = [];
                if ('sounds' in obj && Is.arr(obj['sounds'])) {
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
                if (!Is.str(this.text)) {
                    throw "[lines:" + idx + "] link text is " + typeof this.text;
                }
                if (!Is.str(this.line_label)) {
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
                if (Is.arr(obj)) {
                    var cast_label;
                    var action_label;
                    if (lastLine && lastLine.caption) {
                        this.caption = new Caption(idx, lastLine.caption.name, lastLine.caption.speed, null);
                    }
                    else {
                        this.caption = new Caption(idx, "", 5, null);
                    }
                    if (Is.str(obj[0])) {
                        this._setCast(idx, casts, obj[0]);
                    }
                    else if (Is.arr(obj[0])) {
                        if (Is.str(obj[0][0])) {
                            this.label = obj[0][0];
                        }
                        else {
                            throw "[line:" + idx + "]2D array means label of Line";
                        }
                        this._setCast(idx, casts, '_SCENE_');
                        return;
                    }
                    if (Is.str(obj[1])) {
                        this._setAction(idx, stuff.actions, obj[1]);
                        return;
                    }
                    else if (Is.arr(obj[1])) {
                        this._setCaptionText(idx, obj[1]);
                        return;
                    }
                    else if (typeof obj[1] === 'object') {
                        this.action = new Action('', obj[1], ef);
                        return;
                    }
                }
                else if (Is.str(obj)) {
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
                    else if (Is.str(obj['label'])) {
                        this.label = obj['label'];
                    }
                    if (!('cast' in obj)) {
                        this._setCast(idx, casts, '_SCENE_');
                    }
                    else if (Is.str(obj['cast'])) {
                        this._setCast(idx, casts, obj['cast']);
                    }
                    else {
                        throw "[Line:" + idx + "]\"cast\" should be string";
                    }
                    if ('action' in obj) {
                        if (Is.str(obj['action'])) {
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
                    else if (Is.str(obj['target'])) {
                        this._setTarget(idx, obj['target']);
                    }
                    if ('sprites' in obj) {
                        this._setSprites(idx, this.cast, obj['sprites']);
                    }
                    if ('sounds' in obj) {
                        this._setSounds(idx, this.cast, obj['sounds']);
                    }
                    if ('caption' in obj) {
                        if (Is.str(obj['caption']) ||
                            Is.arr(obj['caption'])) {
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
                if (Is.arr(arg)) {
                    var ids = arg;
                    for (var i = 0; i < ids.length; i += 1) {
                        if (Is.str(ids[i])) {
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
                        else if (Is.num(ids[i])) {
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
                else if (Is.num(arg)) {
                    var n = arg;
                    if (n < cast.sprites.length) {
                        this.sprites.push(cast.sprites[n]);
                    }
                    else {
                        throw "[lines:" + idx + "] " + cast.label + ".sprites.length <= " + n;
                    }
                }
                else if (Is.str(arg)) {
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
                if (Is.arr(arg)) {
                    var ids = arg;
                    for (var i = 0; i < ids.length; i += 1) {
                        if (Is.str(ids[i])) {
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
                        else if (Is.num(ids[i])) {
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
                else if (Is.num(arg)) {
                    var n = arg;
                    if (n < cast.sounds.length) {
                        this.sounds.push(cast.sounds[n]);
                    }
                    else {
                        throw "[lines:" + idx + "] " + cast.label + ".sounds.length <= " + n;
                    }
                }
                else if (Is.str(arg)) {
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
                if (Is.arr(arg)) {
                    var src = arg;
                    if (src.length == 1) {
                        if (Is.str(src[0])) {
                            this.caption.text = src[0];
                        }
                        else if (Is.arr(src[0])) {
                            var lt = new LinkText(idx, src[0][0], src[0][1]);
                            this.caption.text = lt;
                        }
                    }
                    else if (src.length > 1) {
                        var dst = [];
                        for (var i = 0; i < src.length; i++) {
                            if (Is.str(src[i])) {
                                dst.push(src[i]);
                            }
                            else if (Is.arr(src[i])) {
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
                else if (Is.str(arg)) {
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
                if ('lines' in this._obj && Is.arr(this._obj['lines'])) {
                    var ls = this._obj['lines'];
                    for (var idx = 0; idx < ls.length; idx += 1) {
                        var l = new Line(idx, ls[idx], this);
                        this.lines.push(l);
                        this._lineIndex[l.label] = idx;
                    }
                    for (var idx = 0; idx < this.lines.length; idx += 1) {
                        var l = this.lines[idx];
                        if (l.caption && l.caption.text) {
                            var lt = l.caption.text;
                            var checker = this._genLinkLabelCheck(this, idx);
                            if (Is.arr(l.caption.text)) {
                                var lts = l.caption.text;
                                for (var idx_1 = 0; idx_1 < lts.length; idx_1 += 1) {
                                    checker(lts[idx_1]);
                                }
                            }
                            else {
                                checker(lt);
                            }
                        }
                    }
                }
                else
                    throw "define 'lines'";
            }
            Scenario.prototype._genLinkLabelCheck = function (that, idx) {
                return function (lt) {
                    if (lt.line_label) {
                        if (!(lt.line_label in that._lineIndex)) {
                            throw "[Line:" + idx + "] label \"" + lt.line_label + "\" cannot be found";
                        }
                    }
                };
            };
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
        try {
            return Bonziri.Impl.generateScenario(jsonText);
        }
        catch (e) {
            var msg = 'JSON scenario decoding error:\r\n' + e;
            alert(msg);
        }
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
        Config.fontSizeScript = '32px';
        Config.textColorNormal = '#EEE';
        Config.textColorActive = '#F84';
        Config.textBoxSize = 16;
        Config.textBoxHeight = 40;
        return Config;
    })();
    var SpeakPacer = (function () {
        function SpeakPacer(msg, speed, fps) {
            if (speed === void 0) { speed = 5; }
            if (fps === void 0) { fps = 60.0; }
            this._position = 0;
            this._message = msg;
            this._charPerFrame = speed / fps;
            this._currentIndex = 0;
        }
        SpeakPacer.prototype.update = function () {
            var currText = this._message[this._currentIndex];
            if (this._position < currText.length) {
                this._position += this._charPerFrame;
            }
            else if (this._currentIndex < this._message.length - 1) {
                this._currentIndex += 1;
                this._position = 0;
            }
        };
        SpeakPacer.prototype.getText = function () {
            var currText = this._message[this._currentIndex];
            return currText.slice(0, this._position);
        };
        SpeakPacer.prototype.isSpeaking = function () {
            var currText = this._message[this._currentIndex];
            return this._currentIndex < this._message.length - 1 ||
                this._position < currText.length;
        };
        SpeakPacer.prototype.reset = function () {
            this._currentIndex = 0;
            this._position = 0;
        };
        SpeakPacer.prototype.getCurrentIndex = function () {
            return this._currentIndex;
        };
        return SpeakPacer;
    })();
    var CastManager = (function () {
        function CastManager(d, g, s, c) {
            this._showingLink = false;
            this._director = d;
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
            this.textBoxes = null;
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
        CastManager.prototype._resetTextBoxes = function () {
            var tb;
            for (var i = 0; i < this.textBoxes.length; i++) {
                tb = this.textBoxes[i];
                tb.text = '';
                tb.fill = Config.textColorNormal;
                tb.inputEnabled = false;
                tb.events.onInputUp.removeAll();
                tb.events.onInputOver.removeAll();
                tb.events.onInputOut.removeAll();
            }
            tb = this.nameBox;
            tb.text = '';
            tb.fill = Config.textColorNormal;
            tb.inputEnabled = false;
            this._showingLink = false;
        };
        CastManager.prototype._genJumpListener = function (label, idx_current) {
            var _this = this;
            return function () { return _this._director.jumpToLine(label, idx_current); };
        };
        CastManager.prototype._genOverListener = function (that) {
            return function () { return (that.fill = Config.textColorActive); };
        };
        CastManager.prototype._genOutListener = function (that) {
            return function () { return (that.fill = Config.textColorNormal); };
        };
        CastManager.prototype._speak = function (l) {
            var cap = l.caption;
            if (cap && cap.text) {
                if (cap.name) {
                    this.nameBox.text = cap.name;
                }
                var text = [];
                if (Array.isArray(cap.text)) {
                    var arr = cap.text;
                    var link;
                    for (var i = 0; i < arr.length; i++) {
                        if (typeof arr[i] === 'string') {
                            text[i] = arr[i];
                        }
                        else {
                            link = arr[i];
                            text[i] = link.text;
                            if (i >= this.textBoxes.length) {
                                throw "out of index of textBoxes";
                            }
                            else {
                                var tb = this.textBoxes[i];
                                tb.inputEnabled = true;
                                tb.events.onInputOver.add(this._genOverListener(tb));
                                tb.events.onInputOut.add(this._genOutListener(tb));
                                tb.events.onInputUp.add(this._genJumpListener(link.line_label, l.index));
                                this._showingLink = true;
                            }
                        }
                    }
                }
                else if (typeof cap.text === 'string') {
                    text[0] = cap.text;
                }
                else {
                    text[0] = cap.text.text;
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
                var idx = this._pacer.getCurrentIndex();
                if (this.textBoxes && idx < this.textBoxes.length) {
                    this.textBoxes[idx].text = this._pacer.getText();
                }
                return true;
            }
            else {
                return this._showingLink || !this._game.input.activePointer.isDown;
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
            if (a.set) {
                this._copyActionObject(obj, a.set, false);
            }
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
                            this._playSound(l.action, l.sounds[i]);
                        }
                        break;
                }
            }
            this._resetTextBoxes();
            this._speak(l);
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
                var man = new CastManager(this, this._game, this._scenario, c);
                this._castMans[c.label] = man;
            }
            var tg = this._game.add.group(this._game, 'text boxes', true);
            var tbs = [];
            tbs[0] = this._game.add.text(Config.textBoxSize, Config.castOriginY, '', { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            tbs[1] = this._game.add.text(Config.textBoxSize, Config.castOriginY + Config.textBoxHeight, '', { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            tbs[2] = this._game.add.text(Config.textBoxSize, Config.castOriginY + Config.textBoxHeight * 2, '', { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            var nb = this._game.add.text(Config.textBoxSize, Config.castOriginY - Config.textBoxHeight, '', { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            for (name in this._castMans) {
                this._castMans[name].textBoxes = tbs;
                this._castMans[name].nameBox = nb;
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
        Director.prototype.jumpToLine = function (lbl, idx_current) {
            var idx = this._scenario.getLineIndex(lbl);
            this._currentIndexOfLine = idx >= 0 ? idx : idx_current;
            this._isWaiting = false;
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
    var el = $('#inputText');
    el.val(txt);
    new Game.Director('gameContent', Bonziri.generateScenario(txt));
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
function reloadText() {
    $('#gameContent').children().remove();
    var el = $('#inputText');
    new Game.Director('gameContent', Bonziri.generateScenario(el.val()));
}
//# sourceMappingURL=app.js.map