let dao = require("../../dao/dao");
const { sign } = require("jsonwebtoken");

const { SECRET_KEY, expiresIn } = require('../../config/config');
var randtoken = require('rand-token');
module.exports = {
    /* this is seprate admin log in credentials 
    Kindly add admin in database manually
    with emailId and password, admin password is not encrypted because no method here for adding admin
    Admin dashboard plays vital role but here I did only for task purpose */
    adminLogin: async (req, res) => {
        try {
            let emailId = req.headers.emailid;
            let passkey = req.headers.password;
            if (!emailId || !passkey) {
                return res.status(400).json({ success: true, message: 'Please provide email or password' });
            }
            emailId = emailId.toLowerCase();
            let query = `SELECT * FROM users where emailId = '${emailId}' AND password = 'harryvoot' AND type= 'admin'`;
            let data = await dao.sqlQuery(query);
            if (data.length == 0) {
                return res.status(400).json({ success: true, message: 'Incorrect credentials' });
            }
            let user = {
                'username': data.userName,
                'id': data._id
            }
            const jsontoken = sign(user, SECRET_KEY)
            let refreshToken = randtoken.uid(528);

            return res.status(200).json({
                success: true,
                message: "login successfully",
                token: jsontoken,
                refreshToken: refreshToken,
                data: data

            });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },

    listItems: async (req, res) => {
        try {
            let query = `SELECT * FROM product`;
            let products = await dao.sqlQuery(query);
            return res.status(200).json({ success: true, "data": products, message: 'Product list' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },
/* Send only that field which need to be updated in product and don't forget to send productid in headers
    isActive contains 1 or 0  :::::>> 1 for active and 0 for inactive */
    updateProduct: async (req, res) => {
        try {
            let body = req.body;
            let productId = req.headers.productid;
            let fileds = Object.keys(body);
            let updatedVal = "";
            fileds.map(e => {
                updatedVal += `${e} = "${body[e]}",`;
            })
            updatedVal = updatedVal.substring(0, updatedVal.length - 1);
            let query = `UPDATE product SET ${updatedVal} WHERE _id = '${productId}'`;
            await dao.sqlQuery(query);
            let getProd = `SELECT * FROM product`;
            let product_Data = await dao.sqlQuery(getProd);
            return res.status(200).json({ success: true,data:product_Data, message: 'Product has been updated' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },
// it is used to add new product and it will get activated automatically
    addProduct: async (req, res) => {
        try {
            let body = req.body;
            let productName = body.productName;
            let productsDesc = body.productDesc;
            let price = body.price;
            if (!productName || !productsDesc || !price) {
                return res.status(400).json({ success: true, message: 'All fields are mandatory' });
            }
            productName = productName.toLowerCase();
            let query = `SELECT * FROM product where productName = '${productName}'`;
            let prodData = await dao.sqlQuery(query);
            if (prodData.length != 0) {
                return res.status(400).json({ success: true, message: 'This product is existed already' });
            }
            let insertProd = `INSERT INTO product (productName, price, productDescription) VALUES ('${productName}', '${price}', '${productsDesc}')`;
            await dao.sqlQuery(insertProd);
            let getProd = `SELECT * FROM product`;
            let product_Data = await dao.sqlQuery(getProd);
            return res.status(200).json({ success: true, "data": product_Data, message: 'Product has been added' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },
    // This method provides users' data list and view
    listOfcostumers: async (req, res) => {
        try {
            let userQuery = `SELECT firstName, lastName, emailId, mobileNumber FROM users WHERE type = 'user'`;
            let userData = await dao.sqlQuery(userQuery);
            return res.status(200).json({ success: true, "data": userData, message: 'Users have been fethced' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    },
/* transaction Details==.> in this method userId id optional....>>> If transactions are required for user specific then send userid in headers
    OR for all transaction listing don't send userid in headers */
    listOfTransaction: async (req, res) => {
        try {
            let userId = req.headers.userid;
            let query = `SELECT * FROM paymentinfo`;
            if(userId){
                query = `SELECT * FROM paymentinfo WHERE userId = ${userId}`;
            }
            
            let paymentData = await dao.sqlQuery(query);
            return res.status(200).json({ success: true, "data": paymentData, message: 'Transactions have been fethced' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Something went wrong', error: error }).end('');
        }
    }

}






// END Task (Harendra Sharma)