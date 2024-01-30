const IsProductInCart = (cart,id) => {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            return true;
        }
    }
    return false;
}

module.exports= IsProductInCart;