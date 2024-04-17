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

class DatabaseModule extends AdvancedBase {
    async install (context) {
        const services = context.get('services');

        const { StrategizedService } = require('./services/StrategizedService');
        const { SqliteDatabaseAccessService } = require('./services/database/SqliteDatabaseAccessService');
        services.registerService('database', StrategizedService, {
            strategy_key: 'engine',
            strategies: {
                sqlite: [SqliteDatabaseAccessService],
            }
        })
    }
}

module.exports = DatabaseModule;
