/// <reference path="bonziri.impl.ts" />
//'use strict'
 
namespace Bonziri {

    export function generateScenario(jsonText: string): Scenario {
        try {
            return Impl.generateScenario(jsonText);
        } catch (e) {
            alert(e);
            throw e;
        }
    }

}

