const Todo = require('../models/Todo')
const HabitCompletion = require('../models/HabitCompletion');
const User = require('../models/User');


module.exports = {
    getTodos: async (req, res) => {
        try {
            const todoItems = await Todo.find({ userId: req.user.id });
            const itemsLeft = await Todo.countDocuments({ userId: req.user.id, completed: true });
            const habitCompletions = await HabitCompletion.find({user: req.user.id}).sort({date: -1});
    
            // Check if the request expects a JSON response (e.g., based on a query parameter or the Accept header)
            if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
                res.json({ todos: todoItems, itemsLeft: itemsLeft, habitCompletions: habitCompletions });
            } else {
                res.render('todos.ejs', {todos: todoItems, left: itemsLeft, habitCompletions: habitCompletions});
            }
        } catch (err) {
            console.log(err);
            res.status(500).send('Server Error');
        }
    },
    createTodo: async (req, res)=>{
        try{
            const newTodo = await Todo.create({todo: req.body.todoItem, completed: false, userId: req.user.id})
            res.json({ newTodo });
            console.log('Todo has been added!')
        }catch(err){
            console.log(err)
        }
    },
    markComplete: async (req, res)=>{
        try{
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: true
            })
            console.log('Marked Complete')
            res.json('Marked Complete')
        }catch(err){
            console.log(err)
        }
    },
    markIncomplete: async (req, res)=>{
        try{
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: false
            })
            console.log('Marked Incomplete')
            res.json('Marked Incomplete')
        }catch(err){
            console.log(err)
        }
    },
    deleteTodo: async (req, res)=>{
        console.log(req.body.todoIdFromJSFile)
        try{
            await Todo.findOneAndDelete({_id:req.body.todoIdFromJSFile})
            console.log('Deleted Todo')
            res.json('Deleted It')
        }catch(err){
            console.log(err)
        }
    },
    logCompletion: async (req, res) => {
        try {
            const {completedCount} = req.body;
            const newCompletion = await HabitCompletion.create({user: req.user.id, completedCount});
            console.log('Habit completion logged!');

            // Optionally send back the updated list of todos and completions
            const todoItems = await Todo.find({user: req.user.id});
            const itemsLeft = await Todo.countDocuments({completed: true, user: req.user.id});
            const habitCompletions = await HabitCompletion.find({user: req.user.id}).sort({date: -1});

            res.json({
                message: 'Completion logged!',
                completion: newCompletion,
                todos: todoItems,
                left: itemsLeft,
                habitCompletions: habitCompletions
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Failed to log completion'});
        }
    },
    deleteCompletion: async (req, res) => {
        try {
            await HabitCompletion.findByIdAndDelete(req.body.completionId);
            console.log('Deleted Completion');
            res.json({message: 'Deleted Completion'});
        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Failed to delete completion'});
        }
    }
}    