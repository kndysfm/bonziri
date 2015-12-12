/// <reference path="game.ts" />
/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/vue.d.ts" />
//'use strict'

var jsonText = "";

function JsonRequestListener () {
    let txt: string = this.responseText;
    let el:JQuery = $('#inputText');
    el.val(txt);

    new Game.Director('gameContent', Bonziri.generateScenario(txt));
    
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

function reloadText() {
    $('#gameContent').children().remove();
    let el:JQuery = $('#inputText');
    new Game.Director('gameContent', Bonziri.generateScenario(el.val()));
}
