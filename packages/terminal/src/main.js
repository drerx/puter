/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Puter's Terminal.
 *
 * Puter's Terminal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { PTY } from './pty/PTY';
import { XDocumentANSIShell } from './pty/XDocumentANSIShell';

class XTermIO {
    constructor ({ term, pty }) {
        this.term = term;
        this.pty = pty;
    }

    bind () {
        this.term.onKey(this.handleKey.bind(this));

        this.term.attachCustomKeyEventHandler(this.handleKeyBeforeProcess.bind(this));

        (async () => {
            for ( ;; ) {
                const chunk = (await this.pty.in.read()).value;
                this.term.write(chunk);
            }
        })();
    }

    async handleKeyBeforeProcess (evt) {
        console.log(
            'right this event might be up or down so it\'s necessary to determine which',
            evt,
        );
        if ( evt.key === 'V' && evt.ctrlKey && evt.shiftKey && evt.type === 'keydown' ) {
            const clipboard = navigator.clipboard;
            const text = await clipboard.readText();
            console.log(
                'this is the relevant text for this thing that is the thing that is the one that is here',
                text,
            );
            this.pty.out.write(text);
        }
    }

    handleKey ({ key, domEvent }) {
        console.log(
            'key event happened',
            key,
            domEvent,
        );
        const pty = this.pty;

        const handlers = {
            Enter: () => {
                pty.out.write('\n');
            },
            // Backspace: () => {
            //     pty.out.write('\x08');
            // },
            // Delete: () => {
            //     pty.out.write('\x1B[3~');
            // },
            Home: () => {
                pty.out.write('\x1B[H');
            },
            End: () => {
                pty.out.write('\x1B[F');
            }
        }
    
        if ( handlers.hasOwnProperty(domEvent.key) ) {
            const writeKey = handlers[domEvent.key]();
            if ( ! writeKey ) return;
        }

        pty.out.write(key);
    }
}

const TRUSTED_ORIGINS = [
    'https://puter.com',
    'https://github.com',
];

/*
 * Replaces xterm.js's default link handler to avoid warning users when we link
 * to trusted origins.
 */
const linkHandler = {};
linkHandler.activate = (e, url) => {
    // check for trusted origins
    const uri = new URL(url);
    if ( ! TRUSTED_ORIGINS.includes(uri.origin) ) {
        const answer = confirm(`Do you want to navigate to ${uri}?\n\nWARNING: This link could potentially be dangerous`);
        if ( ! answer ) return;
    }
    const newWindow = window.open();
    if ( ! newWindow ) {
        console.warn('Opening link blocked as opener could not be cleared');
        return;
    }
    try {
        newWindow.opener = null;
    } catch {
        // no-op, Electron can throw
    }
    newWindow.document.write('Redirecting from Puter Terminal...');
    newWindow.location.href = uri;
}

window.main_term = async () => {
    const pty = new PTY();
    const ptt = pty.getPTT();

    const shell = new XDocumentANSIShell({
        ptt
    });

    const phoenix = await puter.ui.launchApp('phoenix');
    shell.attachToApp(phoenix);

    // Close the shell when we exit
    puter.ui.onWindowClose(() => {
        phoenix.close();
        puter.exit();
    });

    const termEl = document.createElement('div');
    termEl.id = 'terminal';

    document.body.append(termEl);
    const term = new Terminal({
        linkHandler,
    });
    term.open(document.getElementById('terminal'));

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.onResize(evt => {
        shell.resize(evt);
    });

    fitAddon.fit();

    const termObserver = new ResizeObserver(() => {
        fitAddon.fit();
    });
    termObserver.observe(termEl);

    const ioController = new XTermIO({ term, pty });
    ioController.bind();

    term.focus();
};
