/**
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

import UIWindow from './UIWindow.js'
import UIPopover from './UIPopover.js'

async function UIWindowGetCopyLink(options){
    let h = '';
    let copy_btn_text = 'Copy Link';
    let copied_btn_text = 'Copied!';
    const signature = await puter.fs.sign(null, {uid: options.uid, action: 'read'})
    const url = `${gui_origin}/?name=${encodeURIComponent(options.name)}&is_dir=${encodeURIComponent(options.is_dir)}&download=${encodeURIComponent(signature.items.read_url)}`;

    h += `<div>`;
        h += `<p style="font-size: 15px; font-weight: 400; -webkit-font-smoothing: antialiased; color: #474a57;">Share the following link with anyone and they will be able to receive a copy of <strong>${html_encode(options.name)}</strong></p>`;
        h += `<input type="text" style="margin-bottom:10px;" class="downloadable-link" readonly />`;
        h += `<button class="button button-primary copy-downloadable-link" style="width:130px;">${copy_btn_text}</button>`
        h += `<img class="share-copy-link-on-social" src="${window.icons['share-outline.svg']}">`;
    h += `</div>`;

    const el_window = await UIWindow({
        title: `Get Copy Link`,
        icon: null,
        uid: null,
        is_dir: false,
        body_content: h,
        has_head: true,
        selectable_body: false,
        draggable_body: false,
        allow_context_menu: false,
        is_resizable: false,
        is_droppable: false,
        init_center: true,
        allow_native_ctxmenu: true,
        allow_user_select: true,
        onAppend: function(el_window){
        },
        width: 500,
        dominant: true,
        window_css: {
            height: 'initial',
        },
        body_css: {
            width: 'initial',
            'max-height': 'calc(100vh - 200px)',
            'background-color': 'rgb(241 246 251)',
            'backdrop-filter': 'blur(3px)',
            'padding': '10px 20px 20px 20px',
            'height': 'initial',
        }    
    });

    $(el_window).find('.window-body .downloadable-link').val(url);

    $(el_window).find('.window-body .share-copy-link-on-social').on('click', function(e){    
        const social_links = socialLink({
            url: url, 
            title: i18n('get_a_copy_of_on_puter', options.name, false), 
            description: i18n('get_a_copy_of_on_puter', options.name, false),
        });

        let social_links_html = ``;
        social_links_html += `<div style="padding: 10px;">`;
            social_links_html += `<p style="margin: 0; text-align: center; margin-bottom: 6px; color: #484a57; font-weight: bold; font-size: 14px;">Share to</p>`
            social_links_html += `<a class="copy-link-social-btn" target="_blank" href="${social_links.twitter}" style=""><svg viewBox="0 0 24 24" aria-hidden="true" style="opacity: 0.7;"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg></a>`
            social_links_html += `<a class="copy-link-social-btn" target="_blank" href="${social_links.whatsapp}" style=""><img src="${window.icons['logo-whatsapp.svg']}"></a>`
            social_links_html += `<a class="copy-link-social-btn" target="_blank" href="${social_links.facebook}" style=""><img src="${window.icons['logo-facebook.svg']}"></a>`
            social_links_html += `<a class="copy-link-social-btn" target="_blank" href="${social_links.linkedin}" style=""><img src="${window.icons['logo-linkedin.svg']}"></a>`
            social_links_html += `<a class="copy-link-social-btn" target="_blank" href="${social_links.reddit}" style=""><img src="${window.icons['logo-reddit.svg']}"></a>`
            social_links_html += `<a class="copy-link-social-btn" target="_blank" href="${social_links['telegram.me']}" style=""><img src="${window.icons['logo-telegram.svg']}"></a>`
        social_links_html += '</div>';

        UIPopover({
            content: social_links_html,
            snapToElement: this,
            parent_element: this,
            // width: 300,
            height: 100,
            position: 'bottom',
        });    
    })

    $(el_window).find('.window-body .copy-downloadable-link').on('click', async function(e){
        var copy_btn = this;
        if (navigator.clipboard) {
            // Get link text
            const selected_text = $(el_window).find('.window-body .downloadable-link').val();
            // copy selected text to clipboard
            await navigator.clipboard.writeText(selected_text);
        }
        else{
            // Get the text field
            $(el_window).find('.window-body .downloadable-link').select();
            // Copy the text inside the text field
            document.execCommand('copy');
        }

        $(this).html(copied_btn_text);
        setTimeout(function(){
            $(copy_btn).html(copy_btn_text);
        }, 1000);
    });
}

export default UIWindowGetCopyLink