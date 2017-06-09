/* @flow weak */

import Question from "../Question";

import Base from "./Base";
import Database from "./Database";
import Field from "./Field";

import type { SchemaName } from "metabase/meta/types/Table";

import Dimension from "../Dimension";

import _ from "underscore";

//** This is the primary way people interact with tables */
export default class Table extends Base {
    displayName: string;
    description: string;

    schema: ?SchemaName;
    db: Database;

    fields: Field[];

    get database() {
        return this.db;
    }

    newQuestion(): Question {
        // $FlowFixMe
        return new Question();
    }

    dimensions(): Dimension[] {
        return this.fields.map(field => field.dimension());
    }

    aggregations() {
        return this.aggregation_options || [];
    }

    aggregation(agg) {
        return _.findWhere(this.aggregations(), { short: agg });
    }
}