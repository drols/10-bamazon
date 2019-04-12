var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  queryAllItems();
});

function queryAllItems () {
  connection.query("SELECT * FROM products", function(err, res) {
    for (var i = 0; i < res.length; i++) {
        console.log("-----------------------------------");
        console.log("Item #: " + res[i].item_id);
        console.log("Product: " + res[i].product_name);
        console.log("Department: " + res[i].department_name);
        console.log("Price: $" + res[i].price);
        console.log("Stock: " + res[i].stock_quantity);
    }
    purchase();
  });
};

function validateInput (value) {
    var integer = Number.isInteger(parseFloat(value))
    var sign = Math.sign(value)

    if (integer && (sign === 1)) {
        return true;
    } else {
        return "Please enter a number greater than zero."
    }
}
function purchase () {
  inquirer.prompt([{
      type: "input",
      name: "item_id",
      message: "Please enter the item # of the item you would like to purchase",
      validate: validateInput,
      filter: Number
    },
    {
          type: "input",
                name: "quantity",
                message: "How many would you like to purchase?",
                validate: validateInput,
                filter: Number
    }]).then(function(purchase) {
            let item = purchase.item_id
            let quantity = purchase.quantity

            let queryStr = "SELECT * FROM products WHERE ?";

            connection.query(queryStr, { item_id: item }, function(err, res) {
                if (err) throw err

                if (res.length === 0) {
                    console.log("ERROR: Invalid Item #. Please enter a valid item #.")
                    queryAllItems()
                } else {

                    if (quantity <= res[0].stock_quantity) {
                        console.log(res[0].product_name + " is in stock! Placing order now!")
                        console.log("\n")

                        var updateQueryStr = "UPDATE products SET stock_quantity = " + (res[0].stock_quantity - quantity) + " WHERE item_id = " + item

                        connection.query(updateQueryStr, function(err, data) {
                            if (err) throw err;

                            console.log("Thank you! You're order will arrive soon!");
                            console.log("Your total is $" + res[0].price * quantity)
                            console.log("Thank you for shopping at bamazon!")
                            console.log("---------------")
                            console.log("Have a wonderful day!")

                            connection.end();
                        })
                    } else {
                        console.log("Sorry, there is not enough " + res[0].product_name + " in stock.")
                        console.log("Your order can not be placed")
                        console.log("Please check the quantity")

                        setTimeout(function() { queryAllItems() }, 3000)
                    }


                }
            })


        })
}