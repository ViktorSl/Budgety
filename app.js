// budgetController
var budgetController = (function () {

    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    function Expense(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.persentage = -1;
    };

    Expense.prototype.calcPersentage = function (totalInc) {

        if (totalInc > 0) {
            this.persentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.persentage = -1;
        }

    };

    Expense.prototype.getPersentage = function () {
        return this.persentage;
    };

    function calculateTotal(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.total[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        total: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: 0
    }

    return {
        addItem: function (type, desc, value) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === "inc") {
                newItem = new Income(ID, desc, value);
            } else if (type === "exp") {
                newItem = new Expense(ID, desc, value);
            }

            // Add newItem to our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (cur) {
                return cur.id;
            });
            console.log(ids);
            index = ids.indexOf(id);
            console.log(index);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // Calculate total income and expenses 
            calculateTotal("exp");
            calculateTotal("inc");

            // Calculate the budget: income - expenses
            data.budget = data.total.inc - data.total.exp;

            // Calculate the percentage of income that we spent
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePersentages: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPersentage(data.total.inc);
            });
        },

        getPersentages: function () {
            var allPers = data.allItems.exp.map(function (curr) {
                return curr.getPersentage();
            });
            return allPers;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        },

        showData: function () {
            console.log(data);
        }
    }

})();


// UIcontroller
var UIcontroller = (function () {

    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomesContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesValue: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"

    };

    var formatNumber = function (num, type) {

        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInputs: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItem: function (obj, type) {

            var html, newHtml, element;

            //create HTML string with placeholder text
            if (type === "inc") {
                element = DOMStrings.incomesContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            };

            if (type === "exp") {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            };

            //replace the placeholder text with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            //insert HTML into the dom
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

        },

        deleteListItems: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function () {

            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputValue + "," + DOMStrings.inputDescription);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {

            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMStrings.expensesValue).textContent = formatNumber(obj.totalExp, "exp");

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },

        displayPersentages: function (pers) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (pers[index] > 0) {
                    current.textContent = pers[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayDate: function () {

            var now, months, month, year;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;
        },

        changedType: function () {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + "," +
                DOMStrings.inputDescription + "," +
                DOMStrings.inputValue);

                nodeListForEach(fields,function(cur){
                    cur.classList.toggle("red-focus");
                });
            document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
        }
    }
})();


// Global controller
var controller = (function (bdgCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);

    };

    var updateBudget = function () {
        // 1.Calculate the budget
        budgetController.calculateBudget();

        // 2.Return the budget
        var budget = budgetController.getBudget();

        // 3.Display the budget in the UI
        UICtrl.displayBudget(budget);
    };

    var updatePersentage = function () {

        //1.Calculate persentages
        bdgCtrl.calculatePersentages();
        //2.Read persentages from the budget controller
        var pers = bdgCtrl.getPersentages();
        //3.Update the UI
        UICtrl.displayPersentages(pers);

    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1.Get the input field data
        input = UICtrl.getInputs();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2.Add the item to the budget controller
            newItem = bdgCtrl.addItem(input.type, input.description, input.value);

            // 3.Add the item to the UI
            UIcontroller.addListItem(newItem, input.type);

            // 4.Clear input fields
            UIcontroller.clearFields();

            // 5.calculate and update budget
            updateBudget();
            updatePersentage();
        }
    };

    var ctrlDeleteItem = function (event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        splitID = itemID.split("-");

        type = splitID[0];

        ID = parseInt(splitID[1]);

        //1.Delete the item from the data structure
        budgetController.deleteItem(type, ID);

        //2.Delete the item from the UI
        UIcontroller.deleteListItems(itemID);

        //3.Update and show the new budget
        updateBudget();


        console.log(itemID);
        console.log(type);
    }

    return {
        init: function () {
            console.log("App has started");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    };

})(budgetController, UIcontroller);


controller.init();