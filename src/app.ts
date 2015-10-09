/// <reference path="game.ts" />
/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/vue.d.ts" />
//'use strict'

var jsonText = ""

function JsonRequestListener () {
    let txt: string = this.responseText;
    
    let d = new Game.Director('gameContent', Bonziri.generateScenario(txt));
    
    let el:JQuery = $('#inputText');
    el.val(txt);
    el.width( $('#gameContent').width() );
    el.height ( window.innerHeight );
}


window.onload = () => {
    var x:string = '';
    var request = new XMLHttpRequest();
    request.onload = JsonRequestListener;
    request.open("get", "./scene.json", true);
    request.send();

};