const { assert } = require('chai');
const fs = require('fs-extra'); 
const { initDB } = require('../../src/db');
const { getDbDir } = require('../../src/config');

describe('db', () => {
  before(async () => {
    await initDB();
  })


  it('12', () => {
    assert.isFalse(false);
  });

  after(async () => {
    fs.removeSync(getDbDir())
  })
})



