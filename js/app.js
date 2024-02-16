import { html, render } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks'
import Tab from './tab.js'
import Placeholder from './placeholder.js'
import ViewTable from './viewtable.js'
import BeeInformation from './beeinformation.js'
import AddEntry from './addentry.js'
import AddBee from './addbee.js'
import AllowedPeers from './allowed-peers.js'
import DeleteBeePopup from './delete-bee-popup.js'
import pear from 'pear'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import Hyperswarm from 'hyperswarm'
import SeedBee from 'seedbee'
import Id from 'hypercore-id-encoding'

function App (props) {
  const [store, setStore] = useState(null)
  const [entries, setEntries] = useState([])
  const [bee, setBee] = useState(null)
  const [bees, setBees] = useState([])
  const [view, setView] = useState('main')
  const [db, setDB] = useState(null)
  const [activeBeeName, setActiveBeeName] = useState(null)
  const [swarm, setSwarm] = useState(null)
  const [updateInterval, setUpdateInterval] = useState(null)
  const [readonly, setReadonly] = useState(true)
  const [toDelete, setToDelete] = useState(null)

  const getBeesDB = async (store) => {
    const core = store.get({ name: '__top__' })
    const bees = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
    await core.ready()
    await bees.ready()
    return bees
  }

  const getBeeByName = async (store, name) => {
    const core = store.get({ name })
    const bee = new SeedBee(core)
    await core.ready()
    await bee.ready()
    return bee
  }

  const getBeeByKey = async (store, key) => {
    const core = store.get(key)
    const bee = new SeedBee(core)
    await core.ready()
    await bee.ready()
    return bee
  }

  const setReadOnlyInterval = (bee) => {
    setUpdateInterval(setInterval(async () => {
      const entries = []
      for await (const entry of bee.entries()) {
        entries.push(entry)
      }
      setEntries(entries)
    }, 1000))
  }

  const renderMain = () => {
    if (bee && activeBeeName) {
      return html`
        <${ViewTable} entries=${entries} setEntries=${setEntries} bee=${bee} readonly=${readonly}/>
        <${BeeInformation} bee=${bee}/>
      `
    } else {
      return html`
        <${Placeholder} bees=${bees} activeBeeName=${activeBeeName}/>
      `
    }
  }

  const renderAddEntry = () => {
    return html`
      <${AddEntry} bee=${bee} setEntries=${setEntries} setView=${setView}/>
    `
  }

  const renderAddBee = () => {
    return html`
      <${AddBee} swarm=${swarm} bees=${bees} db=${db} setBees=${setBees} store=${store} setView=${setView} setActiveBeeName=${setActiveBeeName}/>
    `
  }

  const renderAllowedPeers = () => {
    return html`
      <${AllowedPeers} bee=${bee} setView=${setView}/>
    `
  }

  const renderDeletePopup = () => {
    return html`
      <${DeleteBeePopup} setActiveBeeName=${setActiveBeeName} toDelete=${toDelete} setToDelete=${setToDelete} setBees=${setBees} db=${db}/>
    `
  }

  const renderPublicKey = () => {
    return html`
      <p class="swarm-public-key">Swarm public key: ${Id.encode(swarm.keyPair.publicKey)}</p>
    `
  }

  useEffect(async () => {
    const store = new Corestore(pear.config.storage).namespace('pear-seeder-v2')
    await store.ready()
    const beesDB = await getBeesDB(store)
    const keyPair = await store.createKeyPair('seeder-frontend')
    const swarm = new Hyperswarm({ keyPair })
    let activeBee = null
    for await (const beeInfo of beesDB.createReadStream()) {
      if (!activeBee) {
        if (!beeInfo.value.readonly) {
          activeBee = await getBeeByName(store, beeInfo.key)
        } else {
          activeBee = await getBeeByKey(store, Id.decode(beeInfo.value.key))
        }
        setBee(activeBee)
        setActiveBeeName(beeInfo.key)
      }
      swarm.join(Buffer.from(beeInfo.value.discoveryKey, 'hex'))
      setBees(e => [...e, beeInfo])
    }

    swarm.join(beesDB.core.discoveryKey)
    swarm.on('connection', (conn) => store.replicate(conn))
    swarm.flush()

    if (activeBee) {
      setReadonly(!activeBee.core.writable)
      for await (const entry of activeBee.entries()) {
        setEntries(e => [...e, entry])
      }
      if (!activeBee.core.writable) {
        setReadOnlyInterval(activeBee)
      }
    }

    setStore(store)
    setDB(beesDB)
    setSwarm(swarm)
  }, [])

  useEffect(async () => {
    if (!activeBeeName) {
      setBee(null)
      setEntries([])
      setReadonly(true)
      if (updateInterval) clearInterval(updateInterval)
    }
    const activeBee = bees.find(e => e.key === activeBeeName)
    if (activeBee && store) {
      const selectedBee = !activeBee.value.readonly ? await getBeeByName(store, activeBee.key) : await getBeeByKey(store, Id.decode(activeBee.value.key))
      const updatedEntries = []
      for await (const entry of selectedBee.entries()) {
        updatedEntries.push(entry)
      }
      setActiveBeeName(activeBee.key)
      setBee(selectedBee)
      setEntries(updatedEntries)
      setReadonly(activeBee.value.readonly)

      if (updateInterval) {
        clearInterval(updateInterval)
      }
      if (activeBee.value.readonly) { // No need for interval if bee is local
        setReadOnlyInterval(selectedBee)
      }
    }
  }, [activeBeeName])

  return html`
    <${Tab} setToDelete=${setToDelete} readonly=${readonly} bees=${bees} setView=${setView} activeBeeName=${activeBeeName} setActiveBeeName=${setActiveBeeName}  view=${view}/>
    <div>
      ${view === 'main' && renderMain()}
      ${view === 'add-entry' && renderAddEntry()}
      ${view === 'add-bee' && renderAddBee()}
      ${view === 'allowed-peers' && renderAllowedPeers()}
      ${toDelete && renderDeletePopup()}
      ${view === 'main' && swarm && renderPublicKey()}
    </div>
  `
}

render(html`<${App}/>`, document.body)
