import { html } from 'htm/preact'

function ViewTable (props) {
  const formatEntries = (entries) => {
    return entries.map(e => {
      return html`
              <tr>
                <td>${e.key.toString('hex')}</td>
                <td>${e.value.seeders ? e.value.type + '/seeder' : e.value.type}</td>
                <td>${e.value.description}</td>
                <td>Remove</td>
              </tr>
        `
    })
  }

  return html`
   <div id="view-table">
     <div id="bee-placeholder" class="disabled">
       <h3> This seeder does not have any entry yet. Use the "Add" tab to add a new entry </h3>
     </div>
     <table id="bee-entries">
       <thead>
         <tr>
           <th>Key</th>
           <th>Type</th>
           <th>Description</th>
           <th>Actions</th>
         </tr>
       </thead>
       <tbody id="view-table-body">
            ${formatEntries(props.entries)}
       </tbody>
     </table>
   </div>
`
}
export default ViewTable
