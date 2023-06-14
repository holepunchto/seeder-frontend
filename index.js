import holepunch from 'holepunch://app'
import Hyperbee from 'hyperbee'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'

const swarm = new Hyperswarm()
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

const showView = () => {
  document.getElementById('view-table').classList.remove('disabled')
  document.getElementById('add-bee').classList.add('disabled')
  document.getElementById('add-form').classList.add('disabled')
  document.getElementById('placeholder').classList.add('disabled')
  document.getElementById('bee-placeholder').classList.add('disabled')
  document.getElementById('tab-view').classList.add('active')
  document.getElementById('tab-add').classList.remove('active')
  document.getElementById('view-public-key').classList.remove('disabled')
}

const showAdd = () => {
  document.getElementById('add-form').classList.remove('disabled')
  document.getElementById('view-table').classList.add('disabled')
  document.getElementById('add-bee').classList.add('disabled')
  document.getElementById('placeholder').classList.add('disabled')
  document.getElementById('bee-placeholder').classList.add('disabled')
  document.getElementById('tab-view').classList.remove('active')
  document.getElementById('tab-add').classList.add('active')
  document.getElementById('view-public-key').classList.add('disabled')
}

const showAddBee = () => {
  document.getElementById('add-bee').classList.remove('disabled')
  document.getElementById('view-table').classList.add('disabled')
  document.getElementById('add-form').classList.add('disabled')
  document.getElementById('view-public-key').classList.add('disabled')
  document.getElementById('placeholder').classList.add('disabled')
  document.getElementById('bee-placeholder').classList.add('disabled')
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

  let hasEntries = false
  const tableBody = document.getElementById('view-table-body')
  tableBody.innerHTML = ''

  for await (const entry of bee.createReadStream()) {
    hasEntries = true
    tableBody.append(createTableRow(entry))
  }

  document.getElementById('view-public-key-value').innerHTML = 'Public key: ' + core.key.toString('hex')

  document.getElementById('add-button').onclick = async () => {
    const { key, type, description } = getNewEntry()
    await bee.put(key, { type, description })
    await renderBee(name)
    showView()
  }

  if (!hasEntries) {
    document.getElementById('bee-placeholder').classList.remove('disabled')
    document.getElementById('view-table').classList.add('disabled')
  } else {
    document.getElementById('bee-placeholder').classList.add('disabled')
    document.getElementById('view-table').classList.remove('disabled')
  }
}

const setActiveBee = (name) => {
  Array.from(document.getElementById('seeders').children).forEach(e => e.classList.remove('active'))
  Array.from(document.getElementById('seeders').children).find(e => e.getAttribute('name') === name).classList.add('active')
}

// Render list of bees as buttons

const renderBees = async (bees) => {
  const beeButtons = document.getElementsByClassName('bee-button')
  while (beeButtons.length > 0) {
    beeButtons[beeButtons.length - 1].remove()
  }

  for await (const entry of bees.createReadStream()) {
    const beeButton = document.createElement('button')
    beeButton.setAttribute('name', entry.key)
    beeButton.innerHTML = entry.key
    beeButton.classList.add('bee-button')
    document.getElementById('seeders').prepend(beeButton)
    beeButton.onclick = async () => {
      setActiveBee(entry.key)
      showView()
      await renderBee(entry.key)
    }
  }
}

const onBeeNameInput = (event) => {
  if (event.target.value) {
    document.getElementById('add-bee-button').classList.remove('disabled-button')
    document.getElementById('add-bee-button').classList.add('enabled-button')
  } else {
    document.getElementById('add-bee-button').classList.add('disabled-button')
    document.getElementById('add-bee-button').classList.remove('enabled-button')
  }
}

const onAddEntryInput = (event) => {
  if (document.getElementById('public-key').value.length !== 0 &&
      document.getElementById('description').value.length !== 0) {
    document.getElementById('add-button').classList.remove('disabled-button')
    document.getElementById('add-button').classList.add('enabled-button')
  } else {
    document.getElementById('add-button').classList.add('disabled-button')
    document.getElementById('add-button').classList.remove('enabled-button')
  }
}

const addBee = async (name, file) => {
  const core = store.get({ name: '__top__' })
  const bees = new Hyperbee(core, { keyEncoding: 'utf-8' })
  await core.ready()
  await bees.ready()
  await bees.put(name)

  // add file if (file) {}

  await renderBees(bees)
  await renderBee(name)
  setActiveBee(name)
}

window.onload = async () => {
  await store.ready()
  const core = store.get({ name: '__top__' })
  const bees = new Hyperbee(core, { keyEncoding: 'utf-8' })
  await core.ready()
  await bees.ready()

  await renderBees(bees)

  swarm.on('connection', (conn) => {
    store.replicate(conn)
  })

  let lastBee = null

  for await (const entry of bees.createReadStream()) {
    const name = entry.key
    lastBee = name
    const core = store.get({ name })
    await core.ready()
    swarm.join(core.discoveryKey)
    swarm.join(core.key)
  }
  swarm.flush()

  if (lastBee) {
    await renderBee(lastBee)
    setActiveBee(lastBee)
  }

  document.getElementById('tab-view').onclick = showView
  document.getElementById('tab-add').onclick = showAdd
  document.getElementById('add-bee-toogle').onclick = showAddBee
  document.getElementById('bee-name').onkeyup = onBeeNameInput
  document.getElementById('public-key').onkeyup = onAddEntryInput
  document.getElementById('description').onkeyup = onAddEntryInput
  document.getElementById('add-bee-button').onclick = async () => {
    const name = document.getElementById('bee-name').value
    if (name.length) await addBee(name)
    const core = store.get({ name })
    await core.ready()
    swarm.join(core.discoveryKey)
    swarm.flush()
  }
}
