// Define category benchmarks
const categoryBenchmarks = {
    Food: 300,
    Transport: 150,
    Entertainment: 100,
    Utilities: 200,
    Other: 50
};

let expenses = [];
let monthlyIncome = 0;

// Handle income form submission
document.getElementById("income-form").addEventListener("submit", function (event) {
    event.preventDefault();

    monthlyIncome = parseFloat(document.getElementById("monthly-income").value);

    if (monthlyIncome > 0) {
        updateBudgetSummary();
        provideAIAdvice();
        alert("Monthly income set successfully!");
    } else {
        alert("Please enter a valid monthly income.");
    }
});

// Handle expense form submission
document.getElementById("expense-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const expenseName = document.getElementById("expense-name").value;
    const expenseAmount = parseFloat(document.getElementById("expense-amount").value);
    const expenseCategory = document.getElementById("expense-category").value;

    if (expenseAmount > 0) {
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

        // Clear the form inputs
        document.getElementById("expense-form").reset();
    } else {
        alert("Please enter a valid expense amount.");
    }
});

// Update the expenses table
function updateExpenseTable() {
    const tableBody = document.getElementById("expense-table").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Clear existing table rows

    expenses.forEach((expense, index) => {
        const justification = getExpenseJustification(expense);

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${justification}</td>
            <td><button class="delete-button" onclick="deleteExpense(${index})">Delete</button></td>
        `;
    });
}

// Determine justification for an expense
function getExpenseJustification(expense) {
    const benchmark = categoryBenchmarks[expense.category] || 0; // Default to 0 if category not found
    const percentageOfBenchmark = (expense.amount / benchmark) * 100;

    if (percentageOfBenchmark <= 120) {
        return "Justified";
    } else if (percentageOfBenchmark <= 150) {
        return "More Than Expected";
    } else {
        return "Over Than Expected";
    }
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
    const suggestedBudget = totalExpenses + 100; // Adjusting budget as a fixed additional amount
    const savingsGoal = Math.max(0, monthlyIncome - totalExpenses);

    document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);
    document.getElementById("suggested-budget").textContent = suggestedBudget.toFixed(2);
    document.getElementById("savings-goal").textContent = savingsGoal.toFixed(2);
}

// AI advice generation with integration
async function provideAIAdvice() {
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const suggestedBudget = totalExpenses + 100; // Adjusted suggested budget value
    const savingsGoal = Math.max(0, monthlyIncome - totalExpenses);

    try {
        const response = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer OOxKcSIlcyvtaOiXLSbxrnkRmaI2sKlakJGl1PKb` // Replace with your Cohere API key
            },
            body: JSON.stringify({
                model: "command-xlarge",
                prompt: `Expenses: ${JSON.stringify(expenses)}\nTotal: ${totalExpenses}\nSuggested Budget: ${suggestedBudget}. Provide detailed advice.`,
                max_tokens: 200 // Increased for longer responses
            }),
            
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response from Cohere API:", errorText);
            throw new Error("Failed to fetch AI advice");
        }

        const aiAdvice = await response.json();
        console.log("AI Advice Response:", aiAdvice); // Log the response object

        // Extract the advice text from the first item in the "generations" array
        const adviceMessage = aiAdvice?.generations[0]?.text || "No advice available.";

        // Display AI advice in the UI
        document.getElementById("aiAdviceText").textContent = adviceMessage;

    } catch (error) {
        document.getElementById("aiAdviceText").textContent = "Could not retrieve AI advice. Please check your connection.";
        console.error("Error in Cohere API:", error);
    }
}

// Check if AI advice is needed on page load
document.addEventListener("DOMContentLoaded", function () {
    if (expenses.length > 0) {
        provideAIAdvice();
    } else {
        document.getElementById("aiAdviceText").textContent = "Add some expenses and set your income to see how AI can help you!";
    }
});
