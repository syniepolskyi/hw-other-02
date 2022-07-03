const services = {
  showMenu(brand) {
    const menuArr = this.getMenu(brand);
    return menuArr[0].map((e,idx) => (idx+1) 
        + ' - ' + e 
        + ', ' + menuArr[1][idx])
        .join("\n")
  },
  getMenu(brand) {
    const restaurant = restaurants
        .find(e => e.brand === brand);
    if (!restaurant){
        return [[],[]];
    }
    const menu = restaurant.menu;
    return [ Object.keys(menu), Object.values(menu) ];
  },
  addOrder(brand, chosenIndex, amount) {
    const restaurantIndex = restaurants
        .findIndex(e => e.brand === brand);
    if(restaurantIndex === -1){
        alert(`Не знайдено ресторан ${brand}`);
        return '';
    }
    const chosenKey = this.getMenu(brand)[0][chosenIndex-1];
    const chosenPrice = this.getMenu(brand)[1][chosenIndex-1];
    const foundOrderIndex = restaurants[restaurantIndex].order
        .findIndex(el => el.name === chosenKey && el.price === chosenPrice);
    if(foundOrderIndex >= 0){
        restaurants[restaurantIndex].order[foundOrderIndex].amount += amount;
    } else {
        restaurants[restaurantIndex].order
            .push({name: chosenKey, price: chosenPrice, amount: amount});
    }
    return `Ви вибрали позицію: ${chosenKey}, ціна: ${chosenPrice}, кількість: ${amount}`;
  },
  confirmOrder(brand) {
    const restaurantIndex = restaurants
        .findIndex(e => e.brand === brand);
    if(restaurantIndex === -1){
        alert(`Не знайдено ресторан ${brand}`);
        return '';
    }
    if(!restaurants[restaurantIndex].order.length){
        return [];
    }
    let totalOrderInfo = "Попередня інформація вашого замовлення:";
    let totalOrderMsg = "";
    totalOrderMsg = restaurants[restaurantIndex].order
        .reduce((prev, r) => prev + "\n" + r.name + `(${r.price} x ${r.amount})`, totalOrderMsg);
    totalOrderMsg += "\n ВСЬОГО: ";
    totalOrderMsg += restaurants[restaurantIndex].order
        .reduce((prev, r) => prev + r.price * r.amount, 0);
    totalOrderMsg += "\nЧас доставки: " + restaurants[restaurantIndex].deliveryTime;
    if(!confirm(totalOrderInfo + totalOrderMsg + "\n підтверджуєте?")){
        restaurants[restaurantIndex].order = [];
        alert("Замовлення скасовано");
        return [];
    }
    alert("ЗАМОВЛЕННЯ ПІДТВЕРДЖЕНО" + totalOrderMsg);
    return restaurants[restaurantIndex].order
        .splice(0,restaurants[restaurantIndex].order.length);
  },
};
const torpedaDelivery = {
  order: [],
  chosenRestaurant: "",
  getAvailableRestaurants() {
    return restaurants.map((r,idx) => (idx+1)
        + ' - ' + r.brand)
  },
  chooseRestaurant() {
    const promptStr = prompt("Оберіть ресторан (введіть відповідний номер): \n"
        + this.getAvailableRestaurants().join("\n"));
    if (promptStr === null){
        return ;
    }
    const idx = parseInt(promptStr,10);
    if (isNaN(idx) || idx <= 0 || idx > restaurants.length){
        alert("Не розпізнано вибір, спробуйте ще");
        return this.chooseRestaurant();
    }
    this.chosenRestaurant = restaurants[idx-1].brand;
    console.log(this.chooseDishes());
  },
  chooseDishes() {
    let confirmOrder = false;
    let msgStr = "Оберіть позицію меню "
        + "(введіть номер позиції і кількість через пробіл)"
        + ", структура - назва, ціна: \n";
    msgStr += services.showMenu(this.chosenRestaurant);
    const promptStr = prompt(msgStr);
    if (promptStr === null){
        let curOrder = services.confirmOrder(this.chosenRestaurant);
        if(curOrder.length){
            this.order.push({
                restaurant: this.chosenRestaurant, 
                order: curOrder,
                ts: (new Date()).toISOString()
            });
        }
        return this;
    }
    const splitArr = promptStr.split(" ");
    const chosenIndex = parseInt(splitArr[0],10);
    let amount = 1;
    if (splitArr.length > 1){
        amount = parseInt(splitArr[1],10);
    }
    if (isNaN(chosenIndex) 
            || chosenIndex <= 0 
            || chosenIndex > services.getMenu(this.chosenRestaurant)[0].length){
        alert("Не розпізнано вибір, спробуйте ще");
        return this.chooseDishes();
    }
    if(isNaN(amount) || amount <= 0){
        alert("Не розпізнано кількість, спробуйте ще");
        return this.chooseDishes();
    }
    const msg = services.addOrder(this.chosenRestaurant, chosenIndex, amount);
    confirmOrder = !confirm(msg + "\n" + "Додати ще щось у замовлення?");
    if(!confirmOrder){
        return this.chooseDishes();
    }
    let curOrder = services.confirmOrder(this.chosenRestaurant);
    if(curOrder.length){
        this.order.push({
            restaurant: this.chosenRestaurant, 
            order: curOrder,
            ts: (new Date()).toISOString()
        });
    }
    return this;
  },
};