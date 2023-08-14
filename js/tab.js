import { html } from 'htm/preact'

function Tab (props) {
  const deleteBee = (event, name) => {
    event.stopPropagation()
    props.setToDelete(name)
  }

  const renderBees = (bees, activeBeeName) => {
    return bees.map((e, i) => {
      const isActive = (e) => e.key === activeBeeName && (props.view === 'main' || props.view === 'add-entry')
      const setActiveBeeName = () => {
        props.setActiveBeeName(e.key)
        props.setView('main')
      }
      return html`
            <button name="${e.key}" onclick=${setActiveBeeName} class=${isActive(e) ? 'bee-button active' : 'bee-button'}>
              ${!e.value.readonly ? e.key : e.key + ' (read only)'}
              <label class="remove-button" onclick=${(event) => deleteBee(event, e.key)}>[x]</label>
            </button>
        `
    })
  }

  const addEntryOnClick = () => {
    if (!props.readonly) {
      props.setView('add-entry')
    }
  }

  const allowedPeersOnClick = () => {
    if (!props.readonly) {
      props.setView('allowed-peers')
    }
  }

  const addEntryClass = () => {
    return (props.view === 'add-entry' ? 'active' : '') + (props.readonly ? ' unactive' : '')
  }

  const allowedPeersClass = () => {
    return (props.view === 'allowed-peers' ? 'active' : '') + (props.readonly ? ' unactive' : '')
  }

  return html`
    <div class="tab">
      <button class="tab-view" class="${props.view === 'main' ? 'active' : ''}" onclick=${() => props.setView('main')}>View</button>
      <button class="tab-add" class="${addEntryClass()}" onclick=${addEntryOnClick}>Add Entry</button>
      <button class="tab-peers" class="${allowedPeersClass()}" onclick=${allowedPeersOnClick}>Allowed Peers</button>
      <div class="seeders">
        ${renderBees(props.bees, props.activeBeeName)}
        <button class="add-bee-toogle" class="${props.view === 'add-bee' ? 'active' : ''}"  onclick=${() => props.setView('add-bee')}>New...</button>
      </div>
    </div>
`
}

export default Tab
