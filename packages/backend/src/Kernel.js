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
const { AdvancedBase } = require("puter-js-common");
const { Context } = require('./util/context');

class Kernel extends AdvancedBase {
    constructor () {
        super();

        this.modules = [];
    }

    add_module (module) {
        this.modules.push(module);
    }

    _runtime_init () {
        const kvjs = require('@heyputer/kv.js');
        const kv = new kvjs();
        global.kv = kv;
        global.cl = console.log;

        const { RuntimeEnvironment } = require('./boot/RuntimeEnvironment');
        const { BootLogger } = require('./boot/BootLogger');

        // Temporary logger for boot process;
        // LoggerService will be initialized in app.js
        const bootLogger = new BootLogger();

        // Determine config and runtime locations
        const runtimeEnv = new RuntimeEnvironment({
            logger: bootLogger,
        });
        runtimeEnv.init();

        // polyfills
        require('./polyfill/to-string-higher-radix');
    }

    boot () {
        this._runtime_init();

        // const express = require('express')
        // const app = express();
        const config = require('./config');

        globalThis.xtra_log = () => {};
        if ( config.env === 'dev' ) {
            globalThis.xtra_log = (...args) => {
                // append to file in temp
                const fs = require('fs');
                const path = require('path');
                const log_path = path.join('/tmp/xtra_log.txt');
                fs.appendFileSync(log_path, args.join(' ') + '\n');
            }
        }

        const { consoleLogManager } = require('./util/consolelog');
        consoleLogManager.initialize_proxy_methods();

        // TODO: temporary dependency inversion; requires moving:
        //   - rm, so we can move mv
        //   - mv, so we can move mkdir
        //   - generate_default_fsentries, so we can move mkdir
        //   - mkdir, which needs an fs provider

        // === START: Initialize Service Registry ===
        const { Container } = require('./services/Container');

        const services = new Container();
        this.services = services;
        // app.set('services', services);

        const root_context = Context.create({
            services,
            config,
        }, 'app');
        globalThis.root_context = root_context;

        root_context.arun(async () => {
            await this._install_modules();
            await this._boot_services();
        });


        // Error.stackTraceLimit = Infinity;
        Error.stackTraceLimit = 200;
    }

    async _install_modules () {
        const { services } = this;

        for ( const module of this.modules ) {
            await module.install(Context.get());
        }

        try {
            await services.init();
        } catch (e) {
            // First we'll try to mark the system as invalid via
            // SystemValidationService. This might fail because this service
            // may not be initialized yet.

            const svc_systemValidation = (() => {
                try {
                    return services.get('system-validation');
                } catch (e) {
                    return null;
                }
            })();

            if ( ! svc_systemValidation ) {
                // If we can't mark the system as invalid, we'll just have to
                // throw the error and let the server crash.
                throw e;
            }

            await svc_systemValidation.mark_invalid(
                'failed to initialize services',
                e,
            );
        }

        for ( const module of this.modules ) {
            await module.install_legacy?.(Context.get());
        }

        services.ready.resolve();
        // provide services to helpers

        const { tmp_provide_services } = require('./helpers');
        tmp_provide_services(services);
    }

    async _boot_services () {
        const { services } = this;

        await services.ready;
        {
            const app = services.get('web-server').app;
            app.use(async (req, res, next) => {
                req.services = services;
                next();
            });
            await services.emit('boot.services-initialized');
            await services.emit('install.middlewares.context-aware', { app });
            await services.emit('install.routes', { app });
            await services.emit('install.routes-gui', { app });
        }

        // === END: Initialize Service Registry ===

        // self check
        (async () => {
            await services.ready;
            globalThis.services = services;
            const log = services.get('log-service').create('init');
            log.info('services ready');

            log.system('server ready', {
                deployment_type: globalThis.deployment_type,
            });
        })();


        await services.emit('start.webserver');
        await services.emit('ready.webserver');
    }
}

module.exports = { Kernel };
