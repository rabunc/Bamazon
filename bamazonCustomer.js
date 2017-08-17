var inquirer = require("inquirer")
var mysql = require("mysql")

// Connect to database
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889, //8889
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected to db!")
})

function displayItems() {
    connection.query("SELECT * FROM products", function (err, response) {
        if (err) throw err;
        for (i = 0; i < response.length; i++) {
            console.log(response[i].item_id + ": " + response[i].product_name + " - $" + response[i].price)
        }
        purchaseItemPrompt()
    })
}

function purchaseItemPrompt() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What item would you like to purchase? (Enter item number)",
                name: "item_number",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false
                }
            },
            {
                type: "input",
                message: "How many of that item would you like to purchase (Enter Qty)",
                name: "quantity",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false
                }
            }
        ])
        .then(function (response) {
            connection.query("SELECT * FROM products WHERE ?",
                {
                    item_id: parseInt(response.item_number),
                },
                function (err, result) {
                    if (err) throw err;
                    console.log(result[0].stock_quantity)

                    // check quantity to ensure is available
                    if (parseInt(result[0].stock_quantity) - parseInt(response.quantity) > 0) {
                        var newQuantity = parseInt(result[0].stock_quantity) - parseInt(response.quantity)
                        console.log("New Quantity:" + newQuantity)
                        connection.query("UPDATE products SET ? WHERE ?",
                            [{
                                stock_quantity: newQuantity
                            },
                            {
                                item_id: result[0].item_id
                            }],
                            function (err) {
                                if (err) throw err;
                                console.log("Purchase completed! The cost is: $" + result[0].price * response.quantity)
                            })
                    } else {
                        console.log("Insufficient stock! Order cancelled.")
                    }
                }
            )
        })
}


displayItems()
