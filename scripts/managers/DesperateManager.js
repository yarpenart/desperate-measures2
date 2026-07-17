export class DesperateManager {


    static getFailures(actor) {

        return actor.getFlag(
            "desperate-measures",
            "failures"
        ) ?? 0;

    }



    static async addFailures(actor, amount) {


        const current = this.getFailures(actor);


        const newValue = Math.min(
            current + amount,
            3
        );


        await actor.setFlag(
            "desperate-measures",
            "failures",
            newValue
        );


        return newValue;

    }



    static async reset(actor) {


        await actor.setFlag(
            "desperate-measures",
            "failures",
            0
        );

    }


}