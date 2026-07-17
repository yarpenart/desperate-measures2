export class BloodiedManager {

    static isBloodied(actor) {

        if (!actor) return false;

        const hp = actor.system.attributes.hp;

        if (!hp.value || !hp.max) {
            return false;
        }

        return hp.value <= (hp.max / 2);
    }


    static update(actor) {

        const bloodied = this.isBloodied(actor);


        actor.setFlag(
            "desperate-measures",
            "bloodied",
            bloodied
        );


        return bloodied;
    }

}