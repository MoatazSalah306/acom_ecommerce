const CalculateTotal = (cart,req) => {
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].sale_price) {
            total+= (cart[i].sale_price * cart[i].quantity)
        }
        else{
            total+= (cart[i].price * cart[i].quantity)
        }
    }

    req.session.total = total;
    return total;
}

module.exports = CalculateTotal;