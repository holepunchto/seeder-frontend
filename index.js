const { Seeder } = require('./lib/seeder.js')

const seeders = new Map()

const renderSeeder = async (seeder) => {
  const table = document.getElementById('seeder-table')
  table.innerHTML = ''
  for await (const entry of seeder.list()) {
    const row = document.createElement('tr')
    const key = document.createElement('td')
    const type = document.createElement('td')
    const description = document.createElement('td')
    key.innerHTML = entry.key.toString('hex')
    type.innerHTML = entry.value.type
    description.innerHTML = entry.value.description
    row.append(key)
    row.append(type)
    row.append(description)
    table.append(row)
  }
}

window.onload = async () => {
  document.getElementById('add-seeder-button').onclick = async () => {
    const input = document.getElementById('add-seeder-input').value
    if (seeders.get(input)) return
    const isKey = input.length === 32 && !input.includes('/')
    const seeder = isKey ? new Seeder(null, input) : new Seeder(input, null)
    await seeder.ready()
    seeders.set(input, seeder)
    await renderSeeder(seeder)
  }
}
