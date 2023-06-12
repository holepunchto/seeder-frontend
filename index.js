import holepunch from 'holepunch://app'
import Hyperbee from 'hyperbee'
import Corestore from 'corestore'

const store = new Corestore(holepunch.config.storage)

const createTableRow = (entry) => {
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

  return row
}

const hidePlaceholder = () => {
  document.getElementById('placeholder').classList.add('disabled')
  document.getElementById('view-table').classList.remove('disabled')
}

const showView = () => {
  document.getElementById('view-table').classList.remove('disabled')
  document.getElementById('add-form').classList.add('disabled')
  document.getElementById('tab-view').classList.add('active')
  document.getElementById('tab-add').classList.remove('active')
  document.getElementById('view-public-key').classList.remove('disabled')
}

const showAdd = () => {
  document.getElementById('view-table').classList.add('disabled')
  document.getElementById('add-form').classList.remove('disabled')
  document.getElementById('tab-view').classList.remove('active')
  document.getElementById('tab-add').classList.add('active')
  document.getElementById('view-public-key').classList.add('disabled')
}

const getNewEntry = () => {
  const key = document.getElementById('public-key').value
  const type = document.getElementById('select-type').value
  const description = document.getElementById('description').value
  return { key, type, description }
}

// Render single bee in table

const renderBee = async (name) => {
  const core = store.get({ name })
  const bee = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await core.ready()
  await bee.ready()

  const tableBody = document.getElementById('view-table-body')
  tableBody.innerHTML = ''

  for await (const entry of bee.createReadStream()) {
    tableBody.append(createTableRow(entry))
  }

  document.getElementById('view-public-key-value').innerHTML = 'Public key: ' + core.key.toString('hex')

  document.getElementById('add-button').onclick = async () => {
    const { key, type, description } = getNewEntry()
    await bee.put(key, { type, description })
    const row = createTableRow({ key, value: { type, description } })
    document.getElementById('view-table').append(row)
    showView()
  }
}

const setActiveBee = (bee) => {
  Array.from(document.getElementById('seeders').children).forEach(e => e.classList.remove('active'))
  bee.classList.add('active')
  hidePlaceholder()
}

// Render list of bees as buttons

const renderBees = async (bees) => {
  for await (const entry of bees.createReadStream()) {
    const beeButton = document.createElement('button')
    beeButton.setAttribute('name', entry.key)
    beeButton.innerHTML = entry.key
    document.getElementById('seeders').prepend(beeButton)
    beeButton.onclick = async () => {
      setActiveBee(beeButton)
      await renderBee(entry.key)
      showView()
    }
  }
}

window.onload = async () => {
  document.getElementById('tab-view').onclick = showView
  document.getElementById('tab-add').onclick = showAdd

  await store.ready()
  const core = store.get({ name: '__top__' })
  const bees = new Hyperbee(core, { keyEncoding: 'utf-8' })
  await core.ready()
  await bees.ready()

  await renderBees(bees)
}
