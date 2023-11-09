import { grid } from "../../algo/grid";
import { SimulationOptions } from "./models";

export class simulationService {
    

    getSimOptions() {
        const algoVersion = <'v0.1' | 'v0.2'>(<HTMLInputElement>document.querySelector('input[name="algo-version"]:checked')).value;
        const riskFactor = Number((<HTMLInputElement>document.getElementById("risk-factor-sim")).value);
        const runCount = Number((<HTMLInputElement>document.getElementById("iteration-count")).value);
        
        const maps = this.getMap();

        const options: SimulationOptions = {
            maps,
            runCount,
            algoVersion,
            riskFactor
        }
        return options;
    }

    getMap() {
        //Todo: hook up to save service when working with file system
        return [grid]
    }
}
