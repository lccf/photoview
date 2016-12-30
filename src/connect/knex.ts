import * as Knex from 'knex';
import { dbConfig } from './config';

export default Knex(dbConfig);