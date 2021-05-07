let dao = require("../../dao/dao");
const { sign } = require("jsonwebtoken");
const { hashSync, genSaltSync, compareSync } = require("bcryptjs");
const { SECRET_KEY, expiresIn } = require('../../config/config');
var randtoken = require('rand-token');
module.exports = {

    // log in user method

    userlogin: async (req, res) => {
        try {
            let emailId = req.headers.emailid;
            let passkey = req.headers.password;
            if (!emailId || !passkey) {
                return res.status(400).json({ success: true, message: 'Please provide email or password' });
            }
            emailId = emailId.toLowerCase();
            let query = `SELECT * FROM users where emailId = '${emailId}'AND type= 'user'`;
            let data = await dao.sqlQuery(query);
            if (data.length == 0) {
                return res.status(400).json({ success: true, message: 'Incorrect user name' });
            }
            const result = compareSync(passkey, data[0].password);
            if (result) {
                var user = {
                    'username': data.userName,
                    'id': data._id
                }
                const jsontoken = sign(user, SECRET_KEY)
                var refreshToken = randtoken.uid(528);

                return res.status(200).json({
                    success: true,
                    message: "login successfully",
                    token: jsontoken,
                    refreshToken: refreshToken,
                    data: data

                });

            } else {
                return res.status(400).json({ success: true, message: 'You entered wrong password' });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },
    // Create user method

    createUser: async (req, res) => {
        try {
            let body = req.body;
            let firstName = body.firstName;
            let lastName = body.lastName;
            let emailId = body.emailId;
            let password = body.password;
            let mobileNumber = body.mobileNumber;
            if (!firstName || !lastName || !emailId || !password || !mobileNumber) {
                return res.status(400).json({ success: true, message: 'Please fill all details for sign up' });
            }
            emailId = emailId.toLowerCase();
            let userQuery = `SELECT * FROM users where emailId = '${emailId}'`;
            let userData = await dao.sqlQuery(userQuery);
            if (userData.length != 0) {
                if (userData.mobileNumber == mobileNumber) {
                    return res.status(400).json({ success: true, message: 'Mobile number is already existed' });
                } else {
                    return res.status(400).json({ success: true, message: 'Email Id is existed already' });
                }

            }
            var salt = genSaltSync(10);
            var passkey = hashSync(password, salt);
            let query = `INSERT into users (firstName, lastName, emailId, password, mobileNumber) VALUES ('${firstName}', '${lastName}', '${emailId}', '${passkey}', '${mobileNumber}')`
            await dao.sqlQuery(query);
            let _userQuery = `SELECT * FROM users where emailId = '${emailId}'`;
            let _userData = await dao.sqlQuery(_userQuery);
            const accessToken = sign({ id: _userData._id }, SECRET_KEY, {
                expiresIn: expiresIn
            });
            return res.status(200).json({ success: true, "user": _userData, "access_token": accessToken, "expires_in": expiresIn, message: 'user has been added successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },

    //add product to cart

    addToCart: async (req, res) => {
        try {
            let body = req.body;
            let user_id = body.user_id;
            let product_id = body.product_id;
            let cartValue = body.cartValue;
            let count = body.product_Count;
            if (!cartValue || !product_id || !user_id || !count) {
                return res.status(400).json({ success: true, message: 'Kindly provide all details for adding into cart' });
            }
            let checkQuery = `SELECT * FROM cart Where productId = '${product_id}' AND userId = '${user_id}'`;
            let cartData = await dao.sqlQuery(checkQuery);
            if (cartData.length == 0) {
                let query = `INSERT INTO cart (userId, cartValue, productId, productCount) VALUES ('${user_id}', ${cartValue}, '${product_id}', ${count})`
                await dao.sqlQuery(query);

            } else {
                let query = `UPDATE cart SET productCount = ${count}, cartValue = '${cartValue}' WHERE productId = '${product_id}' AND userId = '${user_id}'`;
                await dao.sqlQuery(query);

            }
            let _carts = await dao.sqlQuery(checkQuery);
            return res.status(200).json({ success: true, data: _carts, message: 'Product has been added into your cart successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },

    getCart: async (req, res) => {
        try {
            let user_id = req.headers.userid;
            let checkQuery = `SELECT * FROM cart Where userId = '${user_id}'`;
            let cartData = await dao.sqlQuery(checkQuery);
            return res.status(200).json({ success: true, data: cartData, message: 'Cart list has been fethced successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },
    // Make payment based over cart
    paymentGateway: async (req, res) => {
        try {
            let userId = req.body.userid;
            let checkQuery = `SELECT SUM(cartValue) as totalAmount FROM cart Where userId = '${userId}'`;
            let cartData = await dao.sqlQuery(checkQuery);
            let amount = cartData[0].totalAmount;
            if (amount == null) {
                return res.status(200).json({ success: false, message: 'Your cart is empty' });
            }
            // Here use transaction API for make transactions and save the output of transaction into paymentInfo table where we store payment info and ordered items
            // Dummy transaction as per now
            // After successfull Transaction we will update the order status success or failed
            let transactionOutput = "{refrenceId: 1234333423442454564, status: 'SUCCESS', amount: " + amount + ", transactionDate: '2021-05-07 11:40:29'}";
            let transactionQuery = `INSERT INTO paymentinfo (details, userId ) VALUES ("${transactionOutput}", ${userId})`;
            await dao.sqlQuery(transactionQuery);
            let orderDetails = `SELECT * FROM cart Where userId = '${userId}'`;
            let order_Data = JSON.stringify(await dao.sqlQuery(orderDetails));
            let insertOrders = `INSERT INTO orders (orderDetails, userId, status ) VALUES ('${order_Data}', ${userId}, 'placed')`;
            await dao.sqlQuery(insertOrders);
            let order_query = `SELECT * FROM orders Where userId = '${userId}' AND status = 'placed'`;
            let placed_orders = await dao.sqlQuery(order_query);
            let cartFresh = `DELETE FROM cart WHERE userId = ${userId}`;
            await dao.sqlQuery(cartFresh);
            return res.status(200).json({ success: true, data: placed_orders, message: 'Your order has been placed successfully' });

        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },

    // user specific transaction
    getTransations: async (req, res) => {
        try {
            let userId = req.headers.userid;
            let query = `SELECT * FROm paymentinfo WHERE userId = ${userId}`;
            let PaymentData = await dao.sqlQuery(query);
            return res.status(200).json({ success: true, data: PaymentData, message: 'Your payments details have been fetched successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    }
}