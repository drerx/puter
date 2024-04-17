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
import { Exit } from './coreutil_lib/exit.js';

export default {
    name: 'sleep',
    usage: 'sleep TIME',
    description: 'Pause for at least TIME seconds, where TIME is a positive number.',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        if (positionals.length !== 1) {
            await ctx.externs.err.write('sleep: Exactly one TIME parameter is required');
            throw new Exit(1);
        }

        let time = Number.parseFloat(positionals[0]);
        if (isNaN(time) || time < 0) {
            await ctx.externs.err.write('sleep: Invalid TIME parameter; must be a positive number');
            throw new Exit(1);
        }

        await new Promise(r => setTimeout(r, time * 1000));
    }
};
