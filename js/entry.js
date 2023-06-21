import { html } from 'htm/preact'

function Entry (props) {
  return html`
<tr>
  <td>${props.key}</td>
  <td>${props.type}</td>
  <td>${props.description}</td>
  <td onclick=${props.remove}>'Remove'</td>
</tr>
`
}

export default Entry
