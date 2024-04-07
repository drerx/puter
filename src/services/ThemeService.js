import UIAlert from "../UI/UIAlert.js";
import { Service } from "../definitions.js";

const PUTER_THEME_DATA_FILENAME = '~/.__puter_gui.json';

const SAVE_COOLDOWN_TIME = 1000;

export class ThemeService extends Service {
    async _init () {
        this.state = {
            sat: 41.18,
            hue: 210,
            lig: 93.33,
            alpha: 0.8,
        };
        this.root = document.querySelector(':root');
        // this.ss = new CSSStyleSheet();
        // document.adoptedStyleSheets.push(this.ss);

        this.save_cooldown_ = undefined;

        let data = undefined;
        try {
            data = await puter.fs.read(PUTER_THEME_DATA_FILENAME);
            if ( typeof data === 'object' ) {
                data = await data.text();
            }
        } catch (e) {
            if ( e.code !== 'subject_does_not_exist' ) {
                // TODO: once we have an event log,
                //       log this error to the event log
                console.error(e);

                // We don't show an alert becuase it's likely
                // other things also aren't working.
            }
        }

        if ( data ) try {
            data = JSON.parse(data.toString());
        } catch (e) {
            data = undefined;
            console.error(e);

            UIAlert({
                title: 'Error loading theme data',
                message: `Could not parse "${PUTER_THEME_DATA_FILENAME}": ` +
                    e.message,
            });
        }

        if ( data && data.colors ) {
            this.state = {
                ...this.state,
                ...data.colors,
            };
            this.reload_();
        }
    }

    apply (values) {
        this.state = {
            ...this.state,
            ...values,
        };
        this.reload_();
        this.save_();
    }

    get (key) { return this.state[key]; }

    reload_ () {
        // debugger;
        const s = this.state;
        // this.ss.replace(`
        //     .taskbar, .window-head, .window-sidebar {
        //         background-color: hsla(${s.hue}, ${s.sat}%, ${s.lig}%, ${s.alpha});
        //     }
        // `)
        // this.root.style.setProperty('--puter-window-background', `hsla(${s.hue}, ${s.sat}%, ${s.lig}%, ${s.alpha})`);
        this.root.style.setProperty('--primary-hue', s.hue);
        this.root.style.setProperty('--primary-saturation', s.sat + '%');
        this.root.style.setProperty('--primary-lightness', s.lig + '%');
        this.root.style.setProperty('--primary-alpha', s.alpha);
    }

    save_ () {
        if ( this.save_cooldown_ ) {
            clearTimeout(this.save_cooldown_);
        }
        this.save_cooldown_ = setTimeout(() => {
            this.commit_save_();
        }, SAVE_COOLDOWN_TIME);
    }
    commit_save_ () {
        puter.fs.write(PUTER_THEME_DATA_FILENAME, JSON.stringify(
            { colors: this.state },
            undefined,
            4,
        ));
    }
}