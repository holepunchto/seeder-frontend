import { html } from 'htm/preact'

function Tab (props) {
  const renderBees = (bees) => {
    return bees.map(e => {
      return html`
            <button name="${e.key}" class="bee-button">${e.key}</button>
        `
    })
  }

  return html`
    <div class="tab">
      <button id="tab-view">View</button>
      <button id="tab-add">Add Entry</button>
      <div id="seeders">
        ${renderBees(props.bees)}
        <button id="add-bee-toogle" class="active">New...</button>
      </div>
    </div>
`
}
export default Tab
