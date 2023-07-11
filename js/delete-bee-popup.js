import { html } from 'htm/preact'

function DeleteBeePopup (props) {
  const deleteBee = () => {
    props.db.del(props.toDelete)
    props.setToDelete(null)
    props.setBees(bees => bees.filter(e => e.key !== props.toDelete))
    props.setActiveBeeName(activeBeeName => {
      if (activeBeeName === props.toDelete) {
        return null
      } else {
        return activeBeeName
      }
    })
  }

  const cancel = () => {
    props.setToDelete(null)
  }

  return html`
    <div class="pop-up-background"></div>
    <div class="pop-up">
      <p class="remove-message"> Are you sure you want to remove ${props.toDelete}?</p>
      <p class="pop-up-accept pop-up-accept-enabled" onclick=${deleteBee}> Accept </p>
      <p class="pop-up-cancel" onclick=${cancel}> Cancel </p>
    </div>
  `
}

export default DeleteBeePopup
