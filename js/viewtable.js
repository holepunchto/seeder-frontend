import { html } from 'htm/preact'
import Id from 'hypercore-id-encoding'

function ViewTable (props) {
  const removeEntry = (key) => {
    if (!props.readonly) {
      props.setEntries(props.entries.filter(e => e.key.toString('hex') !== key.toString('hex')))
      props.bee.del(key)
    }
  }

  const formatEntries = () => {
    return props.entries.map(e => {
      return html`
              <tr>
                <td class="monospace">${Id.encode(e.key)}</td>
                <td>${e.value.seeders ? e.value.type + '/seeder' : e.value.type}</td>
                <td>${e.value.description}</td>
                <td class="${!props.readonly ? 'remove-button' : 'remove-button-disabled'}" onclick=${() => removeEntry(e.key)}>Remove</td>
              </tr>
        `
    })
  }

  return html`
   <div class="view-table">
     <div class="${props.entries.length ? 'disabled' : 'bee-placeholder'}">
       <h3> This seeder does not have any entry yet. Use the "Add" tab to add a new entry </h3>
     </div>
     <table class="bee-entries"  class="${!props.entries.length ? 'disabled' : ''}">
       <thead>
         <tr>
           <th>Key</th>
           <th>Type</th>
           <th>Description</th>
           <th>Actions</th>
         </tr>
       </thead>
       <tbody class="view-table-body">
            ${formatEntries()}
       </tbody>
     </table>
   </div>
`
}
export default ViewTable
