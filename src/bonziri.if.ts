//'use strict'
 
namespace Bonziri {
    
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
        getLineIndex: (label:string) => number;
    }

} // namespace