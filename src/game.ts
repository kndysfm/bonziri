/// <reference path="lib/phaser.comments.d.ts" />
/// <reference path="bonziri.ts" />
//'use strict'

namespace Game {    
    import _B = Bonziri;
    import _P = Phaser;
    
    class Config {
        static worldWidth:number = 800;
        static worldHeight:number = 600;
        static castOriginX:number = 400;
        static castOriginY:number = 450;
        static fontSizeScript:any = '32px';
        static textColorNormal:any = '#EEE';
        static textColorActive:any = '#F84';
        static textBoxSize:number = 16;
        static textBoxHeight:number = 40;
    }
    
    interface _SpriteSet{
        config: _B.Sprite,
        sprite: _P.Sprite,
        animation: _P.Animation
    }
    
    interface _SoundSet { 
        config: _B.Sound,
        sound: _P.Sound
    }
    
    class SpeakPacer {
        private _message: string[];
        private _position: number;
        private _charPerFrame: number;
        private _currentIndex: number;
    
        constructor(msg: string[], speed: number = 5, fps: number = 60.0) {
            this._position = 0;
            this._message = msg;
            this._charPerFrame = speed / fps;
            this._currentIndex = 0;
        }
    
        update() {
            let currText = this._message[this._currentIndex];
            if (this._position < currText.length) {
                this._position += this._charPerFrame;
            } else if (this._currentIndex < this._message.length - 1) {
                this._currentIndex += 1;
                this._position = 0;
            } 
        }
    
        getText(): string {
            let currText = this._message[this._currentIndex];
            return currText.slice(0, this._position);
        }
    
        isSpeaking(): boolean {
            let currText = this._message[this._currentIndex];
            return this._currentIndex < this._message.length - 1 ||
                this._position < currText.length;
        }
    
        reset() {
            this._currentIndex = 0;
            this._position = 0;
        }
        
        getCurrentIndex(): number {
            return this._currentIndex;
        }
    }
    
    class CastManager {
        private _director: Director;
        private _game: _P.Game;
        private _scenario: _B.Scenario;
        private _cast: _B.Cast;
        private _group: _P.Group;
        
        private _sprites: {[label: string]: _SpriteSet};
        private _sounds: {[label: string]: _SoundSet};
        
        private _tweening:boolean;
        private _speaking:boolean;
        
        private _pacer: SpeakPacer;
        
        private _tween:_P.Tween;
        
        public textBoxes: _P.Text[];
        public nameBox: _P.Text;
        private _showingLink:boolean = false;
        
        constructor(d: Director, g: _P.Game, s: _B.Scenario, c:_B.Cast) {
            this._director = d;
            this._game = g;
            this._scenario = s;
            this._cast = c;
            let group = g.add.group(g.world, c.label, true);
            group.visible = false;
            this._group = group;
            
            // prepare Sprite objects
            this._sprites = {};
            for (let i = 0; i < c.sprites.length; i++) {
                let cfg = c.sprites[i];
                let img = cfg.image;
    
                let spr: _P.Sprite = null;
                let anim: _P.Animation = null;
                if (cfg.image) {
                    spr = g.add.sprite(
                        Config.castOriginX, Config.castOriginY, 
                        img.label, undefined, group);
                    spr.anchor.set(0.5, 1.0);
                    spr.visible = false;
                    if (cfg.animation) {
                        anim = spr.animations.add(cfg.animation.label, undefined, cfg.animation.fps, false, true);
                        anim.onComplete.add(this._genAnimationCallback(cfg.animation));
                        anim.play(cfg.animation.fps, false, false);
                    }
                }
                this._sprites[cfg.label] = {config:cfg, sprite:spr, animation:anim};
            }
            
            //!
            this._sounds = {};
            for (let i = 0; i < c.sounds.length; i++) {
                let cfg = c.sounds[i];
                let aud = cfg.audio;
                let snd = new _P.Sound(g, aud.label);
                snd.loop = cfg.loop;
                snd.volume = cfg.volume;
                snd.duration = cfg.duration;
                snd.paused = true;
                this._sounds[cfg.label] = {config:cfg, sound:snd};
            }
            this._tweening = this._speaking = false;
            this.textBoxes = null;
    
        }
        
        private _genAnimationCallback(img:_B.Animation): (s:_P.Sprite, a:_P.Animation)=>void
        {
            let that = this;
            if (img.loop) {
                if (!img.delay || img.delay == 0) {
                    return (s:_P.Sprite, a:_P.Animation) => { a.play(); };
                } else {
                    let delay = img.delay * (img.randomDelay? 1: 2*Math.random());
                    return (s:_P.Sprite, a:_P.Animation) => {
                            let t = that._game.time.events.add(delay, () => {
                                a.play(); 
                                that._game.time.events.remove(t);
                            })
                        };
                }
            } else {
                return (s:_P.Sprite, a:_P.Animation) => { };
            } 
        }
    
        destroy() {
            for (let l in this._sprites) {
                this._sprites[l].sprite.destroy();
            }
            
            for (let l in this._sounds) {
                this._sounds[l].sound.destroy();
            }
            
            this._group.destroy();        
        }
        
        private _resetTextBoxes() {
            let tb: _P.Text;
            for (let i = 0; i < this.textBoxes.length; i++) {
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
        }
        
        private _genJumpListener(label:string, idx_current:number):Function {
            return ()=>this._director.jumpToLine(label, idx_current);
        }
        
        private _genOverListener(that:_P.Text):Function {
            return ()=>(that.fill = Config.textColorActive);
        }
        
        private _genOutListener(that:_P.Text):Function {
            return ()=> (that.fill = Config.textColorNormal);
        }
        
        private _speak(l:_B.Line) {
            let cap = l.caption;
            if (cap && cap.text) {
                if (cap.name) {
                    this.nameBox.text = cap.name;
                }
                
                let text: string[] = [];
                if (Array.isArray(cap.text)) {
                    let arr = <(string|_B.LinkText)[]>cap.text;
                    let link: _B.LinkText;
                    for (let i = 0; i < arr.length; i++) {
                        if (typeof arr[i] === 'string') {
                            text[i] = <string>arr[i];
                        } else { // LinkText
                            link = <_B.LinkText>arr[i];
                            text[i] = link.text;
                            if (i >= this.textBoxes.length) {
                                throw `out of index of textBoxes`;
                            } else {
                                let tb = this.textBoxes[i];
                                tb.inputEnabled = true;
                                tb.events.onInputOver.add(this._genOverListener(tb));
                                tb.events.onInputOut.add(this._genOutListener(tb));
                                tb.events.onInputUp.add(
                                    this._genJumpListener(link.line_label, l.index));
                                this._showingLink = true;
                            }
                        }
                    }
                } else if (typeof cap.text === 'string') {
                    text[0] = <string>cap.text;
                } else {
                    text[0] = (<_B.LinkText>cap.text).text;
                }
                this._pacer = new SpeakPacer(text, cap.speed, this._game.time.desiredFps);
            }
            else {
                this._speaking = false;
            }
        }
        
        private _updateSpeak():boolean {
            if (this._pacer && this._pacer.isSpeaking()) {
                this._pacer.update();
                if (this._game.input.activePointer.isDown) {
                    this._pacer.update(); // double speed
                }
                let idx = this._pacer.getCurrentIndex();
                if (this.textBoxes && idx < this.textBoxes.length){
                    this.textBoxes[idx].text = this._pacer.getText();
                }
                return true; // continue current line
            } else {
                return this._showingLink || !this._game.input.activePointer.isDown;
            }
        }
        
        private _updateTween():boolean {
            return this._tween && this._tween.isRunning;
        }
        
        isPlaying(): boolean {
            return this._tweening || this._speaking;
        }
        
        private _copyActionObject(dst:any, src:any, forceCopy:boolean):void {
            if (dst && src) {
                if (forceCopy) {
                    for (let field in src) {
                        dst[field] = src[field];
                    }
                } else {
                    for (let field in src) {
                        if (field in dst) {
                            dst[field] = src[field];
                        }
                    }
                }
            }
        }
        
        private _executeAction(a:_B.Action, obj:any) {
            if (a.set) {
                this._copyActionObject(obj, a.set, false);
            }
            
            if (a.tween) {
                let tween = this._game.add.tween(obj);
                let from:any = {};
                let to:any = {};
                
                if (a.tween.from) {
                    this._copyActionObject(from, a.tween.from, true);
                    tween.from(from, (a.tween.duration? a.tween.duration: 1000), _P.Easing.Cubic.Out);
                }
                if (a.tween.to) {
                    this._copyActionObject(to, a.tween.to, true);
                    tween.to(to, (a.tween.duration? a.tween.duration: 1000), _P.Easing.Cubic.In);
                }
                tween.start();
                this._tween = tween;
            }
        }
        
        private _playGroup(a: _B.Action) {
            this._executeAction(a, this._group);
            if (a.sound) {
                throw 'group sounds ???'
            }
        }
        
        private _playSprite(a: _B.Action, config:_B.Sprite) {
            if (!(config.label in this._sprites)){
                throw `cast ${this._cast.label} doesn't have sprite ${config.label}`
            }
            this._executeAction(a, this._sprites[config.label].sprite);
            if (a.sound) {
                throw 'sprite sounds ???'
            }
        }
    
        private _playSound(a: _B.Action, target:_B.Sound) {
            if (!(target.label in this._sounds)){
                throw `cast ${this._cast.label} doesn't have sprite ${target.label}`
            }
            let config = this._sounds[target.label].config;
            let sound = this._sounds[target.label].sound;
            this._executeAction(a, sound);
            if (a.sound) {
                switch (a.sound) {
                case _B.SoundAction._PLAY_:
                    if (config.fadeIn) {
                        sound.volume = config.volume;
                        sound.fadeIn(config.duration, config.loop);
                    } else {
                        sound.play(undefined, undefined, config.volume, config.loop);
                    }
                    break;
                case _B.SoundAction._STOP_:
                    if (config.fadeOut) {
                        sound.fadeOut(config.duration);
                    } else {
                        sound.stop();
                    }
                    break;
                }
            }
        }
        
        play(l:_B.Line) {
            this._tweening = this._speaking = true;
    
            if (l.action) {
                switch(l.target) {
                case _B.LineTarget._GROUP_:
                    this._playGroup(l.action);
                    break;
                case _B.LineTarget._SPRITE_:
                    for (let i = 0; i < l.sprites.length; i++) {
                        this._playSprite(l.action, l.sprites[i])
                    }
                    break;
                case _B.LineTarget._SOUND_:
                    for (let i = 0; i < l.sounds.length; i++) {
                        this._playSound(l.action, l.sounds[i]);
                    }
                    break;
                }
            }
            
            this._resetTextBoxes();
            this._speak(l);
        }
        
        update() {
            if (this._tweening) {
                this._tweening = this._updateTween();
            }
            if (this._speaking) {
                this._speaking = this._updateSpeak();
            }
        }
    }
    
    export class Director {
        
        private _game: _P.Game;
        private _scenario: _B.Scenario;
        
        private _castMans: {[name:string]: CastManager};
        
        private _currentIndexOfLine: number;
        private _currentCastName:string; 
        
        private _isWaiting: boolean;
        
        constructor(id: string, scenario: _B.Scenario)
        {
            this._game = new _P.Game(
                Config.worldWidth, Config.worldHeight,
                _P.AUTO, id, { 
                    preload: this._genCallback(this.preload),
                    create: this._genCallback(this.create),
                    update: this._genCallback(this.update),
                    render: this._genCallback(this.render) });;
            this._scenario = scenario;
        }
        
        private _genCallback(method:()=>void): ()=>void {
            let that = this;
            return () => {        
                method.apply(that);
            };
        }
        
        preload(): void
        {
            let imgs = this._scenario.resources.imageFiles;
            for (let l in imgs)
            {
                let img = imgs[l];
                if (img.frames < 2) {
                    this._game.load.image(img.label, img.url, true);
                } else {
                    this._game.load.spritesheet(img.label, img.url, img.width, img.height, img.frames, 0, 0);
                }
            }
    
            let auds = this._scenario.resources.audioFiles;
            for (let l in auds)
            {
                let aud = auds[l];
                this._game.load.audio(aud.label, aud.url, true);
            }
        }
        
        create(): void 
        {
            // create castManagers
            this._castMans = {};
            let casts = this._scenario.casts;
            for (let l in casts){
                let c = casts[l];
                let man = new CastManager(this, this._game, this._scenario, c);
                this._castMans[c.label] = man;
            }
            // give text-box to display text
            let tg = this._game.add.group(this._game, 'text boxes', true);
            let tbs : _P.Text[] = [];
            tbs[0] = this._game.add.text(
                Config.textBoxSize, Config.castOriginY, '',
                { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            tbs[1] = this._game.add.text(
                Config.textBoxSize, Config.castOriginY + Config.textBoxHeight, '',
                { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            tbs[2] = this._game.add.text(
                Config.textBoxSize, Config.castOriginY + Config.textBoxHeight*2, '',
                { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            let nb: _P.Text = this._game.add.text(
                Config.textBoxSize, Config.castOriginY - Config.textBoxHeight, '',
                { fontSize: Config.fontSizeScript, fill: Config.textColorNormal }, tg);
            for (name in this._castMans) {
                this._castMans[name].textBoxes = tbs;
                this._castMans[name].nameBox = nb;
            }
            
            this._currentIndexOfLine = 0;
            let l = this._scenario.lines[this._currentIndexOfLine];
            this._evaluateCommand(l);
        }
        
        update(): void
        {
            if (this._isWaiting) {
                this._updateEvaluation();
            } else {
                this._currentIndexOfLine += 1;
                if (this._currentIndexOfLine < this._scenario.lines.length) {
                    let l = this._scenario.lines[this._currentIndexOfLine];
                    this._evaluateCommand(l);
                } else {
                }
            }
        }
        
        render(): void
        {
            if (this._currentIndexOfLine < this._scenario.lines.length) {
                let idx_l = this._scenario.lines[this._currentIndexOfLine].index;
                this._game.debug.text(`playing line ${idx_l.toFixed(0)} ...`, 16, Config.worldHeight-16, '#EEE');
            } else {
                this._game.debug.text('game is over', 16, Config.worldHeight-16, '#EEE');
            }        
        }
        
        jumpToLine(lbl:string, idx_current:number) {
            let idx = this._scenario.getLineIndex(lbl);
            this._currentIndexOfLine = idx >= 0? idx: idx_current;
            this._isWaiting = false;
        }
        
        private _evaluateCommand(ln:_B.Line)
        {
            this._currentCastName = ln.cast.label;
            if (this._currentCastName in this._castMans) {
                let man = this._castMans[ln.cast.label];
                man.play(ln);
            } else {
                //?? cast name is undefined
            }
            this._isWaiting = true;
        }
    
        private _updateEvaluation(): void
        {
            if (this._currentCastName in this._castMans) {
                let man = this._castMans[this._currentCastName];
                if (man.isPlaying()) {
                    man.update();
                } else {
                    this._isWaiting = false;
                }
            } else {
                //?? cast name is undefined
                this._isWaiting = false;
            }
        }
    }
} // namespace