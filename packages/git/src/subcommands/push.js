/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Puter's Git client.
 *
 * Puter's Git client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { determine_fetch_remote, determine_remote_url, find_repo_root } from '../git-helpers.js';
import { SHOW_USAGE } from '../help.js';

export default {
    name: 'push',
    usage: [
        'git push [<repository> [<refspec>...]]',
    ],
    description: `Send local changes to a remote repository.`,
    args: {
        allowPositionals: true,
        options: {
        },
    },
    execute: async (ctx) => {
        const { io, fs, env, args } = ctx;
        const { stdout, stderr } = io;
        const { options, positionals } = args;
        const cache = {};

        const { dir, gitdir } = await find_repo_root(fs, env.PWD);

        const remotes = await git.listRemotes({
            fs,
            dir,
            gitdir,
        });

        const remote = positionals.shift();
        const input_refspecs = [...positionals];

        if (input_refspecs.length === 0) {
            const branch = await git.currentBranch({ fs, dir, gitdir, test: true });
            if (!branch)
                throw new Error('You are not currently on a branch.');
            input_refspecs.push(branch);
        }

        const remote_url = await determine_remote_url(remote, remotes, {});

        // TODO: Grab all the refs from the remote. Or maybe only do that if we encounter a `:` refspec?

        // Parse the refspecs into a more useful format
        const refspecs = [];
        for (let refspec of input_refspecs) {
            const original_refspec = refspec;

            // Format is:
            // - Optional '+'
            // - Source
            // - ':'
            // - Dest
            //
            // Source and/or Dest may be omitted:
            // - If both are omitted, that's a special "push all branches that exist locally and on the remote".
            // - If only Dest is provided, delete it on the remote.
            // - If only Source is provided, use its default destination. (There's nuance here we can worry about later.)

            let force = false;

            if (refspec.startsWith('+')) {
                force = true;
                refspec = refspec.slice(1);
            }

            if (refspec === ':') {
                // TODO: Expand out to all known branches that exist on the remote.
                throw new Error(`The ':' refspec is not yet supported.`);
            }

            if (refspec.includes(':')) {
                const parts = refspec.split(':');
                if (parts.length > 2)
                    throw new Error(`Invalid refspec '${original_refspec}': Too many colons`);

                refspecs.push({
                    source: parts[0],
                    dest: parts[1],
                    force
                });
                continue;
            }

            refspecs.push({
                source: refspec,
                dest: undefined,
                force
            });
        }


        const push_ref = async (refspec) => {

            // First divide up the ref spec
            // Format is:
            // - Optional '+'
            // - Source
            // - ':'
            // - Dest
            //
            // Source and/or Dest may be omitted:
            // - If both are omitted, that's a special "push all branches that exist locally and on the remote".
            // - If only Dest is provided, delete it on the remote.
            // - If only Source is provided, use its default destination. (There's nuance here we can worry about later.)

            try {
                const result = await git.push({
                    fs,
                    http,
                    corsProxy: globalThis.__CONFIG__.proxy_url,
                    dir,
                    gitdir,
                    cache,
                    url: remote_url,
                    ref,
                    onMessage: (message) => {
                        stdout(message);
                    },
                    onAuth: (url, auth) => {
                        stderr('requesting auth for ' + url);
                        // TODO:
                        //     find_existing_login();
                        //     if (existing login) {
                        //         return existing login;
                        //     }
                        //     request username();
                        //     request password(); // on github this has to be a token, see https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
                        //     return login;
                        // FIXME: Implement this properly!!!
                        return {
                            username: '...',
                            password: '...',
                        };
                    },
                    onAuthSuccess: (url, auth) => {
                        stderr('successful auth for ' + url);
                    },
                    onAuthFailure: (url, auth) => {
                        stderr('failed auth for ' + url);
                    },
                });
                console.group('push result');
                console.log(result);
                console.log(JSON.stringify(result));
                console.groupEnd();
                return {
                    flag:,
                    summary: ,
                    from: ,
                    to: ,
                    reason: null,
                };
            } catch (e) {
                return {
                    flag:,
                    summary: ,
                    from: ,
                    to: ,
                    reason: e.data.reason,
                };
            };
        };

        const results = await Promise.allSettled(refspecs.map((refspec) => push_ref(refspec)));

        stdout(`To ${remote_url}`);
        for (const result of results) {

        }
    }
};
