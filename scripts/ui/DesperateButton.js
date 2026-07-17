export class DesperateButton {


    static createButton(app, html) {
        console.log(
    "Desperate Measures | Creating Button"
);


        const actor = app.actor;


        if (!actor) return;


        const failures =
            actor.getFlag(
                "desperate-measures",
                "failures"
            ) ?? 0;


        const bloodied =
            actor.getFlag(
                "desperate-measures",
                "bloodied"
            );


        const button = $(`
        <div class="desperate-container">

            <h3>
            🔥 Desperate Measures
            </h3>

            <p>
            Status:
            ${
                bloodied
                ? "🩸 BLOODIED"
                : "Normal"
            }
            </p>


            <p>
            Failures:
            ${"☠".repeat(failures)}
            ${"○".repeat(3-failures)}
            </p>


            <button class="desperate-open">
            Use Desperate Measure
            </button>

        </div>
        `);


        button.find(
            ".desperate-open"
        ).click(()=>{

            ui.notifications.info(
                "Desperate Measures menu coming soon"
            );

        });


        html.find(
            ".window-content"
        ).append(button);


    }


}