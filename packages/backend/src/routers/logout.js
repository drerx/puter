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
"use strict"
const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth.js');
const config = require('../config');

// -----------------------------------------------------------------------// 
// POST /logout
// -----------------------------------------------------------------------//
router.post('/logout', auth, express.json(), async (req, res, next)=>{
    // check subdomain
    if(require('../helpers').subdomain(req) !== 'api' && require('../helpers').subdomain(req) !== '')
        next();
    // delete cookie
    res.clearCookie(config.cookie_name);
    // delete session
    (async () => {
        if ( ! req.token ) return;
        try {
            const svc_auth = req.services.get('auth');
            await svc_auth.remove_session_by_token(req.token);
        } catch (e) {
            console.log(e);
        }
    })()
    //---------------------------------------------------------
    // DANGER ZONE: delete temp user and all its data
    //---------------------------------------------------------
    if(req.user.password === null && req.user.email === null){
        const { deleteUser } = require('../helpers');
        deleteUser(req.user.id);
    }
    // send response
    res.send('logged out');
})

module.exports = router