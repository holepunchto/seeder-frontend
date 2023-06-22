import { html } from 'htm/preact'

function Tab (props) {
  const renderBees = (bees, activeBeeName) => {
    return bees.map((e, i) => {
      const setActiveBeeName = () => props.setActiveBeeName(e.key)
      return html`
            <button name="${e.key}" onclick=${setActiveBeeName} class=${e.key === activeBeeName ? 'bee-button active' : 'bee-button'}>${ !e.value.readOnly ? e.key : e.key + ' (read only)'}</button>
        `
    })
  }

  return html`
    <div class="tab">
      <button id="tab-view" class="${props.view === 'main' ? 'active' : ''}" onclick=${() => props.setView('main')}>View</button>
      <button id="tab-add" class="${props.view === 'add-entry' ? 'active' : ''}" onclick=${() => props.setView('add-entry')}>Add Entry</button>
      <div id="seeders">
        ${renderBees(props.bees, props.activeBeeName)}
        <button id="add-bee-toogle" class="active"  onclick=${() => props.setView('add-bee')}>New...</button>
      </div>
    </div>
`
}

export default Tab
