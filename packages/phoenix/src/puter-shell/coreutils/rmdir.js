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
import { resolveRelativePath } from '../../util/path.js';

// TODO: add logic to check if directory is empty
// TODO: add check for `--dir`
// TODO: allow multiple paths

// DRY: very similar to `cd`
export default {
    name: 'rmdir',
    usage: 'rmdir [OPTIONS] DIRECTORY',
    description: 'Remove the DIRECTORY if it is empty.',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            parents: {
                description: 'Also remove empty parent directories',
                type: 'boolean',
                short: 'p'
            }
        }
    },
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        let [ target ] = positionals;
        target = resolveRelativePath(ctx.vars, target);

        await filesystem.rmdir(target);
    }
};
