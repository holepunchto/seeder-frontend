const ram = require('random-access-memory')
const Hypercore = require('hypercore')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const ReadyResource = require('ready-resource')

class Seeder extends ReadyResource {
  constructor (path, key) {
    super()
    this.path = path
    this.key = key
    this.store = null
    this.bee = null
  }

  async _open () {
    let core = null

    if (this.path) {
      core = new Hypercore(this.path)
    } else {
      this.store = new Corestore(ram)
      await this.store.ready()
      core = this.store.get({ publicKey: this.key })
    }

    this.bee = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
    await core.ready()
    await this.bee.ready()
  }

  async _close () {
    if (this.store) await this.store.close()
    await this.bee.close()
  }

  list () {
    return this.bee.createReadStream()
  }

  add (key, type, description) {
    return this.bee.put(key, { type, description })
  }

  remove (key) {
    return this.bee.del(key)
  }

  edit (key, type, description) {
    return this.bee.put(key, { type, description })
  }
}

module.exports = {
  Seeder
}
