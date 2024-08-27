document.addEventListener('DOMContentLoaded', () => {
    // Fetch and set the initial count of items left on page load
    updateItemsLeft(); 

    // Handle clicks on logCompletionButton
    document.querySelector('#logCompletionButton').addEventListener('click', async () => {
        await logCompletion();
    });

    // Handle clicks on deleteCompletionButton
    document.querySelector('#completionList').addEventListener('click', async (event) => {
        const completionButton = event.target.closest('.deleteCompletionButton');
        if (completionButton) {
            await deleteCompletion.call(completionButton);
        }
    });

    // Handle clicks on todo items
    document.body.addEventListener('click', async (event) => {
        const todoItem = event.target.closest('.todoItem');
        if (todoItem) {
            const isCompleted = todoItem.querySelector('span').classList.contains('completed');
            const notCompleted = todoItem.querySelector('span').classList.contains('not');

            if (event.target.matches('.del')) {
                await deleteTodo.call(todoItem);
            } else if (isCompleted) {
                await markIncomplete.call(todoItem);
            } else if (notCompleted) {
                await markComplete.call(todoItem);
            }
        }
    });

    document.querySelector('#chooseForMe').addEventListener('click', () => {
        chooseRandomTodo(); // Call the function to add a border
    });

    // Function to delete a todo item
    async function deleteTodo() {
        const todoId = this.dataset.id; // Get the ID of the todo item
        try {
            const deleteResponse = await fetch('/todos/deleteTodo', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todoIdFromJSFile: todoId }) // Send the ID to the server
            });
            if (deleteResponse.ok) {
                console.log('Todo deleted');
                this.remove(); // Remove the item from the DOM
                await updateItemsLeft(); // Update the items left count after deletion
            }
        } catch (err) {
            console.log(err);
        }
    }

    // Function to mark a todo item as complete
    async function markComplete() {
        const todoId = this.dataset.id; // Get the ID of the todo item
        try {
            const response = await fetch('/todos/markComplete', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todoIdFromJSFile: todoId }) // Send the ID to the server
            });

            if (response.ok) {
                console.log('Marked complete');
                this.querySelector('span').classList.remove('not')
                this.querySelector('span').classList.add('completed', 'line-through'); // Update the UI to show it's completed
                this.classList.replace('bg-blue-700', 'bg-green-800'); // Change the background color to indicate completion
                this.classList.remove('border-highlight')
                await updateItemsLeft(); // Update the items left count
            }
        } catch (err) {
            console.log(err);
        }
    }

    // Function to mark a todo item as incomplete
    async function markIncomplete() {
        const todoId = this.dataset.id; // Get the ID of the todo item
        try {
            const response = await fetch('/todos/markIncomplete', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todoIdFromJSFile: todoId }) // Send the ID to the server
            });

            if (response.ok) {
                console.log('Marked incomplete');
                this.querySelector('span').classList.remove('completed', 'line-through');
                this.querySelector('span').classList.add('not') // Update the UI to show it's incomplete
                this.classList.replace('bg-green-800', 'bg-blue-700'); // Change the background color to indicate incompletion
                await updateItemsLeft(); // Update the items left count
            }
        } catch (err) {
            console.log(err);
        }
    }

    // Function to log completion
    async function logCompletion() {
        const completedCount = document.querySelectorAll('.todoItem span.completed').length;
        try {
            const response = await fetch('/todos/logCompletion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completedCount })
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log(data)
                const completionList = document.getElementById('completionList');
                const completionId = data.completion._id; // Assuming the server returns the ID of the new completion
    
                // Create a new list item dynamically
                const newListItem = document.createElement('li');
                newListItem.className = 'flex flex-row justify-between p-2 my-2 bg-green-800 text-white rounded-lg';
                newListItem.dataset.completionId = completionId; // Set the completion ID on the list item
    
                newListItem.innerHTML = `
                    <span>${new Date().toDateString()} - ${completedCount} ${completedCount === 1 ? 'habit' : 'habits'} completed</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="deleteCompletionButton cursor-pointer w-6 h-6" data-completion-id="${completionId}">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                `;
    
                // Append the new list item to the completion list
                completionList.appendChild(newListItem);
                await updateItemsLeft(); // Update the items left count after logging completion
            } else {
                console.error('Error logging completion:', data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }

    // Function to delete a completion log entry
    async function deleteCompletion() {
        const completionId = this.dataset.completionId;
        console.log('Attempting to delete completion with ID:', completionId); // Add this line

        if (!completionId) {
            console.error('No completion ID found');
            return;
        }
        try {
            const response = await fetch('/todos/deleteCompletion', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completionId })
            });

            const data = await response.json();
            if (response.ok) {
                this.parentElement.remove(); // Remove the completion entry from the DOM
            } else {
                console.error('Error deleting completion:', data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }

    // Handle the submission of a new todo item
    document.querySelector('#todoForm').addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent the default form submission
        const todoInput = document.querySelector('#todoInput');
        const todoText = todoInput.value.trim(); // Get and trim the input value

        if (!todoText) {
            alert('Please enter a todo item.');
            return;
        }

        try {
            const response = await fetch('/todos/createTodo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todoItem: todoText }) // Send the input value as JSON to the server
            });

            if (response.ok) {
                const data = await response.json();
                const newTodo = data.newTodo; // Assuming the server returns the new todo item
                const todoList = document.querySelector('ul');

                // Create a new list item dynamically
                const newTodoItem = document.createElement('li');
                newTodoItem.className = 'todoItem cursor-pointer bg-blue-700 text-gray-200 p-4 rounded-lg shadow-md flex items-center justify-between w-full max-w-xl mx-auto transition ease-in-out duration-300';
                newTodoItem.setAttribute('data-id', newTodo._id);

                newTodoItem.innerHTML = `
                    <span class='not'>${newTodo.todo}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke='currentColor' class='del w-6 h-6'>
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                `;
                todoList.appendChild(newTodoItem); // Add the new item to the DOM
                todoInput.value = ''; // Clear the input field after submission
                await updateItemsLeft(); // Update the items left count
            }
        } catch (err) {
            console.log(err);
        }
    });

    async function chooseRandomTodo() {
        // Get all incomplete todo items
        const todoItems = Array.from(document.querySelectorAll('.todoItem'));
        const incompleteTodos = todoItems.filter(item => item.querySelector('span').classList.contains('not'));

        if (incompleteTodos.length === 0) {
            console.log('No incomplete todos available');
            return;
        }

        // Remove any existing border from previously selected items
        todoItems.forEach(item => item.classList.remove('border-highlight'));

        // Select a random incomplete todo item
        const randomTodo = incompleteTodos[Math.floor(Math.random() * incompleteTodos.length)];

        // Add border to the selected item
        randomTodo.classList.add('border-highlight');
    }



    // Function to update the count of items left to complete
    async function updateItemsLeft() {
        try {
            const response = await fetch('/todos', {
                headers: { 'Accept': 'application/json' }  // Ensure the request expects JSON
            });
            if (response.ok) {
                const data = await response.json();
                const itemsLeft = data.itemsLeft; // Get the items left count from the server response
                document.querySelector('#itemsLeft').textContent = `Habits Completed: ${itemsLeft}`; // Update the UI
            }
        } catch (err) {
            console.log(err);
        }
    }
});
