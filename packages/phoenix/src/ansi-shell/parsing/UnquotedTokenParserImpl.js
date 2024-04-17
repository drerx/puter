/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
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
const list_ws = [' ', '\n', '\t'];
const list_quot = [`"`, `'`];
const list_stoptoken = [
    '|','>','<','&','\\','#',';','(',')',
    ...list_ws,
    ...list_quot
];

export class UnquotedTokenParserImpl {
    static meta = {
        inputs: 'bytes',
        outputs: 'node'
    }
    static data = {
        excludes: list_stoptoken
    }
    parse (lexer) {
        const { excludes } = this.constructor.data;
        let text = '';

        for ( ;; ) {
            const { done, value } = lexer.look();
            if ( done ) break;
            const str = String.fromCharCode(value);
            if ( excludes.includes(str) ) break;
            text += str;
            lexer.next();
        }

        if ( text.length === 0 ) return;
        
        return { $: 'symbol', text };
    }
}
