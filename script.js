let expenses = [];

// Handle form submission
document.getElementById("expense-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const expenseName = document.getElementById("expense-name").value;
    const expenseAmount = parseFloat(document.getElementById("expense-amount").value);
    const expenseCategory = document.getElementById("expense-category").value;

    // Add new expense
    const newExpense = {
        name: expenseName,
        amount: expenseAmount,
        category: expenseCategory
    };
    
    expenses.push(newExpense);
    updateExpenseTable();
    updateBudgetSummary();
    provideAIAdvice();
});

// Update the expenses table
function updateExpenseTable() {
    const tableBody = document.getElementById("expense-table").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Clear existing table rows

    expenses.forEach((expense, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td><button class="delete-button" onclick="deleteExpense(${index})">Delete</button></td>
        `;
    });
}

// Delete an expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    updateExpenseTable();
    updateBudgetSummary();
    provideAIAdvice();
}

// Update budget summary
function updateBudgetSummary() {
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const suggestedBudget = totalExpenses * 1.2; // Suggested budget is 120% of total expenses

    document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);
    document.getElementById("suggested-budget").textContent = suggestedBudget.toFixed(2);
}

// AI advice generation with more detailed feedback
function provideAIAdvice() {
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const suggestedBudget = totalExpenses * 1.2;
    const categories = {};

    // Categorize expenses
    expenses.forEach(expense => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += expense.amount;
    });

    let advice = "";
    let overspendingCategories = [];
    let underspendingCategories = [];

    // Check if user is overspending or underspending in any category
    for (const category in categories) {
        const categoryAmount = categories[category];
        const categoryBudget = suggestedBudget / Object.keys(categories).length; // Dividing total budget equally among categories

        if (categoryAmount > categoryBudget) {
            overspendingCategories.push(`${category}: $${categoryAmount.toFixed(2)}`);
        } else if (categoryAmount < categoryBudget * 0.5) {
            underspendingCategories.push(`${category}: $${categoryAmount.toFixed(2)}`);
        }
    }

    // Provide feedback based on spending
    if (overspendingCategories.length > 0) {
        advice += `You are overspending in the following categories: ${overspendingCategories.join(', ')}. Consider cutting down on these expenses.\n\n`;
    }

    if (underspendingCategories.length > 0) {
        advice += `You're underspending in the following categories: ${underspendingCategories.join(', ')}. You may want to allocate some funds to these categories to balance your budget.\n\n`;
    }

    if (totalExpenses > suggestedBudget) {
        advice += "You're spending more than your suggested budget. Try reviewing your discretionary spending to stay within your budget.\n";
    } else if (totalExpenses < suggestedBudget * 0.5) {
        advice += "You're on track! You're well within your budget. Keep up the good work.\n";
    } else {
        advice += "Your spending is in a good range, but keep an eye on larger categories.\n";
    }

    // Additional advice based on spending trends
    const avgSpendingPerDay = totalExpenses / (new Date().getDate());  // Approximate daily spending
    if (avgSpendingPerDay > 50) {  // Example threshold
        advice += "Your daily spending rate seems high. Consider tracking your expenses more closely or setting daily limits.\n";
    }

    document.getElementById("aiAdviceText").textContent = advice;
}
