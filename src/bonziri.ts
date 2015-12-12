/// <reference path="bonziri.impl.ts" />
//'use strict'
 
namespace Bonziri {

    export function generateScenario(jsonText: string): Scenario {
        try {
            return Impl.generateScenario(jsonText);
        } catch (e) {
            let msg = 'JSON scenario decoding error:\r\n' + e;
            alert(msg);
        }
    }

}

