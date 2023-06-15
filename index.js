import tinyConfig from 'tiny-configs'
import holepunch from 'holepunch://app'
import Hyperbee from 'hyperbee'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import { readFile } from 'fs/promises'

const swarm = new Hyperswarm()
const store = new Corestore(holepunch.config.storage)
let seederFile = null

function createTableRow (entry, bee) {
  const row = document.createElement('tr')
  const key = document.createElement('td')
  const type = document.createElement('td')
  const description = document.createElement('td')
  const remove = document.createElement('td')

  key.innerHTML = entry.key.toString('hex')
  type.innerHTML = entry.value.type
  description.innerHTML = entry.value.description || '-'
  remove.innerHTML = 'Remove'
  remove.classList.add('remove-button')

  row.append(key)
  row.append(type)
  row.append(description)
  row.append(remove)

  remove.onclick = () => {
    row.remove()
    bee.del(entry.key)
    if (!document.getElementById('view-table-body').children.length) {
      document.getElementById('bee-entries').classList.add('disabled')
      document.getElementById('bee-placeholder').classList.remove('disabled')
    }
  }

  return row
}

function onBeeNameInput (event) {
  if (event.target.value) {
    document.getElementById('add-bee-button').classList.remove('disabled-button')
    document.getElementById('add-bee-button').classList.add('enabled-button')
  } else {
    document.getElementById('add-bee-button').classList.add('disabled-button')
    document.getElementById('add-bee-button').classList.remove('enabled-button')
  }
}

function onAddEntryInput (event) {
  if (document.getElementById('public-key').value.length !== 0 &&
      document.getElementById('description').value.length !== 0) {
    document.getElementById('add-button').classList.remove('disabled-button')
    document.getElementById('add-button').classList.add('enabled-button')
  } else {
    document.getElementById('add-button').classList.add('disabled-button')
    document.getElementById('add-button').classList.remove('enabled-button')
  }
}

function resetAddBeeForm () {
  seederFile = null
  document.getElementById('drag-and-drop-text').innerHTML = 'Drag a seeder file here'
  document.getElementById('bee-name').value = ''
}

async function onAddBeeButton () {
  const name = document.getElementById('bee-name').value
  if (name.length) {
    await addBee(name)
    const bee = await getBeeByName(name)
    swarm.join(bee.core.discoveryKey)
    swarm.flush()
    activateTabs()
    showView()
  }
}

async function onDropFile (event) {
  event.preventDefault()
  event.stopPropagation()
  const file = event.dataTransfer.files[0]
  seederFile = tinyConfig.parse(await readFile(file.path))
  document.getElementById('drag-and-drop-text').innerHTML = 'File: ' + file.path
}

function setActiveBee (name) {
  Array.from(document.getElementById('seeders').children).forEach(e => e.classList.remove('active'))
  Array.from(document.getElementById('seeders').children).find(e => e.getAttribute('name') === name).classList.add('active')
}

function showView () {
  document.getElementById('add-bee').classList.add('disabled')
  document.getElementById('add-form').classList.add('disabled')
  document.getElementById('placeholder').classList.add('disabled')
  document.getElementById('tab-view').classList.add('active')
  document.getElementById('tab-add').classList.remove('active')
  document.getElementById('view-table').classList.remove('disabled')
  document.getElementById('view-public-key').classList.remove('disabled')
}

function showAdd () {
  document.getElementById('add-form').classList.remove('disabled')
  document.getElementById('view-table').classList.add('disabled')
  document.getElementById('add-bee').classList.add('disabled')
  document.getElementById('placeholder').classList.add('disabled')
  document.getElementById('tab-view').classList.remove('active')
  document.getElementById('tab-add').classList.add('active')
  document.getElementById('view-public-key').classList.add('disabled')
}

function showAddBee () {
  document.getElementById('add-bee').classList.remove('disabled')
  document.getElementById('view-table').classList.add('disabled')
  document.getElementById('add-form').classList.add('disabled')
  document.getElementById('view-public-key').classList.add('disabled')
  document.getElementById('placeholder').classList.add('disabled')
}

function getNewEntry () {
  const key = document.getElementById('public-key').value
  const type = document.getElementById('select-type').value
  const description = document.getElementById('description').value
  return { key, type, description }
}

function activateTabs () {
  document.getElementById('tab-view').onclick = showView
  document.getElementById('tab-add').onclick = showAdd
}

async function getBeeByName (name) {
  await store.ready()
  const core = store.get({ name })
  const bee = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await core.ready()
  await bee.ready()
  return bee
}

async function getBeesDB () {
  await store.ready()
  const core = store.get({ name: '__top__' })
  const bees = new Hyperbee(core, { keyEncoding: 'utf-8' })
  await core.ready()
  await bees.ready()
  return bees
}

// Render single bee in table

async function renderBee (name) {
  const bee = await getBeeByName(name)
  const tableBody = document.getElementById('view-table-body')
  tableBody.innerHTML = ''

  let hasEntries = false
  for await (const entry of bee.createReadStream()) {
    hasEntries = true
    tableBody.append(createTableRow(entry, bee))
  }

  document.getElementById('add-button').onclick = async () => {
    const { key, type, description } = getNewEntry()
    await bee.put(key, { type, description })
    await renderBee(name)
    showView()
  }

  if (!hasEntries) {
    document.getElementById('bee-placeholder').classList.remove('disabled')
    document.getElementById('bee-entries').classList.add('disabled')
  } else {
    document.getElementById('bee-placeholder').classList.add('disabled')
    document.getElementById('bee-entries').classList.remove('disabled')
  }
  document.getElementById('placeholder').classList.add('disabled')
  document.getElementById('view-public-key-value').innerHTML = 'Public key: ' + bee.core.key.toString('hex')
  document.getElementById('view-public-key').classList.remove('disabled')

  return bee
}

// Render list of bees as buttons

async function renderBees (bees) {
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
      await renderBee(entry.key)
      setActiveBee(entry.key)
      showView()
    }
  }
}

async function addBee (name, file) {
  const bees = await getBeesDB()
  const bee = await getBeeByName(name)
  await bees.put(name)

  if (seederFile) {
    await Promise.all(seederFile.map(e => {
      const [type, key] = e.split(' ')
      return bee.put(key, { type })
    }))
    seederFile = null // reset file
  }

  await renderBees(bees)
  await renderBee(name)
  setActiveBee(name)
}

window.onload = async () => {
  const bees = await getBeesDB()
  await renderBees(bees)

  let lastBee = null
  for await (const entry of bees.createReadStream()) {
    const name = entry.key
    const core = store.get({ name })
    await core.ready()
    swarm.join(core.discoveryKey)
    swarm.join(core.key)
    lastBee = name
  }

  if (lastBee) {
    await renderBee(lastBee)
    setActiveBee(lastBee)
    activateTabs()
    showView()
  }

  swarm.on('connection', (conn) => store.replicate(conn))
  swarm.flush()
}

document.getElementById('bee-name').onkeyup = onBeeNameInput
document.getElementById('public-key').onkeyup = onAddEntryInput
document.getElementById('description').onkeyup = onAddEntryInput
document.getElementById('add-bee-button').onclick = onAddBeeButton
document.getElementById('drag-and-drop').addEventListener('drop', onDropFile)
document.getElementById('add-bee-toogle').onclick = () => {
  resetAddBeeForm()
  showAddBee()
}
document.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.stopPropagation()
})
