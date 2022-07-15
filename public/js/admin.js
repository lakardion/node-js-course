const deleteProduct = async (btn) => {
  const productId = btn.parentNode.querySelector('[ name=productId ]').value
  const csrf = btn.parentNode.querySelector('[ name=_csrf ]').value
  const request = await fetch(`products/${productId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
  if (request.status === 204) {
    document.querySelector(`article[product-id="${productId}"]`).remove()
  }
}