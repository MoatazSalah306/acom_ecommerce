const IsProductInFavs = (favs,id) =>{
    for (var i = 0; i < favs.length; i++) {
        if (favs[i].id == id) {
            return true;
        }
    }
    return false;
}

module.exports = IsProductInFavs;