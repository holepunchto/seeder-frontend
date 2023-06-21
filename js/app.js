import { html, render } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks'
import Tab from './tab.js'
import Placeholder from './placeholder.js'
import ViewTable from './viewtable.js'
import BeeInformation from './beeinformation.js'
import AddEntry from './addentry.js'
import AddBee from './addbee.js'
import holepunch from 'holepunch://app'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import Hyperswarm from 'hyperswarm'
import SeedBee from 'seedbee'

function App (props) {
  const [store, setStore] = useState(null)
  const [entries, setEntries] = useState([])
  const [bee, setBee] = useState(null)
  const [bees, setBees] = useState([])
  const [view, setView] = useState('main')
  const [db, setDB] = useState(null)
  const [activeBeeName, setActiveBeeName] = useState(null)

  const getBeesDB = async (store) => {
    const core = store.get({ name: '__top__' })
    const bees = new Hyperbee(core, { keyEncoding: 'utf-8' })
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

  const renderMain = () => {
    if (bee) {
      return html`
        <${ViewTable} entries=${entries} setEntries=${setEntries} bee=${bee}/>
        <${BeeInformation} bee=${bee}/>
      `
    } else {
      return html`
        <${Placeholder} bees=${bees}/>
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
      <${AddBee} bees=${bees} db=${db} setBees=${setBees} store=${store} setView=${setView} setActiveBeeName=${setActiveBeeName}/>
    `
  }

  useEffect(async () => {
    const store = new Corestore(holepunch.config.storage)
    await store.ready()
    const beesDB = await getBeesDB(store)
    const swarm = new Hyperswarm()
    let activeBee = null
    for await (const beeInfo of beesDB.createReadStream()) {
      if (!activeBee) {
        activeBee = await getBeeByName(store, beeInfo.key)
        for await (const entry of activeBee.entries()) {
          setEntries(e => [...e, entry])
        }
        setBee(activeBee)
        setActiveBeeName(beeInfo.key)
      }
      setBees(e => [...e, beeInfo])
    }
    setStore(store)
    setDB(beesDB)
    swarm.on('connection', (conn) => store.replicate(conn))
    swarm.flush()
  }, [])

  useEffect(async () => {
    const activeBee = bees.find(e => e.key === activeBeeName)
    if (activeBee && store) {
      const selectedBee = await getBeeByName(store, activeBee.key)
      const updatedEntries = []
      for await (const entry of selectedBee.entries()) {
        updatedEntries.push(entry)
      }
      setActiveBeeName(activeBee.key)
      setBee(selectedBee)
      setEntries(updatedEntries)
    }
  }, [activeBeeName])

  return html`
    <h1>🍐Seeder</h1>
    <${Tab} bees=${bees} setView=${setView} activeBeeName=${activeBeeName} setActiveBeeName=${setActiveBeeName}/>
    ${view === 'main' && renderMain()}
    ${view === 'add-entry' && renderAddEntry()}
    ${view === 'add-bee' && renderAddBee()}
  `
}

render(html`<${App}/>`, document.body)
