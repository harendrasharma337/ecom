var user = require('../controller/user/user.controller');
var admin = require('../controller/admin/admin.controller');
var token = require('../middleware/authentication');


module.exports = function(router) {
    // User routes
    router.get('/userlogin', user.userlogin);
    router.post('/registerUser', user.createUser );
    router.post('/addToCart', token.check, user.addToCart );
    router.get('/getCart', token.check, user.getCart);
    router.post('/makeOrder', token.check, user.paymentGateway );
    router.get('/getTransations', token.check, user.getTransations);

    //Admin Routes
    router.get('/adminLogin', admin.adminLogin);
    router.get('/listItems', token.check, admin.listItems);
    router.put('/updateProduct', token.check, admin.updateProduct);
    router.post('/addProduct', token.check, admin.addProduct);
    router.get('/listOfcostumers', token.check, admin.listOfcostumers);
    router.get('/listOfTransaction', token.check, admin.listOfTransaction);
}