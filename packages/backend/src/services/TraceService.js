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
const opentelemetry = require("@opentelemetry/api");

class TraceService {
    constructor () {
        this.tracer_ = opentelemetry.trace.getTracer(
            'puter-filesystem-tracer'
        );
    }

    get tracer () {
        return this.tracer_;
    }

    async spanify (name, fn) {
        return await this.tracer.startActiveSpan(name, async span => {
            try {
                return await fn({ span });
            } catch (error) {
                span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR, message: error.message });
                throw error;
            } finally {
                span.end();
            }
        });
    }
}

module.exports = {
    TraceService,
};
