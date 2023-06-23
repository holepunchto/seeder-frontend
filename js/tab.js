import { html } from 'htm/preact'

function Tab (props) {
  const renderBees = (bees, activeBeeName) => {
    return bees.map((e, i) => {
      const isActive = (e) => e.key === activeBeeName && (props.view === 'main' || props.view === 'add-entry')
      const setActiveBeeName = () => {
        props.setActiveBeeName(e.key)
        props.setView('main')
      }
      return html`
            <button name="${e.key}" onclick=${setActiveBeeName} class=${isActive(e) ? 'bee-button active' : 'bee-button'}>${!e.value.readonly ? e.key : e.key + ' (read only)'}</button>
        `
    })
  }

  const addEntryOnClick = () => {
    if (!props.readonly) {
      props.setView('add-entry')
    }
  }

  const addEntryClass = () => {
    return (props.view === 'add-entry' ? 'active' : '') + (props.readonly ? ' unactive' : '')
  }

  return html`
    <div class="tab">
      <button id="tab-view" class="${props.view === 'main' ? 'active' : ''}" onclick=${() => props.setView('main')}>View</button>
      <button id="tab-add" class="${addEntryClass()}" onclick=${addEntryOnClick}>Add Entry</button>
      <div id="seeders">
        ${renderBees(props.bees, props.activeBeeName)}
        <button id="add-bee-toogle" class="${props.view === 'add-bee' ? 'active' : ''}"  onclick=${() => props.setView('add-bee')}>New...</button>
      </div>
    </div>
`
}

export default Tab
