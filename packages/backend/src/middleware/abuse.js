/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
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
const APIError = require("../api/APIError");
const { Context } = require("../util/context");

const abuse = options => (req, res, next) => {
    // const svc_abuse = x.get('services').get('abuse-prevention');
    const requester = Context.get('requester');

    if ( options.no_bots ) {
        if ( requester.is_bot ) {
            if ( options.shadow_ban_responder ) {
                return options.shadow_ban_responder(req, res);
            }
            throw APIError.create('forbidden');
        }
    }

    if ( options.puter_origin ) {
        if ( ! requester.is_puter_origin() ) {
            throw APIError.create('forbidden');
        }
    }

    next();
};

module.exports = abuse;
