import chalk from 'chalk';
import mssql from 'mssql';

import { log } from '../../utils.js';

const config = {
  server: 'lsql-externo.leadlovers.site',
  port: 24339,
  user: 'sys.helpcenter',
  password: 'SaIJz4BH4Dx4fjksaogK',
  database: 'helpCenter',
  trustServerCertificate: true
};

export const bulk = async table => {
  try {
    const pool = await mssql.connect(config);
    const { rowsAffected } = await pool.request().bulk(table);

    return rowsAffected;
  } catch (err) {
    log(err, 'error');
    process.exit(1);
  }
};

export const query = async (command, parameters) => {
  try {
    const pool = await mssql.connect(config);
    const request = pool.request();

    if (parameters) {
      Object.entries(parameters).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    const result = await request.query(command);

    if (!result?.recordset?.length) {
      return undefined;
    }

    if (result.recordset.length === 1) {
      return result.recordset[0];
    }

    return result.recordset;
  } catch (err) {
    log(err, 'error');
    process.exit(1);
  }
};

mssql.on('error', err => {
  log(err, 'error');
  process.exit(1);
});
