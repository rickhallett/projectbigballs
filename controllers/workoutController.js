const { Workout } = require('../models/Workout');
const createWorkout = require('../models/createWorkout');
const helpers = require('../utils/helpers');

/**
 * WORKOUT CONTROLLER
 */

const workoutController = {};

workoutController.getNew = (req, res) => {
    res.render('newWorkout', {
        menu_opts: helpers.getSortedExercises(),
    });
};

workoutController.postNew = (req, res) => {
    const workout = createWorkout(req);
    workout.calculateWork();

    workout.save((err) => {
        if (err) {
            console.log('Error saving workouts'.red);
            console.log(err);
        }

        res.redirect(`/workouts/${req.user.username}`);
    });
};

workoutController.getWorkouts = (req, res) => {
    const exerciseMap = res.locals.helpers.createExerciseMap(
        require('../data/exercises.json').exercises
    );

    const name = req.user.username;
    const utils = {
        capitaliseFirstChar: helpers.capitaliseFirstChar,
    };

    Workout.find({ name }, (err, workouts) => {
        if (err) {
            req.flash('error', 'Unable to retrieve workouts.');
            res.render('/');
        }
        res.render('listWorkouts', {
            name,
            workouts,
            helpers: utils,
            exerciseMap,
        });
    });
};

workoutController.getEditWorkout = (req, res) => {
    const { id } = req.params;

    const exerciseMap = res.locals.helpers.createExerciseMap(
        require('../data/exercises.json').exercises
    );

    Workout.findById(id, (err, workout) => {
        if (err) {
            req.flash('error', 'Workout not found');
            res.render(`/workouts/${req.user.username}`);
        }

        res.render('editWorkout', {
            workout,
            exerciseMap,
            menu_opts: helpers.getSortedExercises(),
        });
    });
};

workoutController.postEditWorkout = (req, res) => {
    const { id } = req.params;
    const updatedWorkout = createWorkout(req);
    updatedWorkout.calculateWork();

    Workout.findById(id, (findError, workout) => {
        if (findError) {
            console.log('There was a problem updating the workout.'.red);
            req.flash(
                'error',
                'There was a problem finding this workout. Please contact the site administrator.'
            );
            res.redirect(`/workouts/${req.user.username}`);
        }

        workout._id = id;
        workout.name = updatedWorkout.name;
        workout.date = updatedWorkout.date;
        workout.exercises = updatedWorkout.exercises;
        workout.totalWork = updatedWorkout.totalWork;
        workout.comments = updatedWorkout.comments;

        workout.save((saveError) => {
            if (saveError) {
                console.log('There was a problem saving the workout.'.red);
                req.flash(
                    'error',
                    'There was a problem updating this workout. Please contact the site administrator.'
                );
                res.redirect(`/workouts/${req.user.username}`);
            }

            req.flash('success', 'Workout updated!');
            res.redirect(`/workouts/${req.user.username}`);
        });
    });
};

workoutController.deleteWorkout = (req, res) => {
    const { id } = req.params;

    Workout.findOneAndDelete({ _id: id }, (err) => {
        if (err) {
            console.log('There was a problem deleting the workout'.red);
            req.flash(
                'error',
                'There was a problem updating this workout. Please contact the site administrator.'
            );
        }

        if (!err) {
            req.flash('success', 'Workout deleted!');
        }

        res.redirect(`/workouts/${req.user.username}`);
    });
};

module.exports = workoutController;
