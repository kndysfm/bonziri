#Bonziri
Bonziri is a generator of the interactive animation like a visual novel game.
A script written in JSON format is interpreted as a scenario of game.
This library depends on the Phaser( https://github.com/photonstorm/phaser ), HTML5 game framework.

#ぼんじり
ぼんじり はHTML5ゲーム用フレームワークPhaser( https://github.com/photonstorm/phaser )上で動くノベルゲームエンジンです。
ゲームのスクリプト部分はJSONフォーマットのテキストとして、プログラム本体から完全に独立しているのが特徴です。([サンプル](https://0d47981fd57185461f1207c1043d7930ce7d7da5.googledrive.com/host/0B0aZZ_akWo4KNUgzSkJOZmRRZjA/))

##なぜ作ったのか
携帯ゲームに代表されるようなビジュアルノベルゲームは、当然シナリオを書く人とゲーム自体を作る人はそれぞれ分業されており、
とくにシナリオライターは社外のフリーランスのひとだったりするようです(すでに伝聞)。

外注して納品されたテキストデータはその後、何故か更に良くわからない記号やら画像ファイル名やらを挿入する必要があり(スクリプト化と言うんだとか)、
その後テキストはエクセルのマクロでどうにかなって、なんやかんやでゲームプログラムの中に埋め込まれているらしいです。

この一連の流れに関する話を聞いて「もっと単純なフローにならないものかなあ」と思ったのと、ちょうど当時「TypeScriptで何かやってみたい」と思っていたので
JSONだけでブラウザ上で動くノベルゲームが作れる仕組みを考えてみました。

##なぜ「ぼんじり」なのか
上記のような情報をもたらしたさる方が「ぼんじりが攻略対象の乙女ゲームを作りたい」とよく分からないことを言っていたからです。

 