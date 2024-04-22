/**
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
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

import UIWindow from './UIWindow.js'
import UIWindowLogin from './UIWindowLogin.js'
import UIWindowSignup from './UIWindowSignup.js'

async function UIWindowSessionList(options){
    options = options ?? {};
    options.reload_on_success = options.reload_on_success ?? true;

    return new Promise(async (resolve) => {
        let h = '';
        h += `<div style="margin:10px;">`;
            h += `<div class="loading">${i18n('signing_in')}</div>`
            h += `<div style="overflow-y: scroll; max-width: 400px; margin: 0 auto;">`;
            h += `<h1 style="text-align: center; font-size: 18px; font-weight: normal; color: #757575;"><img src="${icons['logo-white.svg']}" style="padding: 4px; background-color: blue; border-radius: 5px; width: 25px; box-sizing: border-box; margin-bottom: -6px; margin-right: 6px;">${i18n('sign_in_with_puter')}</h1>`
            for (let index = 0; index < logged_in_users.length; index++) {
                const l_user = logged_in_users[index];
                h += `<div data-uuid="${l_user.uuid}" class="session-entry">${l_user.username}</div>`;
            }
            h += `</div>`;

            h += `<div style="margin-top: 20px; margin-bottom: 20px; text-align:center;"><span class="login-c2a-session-list">Log Into Another Account</span> &bull; <span class="signup-c2a-session-list">${i18n('create_account')}</span></div>`;
        h += `</div>`;

        const el_window = await UIWindow({
            title: 'Session List!',
            app: 'session-list',
            single_instance: true,
            icon: null,
            uid: null,
            is_dir: false,
            body_content: h,
            has_head: false,
            selectable_body: false,
            draggable_body: options.draggable_body ?? true,
            allow_context_menu: false,
            is_resizable: false,
            is_droppable: false,
            init_center: true,
            allow_native_ctxmenu: false,
            allow_user_select: false,
            width: 350,
            height: 'auto',
            dominant: true,
            show_in_taskbar: false,
            update_window_url: false,
            cover_page: options.cover_page ?? false,
            onAppend: function(this_window){
            },
            window_class: 'window-session-list',
            body_css: {
                width: 'initial',
                height: '100%',
                'background-color': 'rgb(245 247 249)',
                'backdrop-filter': 'blur(3px)',
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'center',
            },
        })
        $(el_window).find('.login-c2a-session-list').on('click', async function(e){
            const login = await UIWindowLogin({
                referrer: options.referrer, 
                reload_on_success: options.reload_on_success,
                cover_page: options.cover_page ?? false,
                has_head: options.has_head,
                send_confirmation_code: options.send_confirmation_code,
                window_options: {
                    has_head: false,
                    cover_page: options.cover_page ?? false,
                }
            });
            if(login){
                if(options.reload_on_success){
                    // disable native browser exit confirmation
                    window.onbeforeunload = null;            
                    // refresh
                    location.reload();
                }else{
                    resolve(login);
                }
            }
        })
        $(el_window).find('.signup-c2a-session-list').on('click', async function(e){
            $('.signup-c2a-clickable').parents('.window').close();
            // create Signup window
            const signup = await UIWindowSignup({
                referrer: options.referrer,
                reload_on_success: options.reload_on_success,
                send_confirmation_code: options.send_confirmation_code,
                window_options: {
                    has_head: false,
                    cover_page: options.cover_page ?? false,
                }

            });
            if(signup){
                if(options.reload_on_success){
                    // disable native browser exit confirmation
                    window.onbeforeunload = null;            
                    // refresh
                    location.reload();
                }else{
                    resolve(signup);
                }
            }
        })

        $(el_window).find('.session-entry').on('click', function(e){
            $(el_window).find('.loading').css({display: 'flex'});

            setTimeout(() => {
                let selected_uuid = $(this).attr('data-uuid');
                let selected_user;
                for (let index = 0; index < window.logged_in_users.length; index++) {
                    const l_user = logged_in_users[index];
                    if(l_user.uuid === selected_uuid){
                        selected_user = l_user;
                    }
                }

                // new logged in user
                update_auth_data(selected_user.auth_token, selected_user);
                if(options.reload_on_success){
                    // disable native browser exit confirmation
                    window.onbeforeunload = null;            
                    // refresh
                    location.reload();
                }else{
                    resolve(true);
                }
            }, 500);
        })
    })
}

export default UIWindowSessionList