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

// About
export default {
    id: 'usage',
    title_i18n_key: 'usage',
    icon: 'speedometer-outline.svg',
    html: () => {
        return `
            <h1>Usage</h1>
            <div class="driver-usage">
                <h3 style="margin-bottom: 5px; font-size: 14px;">${i18n('storage_usage')}</h3>
                <div style="font-size: 13px; margin-bottom: 3px;">
                    <span id="storage-used"></span>
                    <span> used of </span>
                    <span id="storage-capacity"></span>
                    <span id="storage-puter-used-w" style="display:none;">&nbsp;(<span id="storage-puter-used"></span> ${i18n('storage_puter_used')})</span>
                </div>
                <div id="storage-bar-wrapper">
                    <span id="storage-used-percent"></span>
                    <div id="storage-bar"></div>
                    <div id="storage-bar-host"></div>
                </div>
            </div>`;
    },
    init: ($el_window) => {
        $.ajax({
            url: api_origin + "/drivers/usage",
            type: 'GET',
            async: true,
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + auth_token
            },
            statusCode: {
                401: function () {
                    logout();
                },
            },
            success: function (res) {
                let h = ''; // Initialize HTML string for driver usage bars

                // Loop through user services
                res.user.forEach(service => {
                    const { monthly_limit, monthly_usage } = service;
                    let usageDisplay = ``;

                    if (monthly_limit !== null) {
                        let usage_percentage = (monthly_usage / monthly_limit * 100).toFixed(0);
                        usage_percentage = usage_percentage > 100 ? 100 : usage_percentage; // Cap at 100%
                        usageDisplay = `
                            <div class="driver-usage" style="margin-bottom: 10px;">
                                <h3 style="margin-bottom: 5px; font-size: 14px;">${service.service['driver.interface']} (${service.service['driver.method']}):</h3>
                                <span style="font-size: 13px; margin-bottom: 3px;">${monthly_usage} used of ${monthly_limit}</span>
                                <div class="usage-progbar-wrapper" style="width: 100%;">
                                    <div class="usage-progbar" style="width: ${usage_percentage}%;"><span class="usage-progbar-percent">${usage_percentage}%</span></div>
                                </div>
                            </div>
                        `;
                    }
                    else {
                        usageDisplay = `
                            <div class="driver-usage" style="margin-bottom: 10px;">
                                <h3 style="margin-bottom: 5px; font-size: 14px;">${service.service['driver.interface']} (${service.service['driver.method']}):</h3>
                                <span style="font-size: 13px; margin-bottom: 3px;">${i18n('usage')}: ${monthly_usage} (${i18n('unlimited')})</span>
                            </div>
                        `;
                    }
                    h += usageDisplay;
                });

                // Append driver usage bars to the container
                $('.settings-content[data-settings="usage"]').append(`<div class="driver-usage-container">${h}</div>`);
            }
        });

        // df
        $.ajax({
            url: api_origin + "/df",
            type: 'GET',
            async: true,
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + auth_token
            },
            statusCode: {
                401: function () {
                    logout();
                },
            },
            success: function (res) {
                let usage_percentage = (res.used / res.capacity * 100).toFixed(0);
                usage_percentage = usage_percentage > 100 ? 100 : usage_percentage;

                let general_used = res.used;

                let host_usage_percentage = 0;
                if ( res.host_used ) {
                    $('#storage-puter-used').html(byte_format(res.used));
                    $('#storage-puter-used-w').show();

                    general_used = res.host_used;
                    host_usage_percentage = ((res.host_used - res.used) / res.capacity * 100).toFixed(0);
                }

                $('#storage-used').html(byte_format(general_used));
                $('#storage-capacity').html(byte_format(res.capacity));
                $('#storage-used-percent').html(
                    usage_percentage + '%' +
                    (host_usage_percentage > 0
                        ? ' / ' + host_usage_percentage + '%' : '')
                );
                $('#storage-bar').css('width', usage_percentage + '%');
                $('#storage-bar-host').css('width', host_usage_percentage + '%');
                if (usage_percentage >= 100) {
                    $('#storage-bar').css({
                        'border-top-right-radius': '3px',
                        'border-bottom-right-radius': '3px',
                    });
                }
            }
        });
    },
};
