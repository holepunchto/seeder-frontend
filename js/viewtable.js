import { html } from 'htm/preact'

function ViewTable (props) {
  const removeEntry = (key) => {
    props.setEntries(props.entries.filter(e => e.key.toString('hex') !== key.toString('hex')))
    props.bee.del(key)
  }

  const formatEntries = () => {
    return props.entries.map(e => {
      return html`
              <tr>
                <td>${e.key.toString('hex')}</td>
                <td>${e.value.seeders ? e.value.type + '/seeder' : e.value.type}</td>
                <td>${e.value.description}</td>
                <td class="remove-button" onclick=${() => removeEntry(e.key)}>Remove</td>
              </tr>
        `
    })
  }

  return html`
   <div id="view-table">
     <div id="bee-placeholder" class="${props.entries.length ? 'disabled' : ''}">
       <h3> This seeder does not have any entry yet. Use the "Add" tab to add a new entry </h3>
     </div>
     <table id="bee-entries"  class="${!props.entries.length ? 'disabled' : ''}">
       <thead>
         <tr>
           <th>Key</th>
           <th>Type</th>
           <th>Description</th>
           <th>Actions</th>
         </tr>
       </thead>
       <tbody id="view-table-body">
            ${formatEntries()}
       </tbody>
     </table>
   </div>
`
}
export default ViewTable